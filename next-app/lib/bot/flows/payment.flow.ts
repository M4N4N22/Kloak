import { getSession, createOrUpdateSession } from "../state/session.service"
import { PaymentFlowData } from "./payment.flow.types"
import { sendOrEditMessage } from "../utils/message.utils"
import { getTelegramId } from "../utils/ctx.utils"
import { formatStep } from "../utils/ui.utils"
import { withCancel } from "../utils/keyboard.utils"

export async function handlePaymentFlow(ctx: any) {
  if (!ctx.message?.text) return

  const telegramId = getTelegramId(ctx)
  const text = ctx.message.text

  const session = await getSession(telegramId)
  if (!session) return

  const { step } = session

  const rawData = session.data

  const data: PaymentFlowData =
    typeof rawData === "object" && rawData !== null
      ? (rawData as PaymentFlowData)
      : {}

  // =========================
  // STEP: AMOUNT
  // =========================
  if (step === "amount") {
    const amount = Number(text)

    if (isNaN(amount) || amount <= 0) {
      return sendOrEditMessage(
        ctx,
        formatStep("amount", "Enter a valid amount:"),
        data,
        withCancel()
      )
    }

    const newData = { ...data, amount }

    await createOrUpdateSession(telegramId, "token", newData)

    return sendOrEditMessage(
      ctx,
      formatStep("token", "Select token:"),
      newData,
      withCancel([
        [{ text: "ALEO", callback_data: "token_ALEO" }],
        [{ text: "USDCX", callback_data: "token_USDCX" }],
      ])
    )
  }

  // =========================
  // STEP: NOTE
  // =========================
  if (step === "note") {
    const note = text.toLowerCase() === "skip" ? "" : text

    const newData = { ...data, note }

    await createOrUpdateSession(telegramId, "expiry", newData)

    return sendOrEditMessage(
      ctx,
      formatStep("expiry", "Select expiry:"),
      newData,
      withCancel([
        [{ text: "10 min", callback_data: "exp_10m" }],
        [{ text: "1 day", callback_data: "exp_1d" }],
        [{ text: "7 days", callback_data: "exp_7d" }],
      ])
    )
  }

  return sendOrEditMessage(
    ctx,
    "Something went wrong. Tap below to restart.",
    data,
    withCancel([
      [{ text: "🔄 Restart", callback_data: "restart_flow" }],
    ])
  )
}