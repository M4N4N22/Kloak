import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function recordPayment(linkId: string, data: any) {
  const amount = new Prisma.Decimal(data.amount)

  const [payment] = await prisma.$transaction([

    prisma.payment.create({
      data: {
        linkId,
        payer: data.payer ?? null,
        amount,
        token: data.token,
        txHash: data.txHash ?? null
      }
    }),

    prisma.paymentLink.update({
      where: { id: linkId },
      data: {
        paymentsReceived: { increment: 1 },
        totalVolume: { increment: amount }
      }
    })

  ])

  return payment
}