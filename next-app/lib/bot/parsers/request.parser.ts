import { RequestCommandInput } from "../types/bot.types"

export function parseRequestCommand(
  text: string,
  ctx: any
): RequestCommandInput {
  const trimmed = text.trim()

  // Remove "/request"
  const withoutCommand = trimmed.replace(/^\/request\s*/, "")

  const parts = withoutCommand.split(/\s+/)

  if (parts.length < 3) {
    throw new Error(
      "Usage: /request <amount> <token> @user [note]"
    )
  }

  const amountRaw = parts[0]
  const tokenRaw = parts[1]
  const targetRaw = parts[2]

  // ---- amount ----
  const amount = Number(amountRaw)
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount. Must be a positive number.")
  }

  // ---- token ----
  const token = tokenRaw.toUpperCase()

  // ---- target ----
  if (!targetRaw.startsWith("@")) {
    throw new Error("Target user must be a valid @username.")
  }

  const targetUsername = targetRaw.slice(1)

  // ---- note ----
  const note = parts.slice(3).join(" ") || ""

  // ---- requester ----
  const from = ctx.from
  if (!from) {
    throw new Error("Unable to identify requester.")
  }

  return {
    amount,
    token,
    targetUsername,
    note,
    requestedBy: {
      telegramId: from.id,
      username: from.username || "unknown",
    },
  }
}