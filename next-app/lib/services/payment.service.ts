import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { notifyPaymentSuccess } from "./payment-notification.service"

export async function recordPayment(linkId: string, data: any) {
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
        payer: null,
        payerAddress: null,
        amount,
        token: data.token,
        txHash: data.txHash ?? null,
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
