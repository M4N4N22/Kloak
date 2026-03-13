import { prisma } from "@/lib/prisma"

export async function getLinkAnalytics(id: string) {
  const link = await prisma.paymentLink.findUnique({
    where: { id },
    select: {
      views: true,
      uniqueVisitors: true,
      paymentsReceived: true,
      totalVolume: true
    }
  })

  const visits = await prisma.paymentLinkVisit.count({
    where: { linkId: id }
  })

  const payments = await prisma.payment.count({
    where: { linkId: id }
  })

  return {
    ...link,
    visits,
    payments,
    conversionRate: visits ? payments / visits : 0
  }
}