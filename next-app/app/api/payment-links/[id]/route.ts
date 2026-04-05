import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const creator = req.nextUrl.searchParams.get("creator")?.trim()

  if (!creator) {
    return NextResponse.json({ error: "creator is required" }, { status: 400 })
  }

  try {
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
            payerAddress: true,
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
        payerAddress: payment.payerAddress,
        proofCount: payment._count.selectiveDisclosureProofs,
      })),
      analytics: {
        conversionRate,
      },
    })
  } catch (error: unknown) {
    console.error("Payment link detail error:", error)
    return NextResponse.json({ error: "Failed to load payment link details" }, { status: 500 })
  }
}
