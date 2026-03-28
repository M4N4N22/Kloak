import { parseRequestCommand } from "../parsers/request.parser"
import { createPaymentLink } from "@/lib/services/paymentLink.service"
import { formatPaymentMessage } from "../formatters/message.formatter"

export async function handleRequestCommand(ctx: any) {
  try {
    const text = ctx.message?.text
    if (!text) return

    // 1. Parse
    const parsed = parseRequestCommand(text, ctx)

    // Optional: immediate feedback
    await ctx.reply("Creating payment request...")

    // 2. Backend call
    const payment = await createPaymentLink(parsed)

    // 3. Format response
    const message = formatPaymentMessage(payment, parsed)

    // 4. Send final message
    await ctx.reply(message.text, {
      parse_mode: "Markdown",
      reply_markup: message.keyboard,
    })

  } catch (err: any) {
    await ctx.reply(
      err.message || "Something went wrong. Try again."
    )
  }
}