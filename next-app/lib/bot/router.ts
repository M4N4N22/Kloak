import { Bot, Context, InlineKeyboard } from "grammy"
import jwt from "jsonwebtoken"

import { prisma } from "@/lib/prisma"
import { handleInbox } from "./features/inbox/inbox.handler"
import { handleAnalytics } from "@/lib/bot/features/analytics/analytics.handler"

const WEB_APP_URL = "https://kloak.vercel.app"

function buildMainKeyboard() {
  return {
    keyboard: [
      ["📥 My Links", "📊 Analytics"],
      ["🌐 Open Web App", "⚙️ Settings"], // now plain text button
    ],
    resize_keyboard: true,
  }
}
function buildLinkWalletKeyboard(telegramId: string) {
  const token = generateLinkToken(telegramId)
  const appUrl = process.env.APP_URL || WEB_APP_URL
  const link = `${appUrl}/link-telegram?token=${token}`

  return new InlineKeyboard().url("🔗 Link Wallet", link)
}

async function showLinkWalletPrompt(ctx: Context, telegramId: string) {
  return ctx.reply(
    `🔐 *Welcome to Kloak*

To continue, link your wallet.

This allows you to manage your private payment links directly from Telegram.

No transactions will be performed.`,
    {
      parse_mode: "Markdown",
      reply_markup: buildLinkWalletKeyboard(telegramId),
    }
  )
}

async function showSettings(ctx: Context) {
  if (!ctx.from) return

  const telegramId = String(ctx.from.id)

  const user = await prisma.telegramUser.findUnique({
    where: { telegramId },
  })

  if (!user?.walletAddress) {
    return ctx.reply(
      `⚙️ *Settings*

No wallet is currently linked to this Telegram account.

You can link a wallet again anytime to manage payment links, analytics, and notifications.`,
      {
        parse_mode: "Markdown",
        reply_markup: buildLinkWalletKeyboard(telegramId),
      }
    )
  }

  return ctx.reply(
    `⚙️ *Settings*

*Linked wallet:* \`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}\`

If you unlink your wallet, you won't be able to manage your payment links, analytics, or notifications from Telegram.

You can link your wallet again anytime.`,
    {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("Unlink Wallet", "settings_unlink_wallet")
        .row()
        .url("Open Web App", WEB_APP_URL),
    }
  )
}

export function setupRouter(bot: Bot) {
  bot.command("start", async (ctx) => {
    if (!ctx.from) return

    const telegramId = String(ctx.from.id)

    const user = await prisma.telegramUser.upsert({
      where: { telegramId },
      update: {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      },
      create: {
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      },
    })

    if (!user.walletAddress) {
      return showLinkWalletPrompt(ctx, telegramId)
    }

    const text = `
🛡️ *Kloak Companion Bot*
───────────────────
*Node Status:* \`Connected to Aleo\`
*Wallet:* \`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}\`

Use this console to monitor your private links and view shielded transaction analytics.

_Note: Payments and link creation must be performed on the Kloak Web App for maximum security._`.trim()

    return ctx.reply(text, {
      parse_mode: "Markdown",
      reply_markup: buildMainKeyboard(),
    })
  })

  bot.command("settings", showSettings)

  bot.callbackQuery("menu", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      `🔐 *Kloak Control Center*

Manage your private payment links directly from Telegram.`,
      {
        parse_mode: "Markdown",
        reply_markup: buildMainKeyboard(),
      }
    )
  })

  

  bot.hears("📥 My Links", async (ctx) => {
    await handleInbox(ctx, 0)
  })

  bot.callbackQuery(/inbox_(\d+)/, async (ctx) => {
    const page = Number(ctx.match[1])

    await ctx.answerCallbackQuery()
    await handleInbox(ctx, page)
  })

  bot.hears("📊 Analytics", handleAnalytics)
  bot.hears("⚙️ Settings", showSettings)

  bot.hears("🌐 Open Web App", async (ctx) => {
    await ctx.reply("Open Kloak in your browser:", {
      reply_markup: new InlineKeyboard().url("🌐 Open Web App", WEB_APP_URL),
    })
  })

  bot.callbackQuery("settings_unlink_wallet", async (ctx) => {
    await ctx.answerCallbackQuery()

    await ctx.reply(
      `Are you sure you want to unlink your wallet?

You won't be able to manage your payment links, analytics, or notifications from Telegram until you link it again.`,
      {
        reply_markup: new InlineKeyboard()
          .text("Yes, unlink wallet", "settings_confirm_unlink_wallet")
          .text("Cancel", "settings_cancel_unlink_wallet"),
      }
    )
  })

  bot.callbackQuery("settings_cancel_unlink_wallet", async (ctx) => {
    await ctx.answerCallbackQuery({ text: "Wallet remains linked." })
    await showSettings(ctx)
  })

  bot.callbackQuery("settings_confirm_unlink_wallet", async (ctx) => {
    if (!ctx.from) return

    const telegramId = String(ctx.from.id)

    await prisma.telegramUser.update({
      where: { telegramId },
      data: {
        walletAddress: null,
      },
    })

    await ctx.answerCallbackQuery({ text: "Wallet unlinked." })

    await ctx.reply(
      `Wallet unlinked successfully.

You won't be able to manage your payment links, analytics, or notifications from Telegram until you link your wallet again.

You can link it again anytime.`,
      {
        reply_markup: buildLinkWalletKeyboard(telegramId),
      }
    )
  })

  bot.inlineQuery(/share_([a-zA-Z0-9_-]+)/, async (ctx) => {
    console.log("INLINE HIT:", ctx.inlineQuery.query)
    const linkId = ctx.match[1]

    const link = await prisma.paymentLink.findUnique({
      where: { id: linkId },
    })

    if (!link) {
      return await ctx.answerInlineQuery([])
    }

    const amount = link.allowCustomAmount
      ? `Custom ${link.token}`
      : `${Number(link.amount)} ${link.token}`

    const messageText = `
*KLOAK PRIVATE PAYMENT*
───────────────────
💰 *Amount:* \`${amount}\`
📝 *Title:* ${link.title || "Standard Request"}
${link.description ? `\n_${link.description}_` : ""}

🔗 *Payment Link:*
${process.env.APP_URL}/pay/${link.id}
───────────────────
_Powered by Kloak Privacy Protocol_`.trim()

    await ctx.answerInlineQuery(
      [
        {
          type: "article",
          id: link.id,
          title: `💸 Pay ${amount}`,
          description: link.title || "Payment Request",
          input_message_content: {
            message_text: messageText,
            parse_mode: "Markdown",
          },
        },
      ],
      {
        cache_time: 0,
        is_personal: true,
      }
    )
  })
}

function generateLinkToken(telegramId: string) {
  return jwt.sign({ telegramId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  })
}
