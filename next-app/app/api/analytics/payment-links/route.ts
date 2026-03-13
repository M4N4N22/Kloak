import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const revalidate = 60

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const creator = searchParams.get("creator")

  if (!creator) {
    return NextResponse.json(
      { error: "Missing creator address" },
      { status: 400 }
    )
  }

  const links = await prisma.paymentLink.findMany({
    where: { creatorAddress: creator },
    include: {
      payments: true
    }
  })

  let totalVolume = 0
  let totalPayments = 0
  let totalViews = 0
  let uniqueVisitors = 0

  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(now.getDate() - 7)

  const topLinksThisWeek: {
    id: string
    title: string
    weeklyRevenue: number
  }[] = []

  let highestRevenueLink: any = null
  let highestConversionLink: any = null

  for (const link of links) {
    const revenue = Number(link.totalVolume ?? 0)
    const payments = link.paymentsReceived ?? 0
    const views = link.views ?? 0
    const visitors = link.uniqueVisitors ?? 0

    totalVolume += revenue
    totalPayments += payments
    totalViews += views
    uniqueVisitors += visitors

    const conversion = views > 0 ? payments / views : 0

    if (!highestRevenueLink || revenue > highestRevenueLink.revenue) {
      highestRevenueLink = {
        id: link.id,
        title: link.title,
        revenue
      }
    }

    if (!highestConversionLink || conversion > highestConversionLink.conversion) {
      highestConversionLink = {
        id: link.id,
        title: link.title,
        conversion
      }
    }

    const weeklyRevenue = link.payments
      .filter(p => new Date(p.createdAt) >= weekAgo)
      .reduce((sum, p) => sum + Number(p.amount), 0)

    if (weeklyRevenue > 0) {
      topLinksThisWeek.push({
        id: link.id,
        title: link.title,
        weeklyRevenue
      })
    }
  }

  topLinksThisWeek.sort((a, b) => b.weeklyRevenue - a.weeklyRevenue)

  const conversionRate = totalViews > 0 ? totalPayments / totalViews : 0

  return NextResponse.json({
    totals: {
      totalVolume,
      totalPayments,
      totalViews,
      uniqueVisitors,
      activeLinks: links.filter(l => l.active).length,
      conversionRate
    },

    insights: {
      highestRevenueLink: highestRevenueLink ?? null,
      highestConversionLink: highestConversionLink ?? null,
      topLinksThisWeek: topLinksThisWeek.slice(0, 5)
    }
  })
}