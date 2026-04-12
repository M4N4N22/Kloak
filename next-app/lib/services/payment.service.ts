import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { notifyPaymentSuccess } from "./payment-notification.service"

type RecordPaymentInput = {
  merchantAddress: string
  amount: string | number
  token: "ALEO" | "USDCX" | "USAD"
  txHash: string
  receiptCommitment?: string | null
}

type RecordPaymentOptions = {
  notify?: boolean
}

export async function recordPayment(linkId: string, data: RecordPaymentInput, options?: RecordPaymentOptions) {
  if (data.txHash) {
    const existingPayment = await prisma.payment.findFirst({
      where: { txHash: data.txHash },
    })

    if (existingPayment) return existingPayment
  }

  const amount = new Prisma.Decimal(data.amount)

  const { payment, link } = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        linkId,
        merchantAddress: data.merchantAddress,
        amount,
        token: data.token,
        txHash: data.txHash,
        receiptCommitment: data.receiptCommitment ?? null,
        status: "SUCCESS",
      },
    })

    const link = await tx.paymentLink.update({
      where: { id: linkId },
      data: {
        paymentsReceived: { increment: 1 },
        totalVolume: { increment: amount },
      },
    })

    return { payment, link }
  })

  if (options?.notify !== false) {
    await notifyPaymentSuccess(link, payment)
  }

  return payment
}
