import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getPaymentLinkTemplateFromDb } from "@/features/payment-links/lib/templates"
import {
  CREATOR_READ_SCOPE,
  isCreatorAccessError,
  verifyCreatorAccessRequest,
} from "@/lib/creator-access"

function normalizeSuggestedAmounts(value: unknown) {
  return Array.isArray(value)
    ? value.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry))
    : null
}

function toPublicPaymentLinkResponse(link: {
  id: string
  creatorAddress: string | null
  requestId: string
  title: string
  description: string | null
  template: Parameters<typeof getPaymentLinkTemplateFromDb>[0]
  successMessage: string | null
  redirectUrl: string | null
  suggestedAmounts: unknown
  amount: { toString(): string } | null
  token: "ALEO" | "USDCX" | "USAD"
  allowCustomAmount: boolean
  maxPayments: number | null
  paymentsReceived: number
  expiresAt: Date | null
  active: boolean
  views: number
  uniqueVisitors: number
  totalVolume: { toString(): string }
}) {
  return {
    id: link.id,
    creatorAddress: link.creatorAddress,
    requestId: link.requestId,
    title: link.title,
    description: link.description,
    template: getPaymentLinkTemplateFromDb(link.template),
    successMessage: link.successMessage ?? null,
    redirectUrl: link.redirectUrl ?? null,
    suggestedAmounts: normalizeSuggestedAmounts(link.suggestedAmounts),
    amount: link.amount ? Number(link.amount.toString()) : null,
    token: link.token,
    allowCustomAmount: link.allowCustomAmount,
    maxPayments: link.maxPayments,
    paymentsReceived: link.paymentsReceived,
    expiresAt: link.expiresAt?.toISOString() ?? null,
    active: link.active,
    views: link.views,
    uniqueVisitors: link.uniqueVisitors,
    totalVolume: Number(link.totalVolume.toString()),
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const hasCreatorAccessPayload =
    Boolean(req.nextUrl.searchParams.get("viewerAddress")) ||
    Boolean(req.nextUrl.searchParams.get("signature"))

  try {
    if (!hasCreatorAccessPayload) {
      const publicLink = await prisma.paymentLink.findUnique({
        where: { id },
        select: {
          id: true,
          creatorAddress: true,
          requestId: true,
          title: true,
          description: true,
          template: true,
          successMessage: true,
          redirectUrl: true,
          suggestedAmounts: true,
          amount: true,
          token: true,
          allowCustomAmount: true,
          maxPayments: true,
          paymentsReceived: true,
          expiresAt: true,
          active: true,
          views: true,
          uniqueVisitors: true,
          totalVolume: true,
        },
      })

      if (!publicLink) {
        return NextResponse.json({ error: "Payment link not found" }, { status: 404 })
      }

      return NextResponse.json(toPublicPaymentLinkResponse(publicLink))
    }

    const creator = await verifyCreatorAccessRequest(
      {
        viewerAddress: req.nextUrl.searchParams.get("viewerAddress") || undefined,
        scope: req.nextUrl.searchParams.get("scope") || undefined,
        issuedAt: req.nextUrl.searchParams.get("issuedAt") || undefined,
        signature: req.nextUrl.searchParams.get("signature") || undefined,
      },
      CREATOR_READ_SCOPE,
    )

    const link = await prisma.paymentLink.findFirst({
      where: {
        id,
        creatorAddress: creator,
      },
      select: {
        id: true,
        creatorAddress: true,
        requestId: true,
        title: true,
        description: true,
        template: true,
        successMessage: true,
        redirectUrl: true,
        suggestedAmounts: true,
        amount: true,
        token: true,
        allowCustomAmount: true,
        maxPayments: true,
        paymentsReceived: true,
        expiresAt: true,
        active: true,
        views: true,
        uniqueVisitors: true,
        totalVolume: true,
        createdAt: true,
        updatedAt: true,
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            txHash: true,
            amount: true,
            token: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                selectiveDisclosureProofs: true,
              },
            },
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404 })
    }

    const conversionRate = link.views > 0 ? link.paymentsReceived / link.views : 0

    return NextResponse.json({
      ...link,
      template: getPaymentLinkTemplateFromDb(link.template),
      successMessage: link.successMessage ?? null,
      redirectUrl: link.redirectUrl ?? null,
      suggestedAmounts: normalizeSuggestedAmounts(link.suggestedAmounts),
      amount: link.amount?.toString() ?? null,
      totalVolume: link.totalVolume.toString(),
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      expiresAt: link.expiresAt?.toISOString() ?? null,
      payments: link.payments.map((payment) => ({
        id: payment.id,
        txHash: payment.txHash,
        amount: payment.amount.toString(),
        token: payment.token,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
        proofCount: payment._count.selectiveDisclosureProofs,
      })),
      analytics: {
        conversionRate,
      },
    })
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("Payment link detail error:", error)
    return NextResponse.json({ error: "Failed to load payment link details" }, { status: 500 })
  }
}
