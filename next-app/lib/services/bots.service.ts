import { prisma } from "@/lib/prisma"

export async function getBotsOverview(creatorAddress: string) {
  const [linkedUsers, trackedLinksCount, trackedPaymentsAggregate, recentTrackedLinks, recentTrackedPayments] =
    await Promise.all([
      prisma.telegramUser.count({
        where: { walletAddress: creatorAddress },
      }),
      prisma.paymentLink.count({
        where: {
          creatorAddress,
        },
      }),
      prisma.payment.aggregate({
        where: {
          PaymentLink: {
            creatorAddress,
          },
        },
        _count: true,
        _sum: {
          amount: true,
        },
      }),
      prisma.paymentLink.findMany({
        where: {
          creatorAddress,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          requestId: true,
          createdAt: true,
          active: true,
          paymentsReceived: true,
          totalVolume: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          PaymentLink: {
            creatorAddress,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          txHash: true,
          amount: true,
          token: true,
          status: true,
          createdAt: true,
          telegramId: true,
          PaymentLink: {
            select: {
              title: true,
            },
          },
        },
      }),
    ])

  const paymentAlertsCount = trackedPaymentsAggregate._count
  const trackedVolume = Number(trackedPaymentsAggregate._sum.amount ?? 0)

  return {
    pulse: {
      online: Boolean(process.env.BOT_TOKEN),
      linked: linkedUsers > 0,
      linkedUsers,
      alerts: paymentAlertsCount > 0 ? "Live" : "Idle",
    },
    metrics: {
      linkedUsers,
      trackedLinksCount,
      paymentAlertsCount,
      trackedVolume,
    },
    feeds: {
      payments: recentTrackedPayments.map((payment) => ({
        id: payment.id,
        txHash: payment.txHash,
        amount: payment.amount.toString(),
        token: payment.token,
        status: payment.status,
        source: payment.PaymentLink.title,
        createdAt: payment.createdAt.toISOString(),
        channel: payment.telegramId ? "Telegram payer" : "Tracked link alert",
      })),
      links: recentTrackedLinks.map((link) => ({
        id: link.id,
        title: link.title,
        requestId: link.requestId,
        createdAt: link.createdAt.toISOString(),
        active: link.active,
        paymentsReceived: link.paymentsReceived,
        totalVolume: Number(link.totalVolume),
      })),
    },
  }
}
