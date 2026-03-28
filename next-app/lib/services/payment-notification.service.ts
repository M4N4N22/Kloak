import crypto from "node:crypto"

import { Payment, PaymentLink, WebhookEndpoint } from "@prisma/client"

import { getBot } from "@/lib/bot/bot"
import { prisma } from "@/lib/prisma"

type PaymentLinkWithCreator = Pick<
  PaymentLink,
  "id" | "requestId" | "title" | "token" | "creatorAddress" | "telegramId"
>

type PaymentForNotification = Pick<
  Payment,
  "id" | "amount" | "token" | "txHash" | "status" | "createdAt"
>

function buildPaymentSuccessPayload(
  link: PaymentLinkWithCreator,
  payment: PaymentForNotification
) {
  return {
    type: "payment.success",
    linkId: link.id,
    requestId: link.requestId,
    paymentId: payment.id,
    txHash: payment.txHash,
    status: payment.status,
    amount: payment.amount.toString(),
    token: payment.token,
    paidAt: payment.createdAt.toISOString(),
    title: link.title,
  }
}

async function notifyTelegramCreator(
  link: PaymentLinkWithCreator,
  payment: PaymentForNotification
) {
  const orFilters = []

  if (link.telegramId) {
    orFilters.push({ telegramId: link.telegramId })
  }

  if (link.creatorAddress) {
    orFilters.push({ walletAddress: link.creatorAddress })
  }

  if (orFilters.length === 0) return

  const telegramUser = await prisma.telegramUser.findFirst({
    where: {
      OR: orFilters,
    },
  })

  if (!telegramUser) return

  const bot = getBot()

  const amount = payment.amount.toString()
  const fullTxHash = payment.txHash
  const shortTxHash = fullTxHash
    ? `${fullTxHash.slice(0, 10)}...${fullTxHash.slice(-8)}`
    : "Unavailable"

  const explorerUrl = fullTxHash
    ? `https://testnet.explorer.provable.com/transaction/${fullTxHash}`
    : null

  const message = [
    "<b>💰 Payment Received!</b>",
    "────────────────────",
    `<b>Product:</b> <code>${link.title}</code>`,
    `<b>Amount:</b> <code>${amount} ${payment.token}</code>`,
    "────────────────────",
    `<b>Link ID:</b> <code>${link.id}</code>`,
    fullTxHash
      ? `<b>Transaction:</b> <a href="${explorerUrl}">${shortTxHash}</a>`
      : `<b>Transaction:</b> <code>${shortTxHash}</code>`,
    "────────────────────",
    `<i>🕒 ${new Date().toISOString().replace('T', ' ').split('.')[0]} UTC</i>`
  ].join("\n");

  const buttons = [];

  // Add Explorer button if URL exists
  if (explorerUrl) {
    buttons.push([{ text: "🔍 View on Explorer", url: explorerUrl }]);
  }

  // Always helpful to provide a shortcut back to the main app
  buttons.push([
    {
      text: "🏠 Main Menu",
      callback_data: "menu"
    }
  ]);

  await bot.api.sendMessage(
    telegramUser.telegramId,
    message,
    {
      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: buttons
      }
    }
  );
}

async function deliverWebhook(
  endpoint: Pick<WebhookEndpoint, "id" | "url" | "secret">,
  link: PaymentLinkWithCreator,
  payment: PaymentForNotification
) {
  const payload = buildPaymentSuccessPayload(link, payment)
  const body = JSON.stringify(payload)
  const timestamp = String(Date.now())
  const signature = endpoint.secret
    ? crypto
      .createHmac("sha256", endpoint.secret)
      .update(`${timestamp}.${body}`)
      .digest("hex")
    : null

  let responseStatus: number | null = null
  let responseBody: string | null = null
  let success = false

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-kloak-event": payload.type,
        "x-kloak-timestamp": timestamp,
        ...(signature ? { "x-kloak-signature": signature } : {}),
      },
      body,
      signal: AbortSignal.timeout(8000),
    })

    responseStatus = response.status
    responseBody = (await response.text()).slice(0, 2000)
    success = response.ok
  } catch (error: any) {
    responseBody = error?.message ?? "Webhook delivery failed"
  }

  await prisma.webhookDelivery.create({
    data: {
      endpointId: endpoint.id,
      linkId: link.id,
      eventType: payload.type,
      targetUrl: endpoint.url,
      payload,
      responseStatus,
      responseBody,
      success,
    },
  })
}

async function notifyKloakAdmin(
  link: PaymentLinkWithCreator,
  payment: PaymentForNotification
) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID

  if (!adminChatId) return

  const bot = getBot()
  const explorerUrl = payment.txHash
    ? `https://testnet.explorer.provable.com/transaction/${payment.txHash}`
    : "Unavailable"

  const message = [
    "*Kloak Payment Alert*",
    "",
    `*Link:* ${link.title} (${link.requestId})`,
    `*Amount:* \`${payment.amount.toString()} ${payment.token}\``,
    `*Status:* ${payment.status}`,
    `*Tx Hash:* \`${payment.txHash ?? "N/A"}\``,
    `*Explorer:* ${explorerUrl}`,
  ].join("\n")

  await bot.api.sendMessage(adminChatId, message, {
    parse_mode: "Markdown",

  })
}

async function resolveCreatorAddress(link: PaymentLinkWithCreator) {
  if (link.creatorAddress) return link.creatorAddress

  if (!link.telegramId) return null

  const telegramUser = await prisma.telegramUser.findUnique({
    where: { telegramId: link.telegramId },
    select: { walletAddress: true },
  })

  return telegramUser?.walletAddress ?? null
}

export async function notifyPaymentSuccess(
  link: PaymentLinkWithCreator,
  payment: PaymentForNotification
) {
  const creatorAddress = await resolveCreatorAddress(link)
  const webhookEndpoints = creatorAddress
    ? await prisma.webhookEndpoint.findMany({
      where: {
        creatorAddress,
        active: true,
      },
      select: {
        id: true,
        url: true,
        secret: true,
      },
    })
    : []

  const results = await Promise.allSettled([
    notifyTelegramCreator(link, payment),
    notifyKloakAdmin(link, payment),
    ...webhookEndpoints.map((endpoint) => deliverWebhook(endpoint, link, payment)),
  ])

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Payment notification failed:", result.reason)
    }
  }
}
