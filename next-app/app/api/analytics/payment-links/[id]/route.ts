import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import {
  CREATOR_READ_SCOPE,
  isCreatorAccessError,
  verifyCreatorAccessRequest,
} from "@/lib/creator-access"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const creator = await verifyCreatorAccessRequest(
      {
        viewerAddress: req.nextUrl.searchParams.get("viewerAddress") || undefined,
        scope: req.nextUrl.searchParams.get("scope") || undefined,
        issuedAt: req.nextUrl.searchParams.get("issuedAt") || undefined,
        signature: req.nextUrl.searchParams.get("signature") || undefined,
      },
      CREATOR_READ_SCOPE,
    )

    const link = await prisma.paymentLink.findUnique({
      where: { id },
      select: {
        creatorAddress: true,
        views: true,
        uniqueVisitors: true,
        paymentsReceived: true,
        totalVolume: true
      }
    })

    if (!link) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      )
    }

    if (link.creatorAddress !== creator) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404 })
    }

    const [visits, payments] = await Promise.all([
      prisma.paymentLinkVisit.count({ where: { linkId: id } }),
      prisma.payment.count({ where: { linkId: id } })
    ])

    return NextResponse.json({
      views: link.views,
      uniqueVisitors: link.uniqueVisitors,
      paymentsReceived: link.paymentsReceived,
      totalVolume: link.totalVolume,
      visits,
      payments,
      conversionRate: visits ? payments / visits : 0
    })
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
