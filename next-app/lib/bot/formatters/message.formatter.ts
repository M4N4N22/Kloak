export function formatPaymentMessage(payment: any, parsed: any) {
  const noteLine = parsed.note
    ? `\n📝 Note: ${parsed.note}`
    : ""

  return {
    text: `
💸 *Payment Request*

@${parsed.requestedBy.username} requested *${parsed.amount} ${parsed.token}* from @${parsed.targetUsername}${noteLine}

👇 Pay privately:
    `.trim(),

    keyboard: {
      inline_keyboard: [
        [
          {
            text: "Pay Now",
            url: payment.link,
          },
        ],
      ],
    },
  }
}