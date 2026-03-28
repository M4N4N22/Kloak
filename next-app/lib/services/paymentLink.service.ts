import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function createPaymentLink(data: any) {
  return prisma.paymentLink.create({
    data: {
      creatorAddress: data.creatorAddress,

      // on-chain request identifier
      requestId: data.requestId,

      title: data.title,
      description: data.description ?? null,

      amount: data.amount ? new Prisma.Decimal(data.amount) : null,
      token: data.token,

      allowCustomAmount: data.allowCustomAmount ?? false,

      maxPayments: data.maxPayments ?? null,
      expiresAt: data.expiresAt ?? null,
    }
  })
}
export async function getPaymentLinks(creatorAddress: string) {
  return prisma.paymentLink.findMany({
    where: { creatorAddress },
    orderBy: { createdAt: "desc" }
  })
}
