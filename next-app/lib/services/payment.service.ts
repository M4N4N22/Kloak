import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { notifyPaymentSuccess } from "./payment-notification.service"

type RecordPaymentInput = {
  payer?: string | null
  payerAddress?: string | null
  merchantAddress?: string | null
  amount: string | number
  token: "ALEO" | "USDCX" | "USAD"
  txHash?: string | null
  receiptCommitment?: string | null
  receiptOwner?: string | null
}

export async function recordPayment(linkId: string, data: RecordPaymentInput) {
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
        payer: data.payer ?? null,
        payerAddress: data.payerAddress ?? null,
        merchantAddress: data.merchantAddress ?? null,
        amount,
        token: data.token,
        txHash: data.txHash ?? null,
        receiptCommitment: data.receiptCommitment ?? null,
        receiptOwner: data.receiptOwner ?? null,
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

  await notifyPaymentSuccess(link, payment)

  return payment
}
