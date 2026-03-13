import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const link = await prisma.paymentLink.findUnique({
      where: { id },
      select: {
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

    const [visits, payments] = await Promise.all([
      prisma.paymentLinkVisit.count({ where: { linkId: id } }),
      prisma.payment.count({ where: { linkId: id } })
    ])

    return NextResponse.json({
      ...link,
      visits,
      payments,
      conversionRate: visits ? payments / visits : 0
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}