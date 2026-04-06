import { prisma } from "@/lib/prisma"
import { PaymentLinkTemplate, Prisma, Token } from "@prisma/client"
import { getPaymentLinkTemplateFromDb } from "@/features/payment-links/lib/templates"

type CreatePaymentLinkInput = {
  creatorAddress?: string | null
  requestId: string
  title: string
  description?: string | null
  template?: PaymentLinkTemplate
  successMessage?: string | null
  redirectUrl?: string | null
  suggestedAmounts?: number[] | null
  amount?: number | string | null
  token: Token
  allowCustomAmount?: boolean
  maxPayments?: number | null
  expiresAt?: Date | string | null
}

export async function createPaymentLink(data: CreatePaymentLinkInput) {
  return prisma.paymentLink.create({
    data: {
      creatorAddress: data.creatorAddress ?? null,

      // on-chain request identifier
      requestId: data.requestId,

      title: data.title,
      description: data.description ?? null,
      template: data.template ?? "CUSTOM",
      successMessage: data.successMessage?.trim() || null,
      redirectUrl: data.redirectUrl?.trim() || null,
      suggestedAmounts: data.suggestedAmounts ?? undefined,

      amount: data.amount ? new Prisma.Decimal(data.amount) : null,
      token: data.token,

      allowCustomAmount: data.allowCustomAmount ?? false,

      maxPayments: data.maxPayments ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }
  })
}
export async function getPaymentLinks(creatorAddress: string) {
  const links = await prisma.paymentLink.findMany({
    where: { creatorAddress },
    orderBy: { createdAt: "desc" }
  })

  return links.map((link) => ({
    ...link,
    template: getPaymentLinkTemplateFromDb(link.template),
  }))
}
