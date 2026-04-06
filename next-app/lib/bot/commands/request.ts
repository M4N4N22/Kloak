import { Context, InlineKeyboard } from "grammy"

import { parseRequestCommand } from "../parsers/request.parser"

export async function handleRequestCommand(ctx: Context) {
  try {
    const text = ctx.message?.text
    if (!text) return

    // 1. Parse
    const parsed = parseRequestCommand(text, ctx)

    const appUrl = process.env.APP_URL || "https://kloak.vercel.app"
    const createUrl = `${appUrl}/payment-links/create`

    await ctx.reply(
      [
        "Create this payment link on the web app first.",
        "",
        `You're asking @${parsed.targetUsername} for *${parsed.amount} ${parsed.token}*.`,
        parsed.note ? `Note: ${parsed.note}` : null,
        "",
        "Once the link is created, come back to Telegram to share it, track it, and get paid alerts.",
      ]
        .filter(Boolean)
        .join("\n"),
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard().url("Open payment links", createUrl),
      },
    )

  } catch (err: unknown) {
    await ctx.reply(
      err instanceof Error ? err.message : "Something went wrong. Try again."
    )
  }
}
