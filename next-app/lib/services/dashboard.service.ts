import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type ProofPayloadMeta = {
  actorRole: "payer" | "receiver"
  proofType: "existence" | "amount" | "threshold"
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || typeof value === "undefined") return 0
  return Number(value)
}

function formatDayKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

function formatDayLabel(value: Date) {
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function getProofPayloadMeta(payload: Prisma.JsonValue | null): ProofPayloadMeta {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const shape = payload as Record<string, unknown>
    const actorRole = shape.actorRole === "receiver" ? "receiver" : "payer"
    const proofType =
      shape.proofType === "amount" || shape.proofType === "threshold"
        ? shape.proofType
        : "existence"

    return { actorRole, proofType }
  }

  return {
    actorRole: "payer",
    proofType: "existence",
  }
}

function getProofVerificationStatus(input: {
  status: "ACTIVE" | "REVOKED"
  latestVerification?: {
    success: boolean
    revoked: boolean
  } | null
}) {
  if (input.status === "REVOKED") {
    return "Revoked"
  }

  if (input.latestVerification?.success) {
    return "Verified"
  }

  if (input.latestVerification && !input.latestVerification.success) {
    return input.latestVerification.revoked ? "Revoked" : "Check failed"
  }

  return "Issued"
}

export async function getDashboardOverview(creatorAddress: string) {
  const today = startOfDay(new Date())
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const [
    links,
    recentPayments,
    chartPayments,
    distinctDisclosedPayments,
    recentProofs,
    linkedTelegramUsers,
    botPayments,
    activeWebhookEndpoints,
    recentWebhookDeliveries,
  ] = await Promise.all([
    prisma.paymentLink.findMany({
      where: { creatorAddress },
      select: {
        id: true,
        title: true,
        active: true,
        views: true,
        paymentsReceived: true,
        totalVolume: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        PaymentLink: { creatorAddress },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
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
    prisma.payment.findMany({
      where: {
        PaymentLink: { creatorAddress },
        status: "SUCCESS",
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    prisma.selectiveDisclosureProof.findMany({
      where: {
        status: "ACTIVE",
        payment: {
          PaymentLink: { creatorAddress },
        },
      },
      distinct: ["paymentId"],
      select: {
        paymentId: true,
      },
    }),
    prisma.selectiveDisclosureProof.findMany({
      where: {
        payment: {
          PaymentLink: { creatorAddress },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        proofId: true,
        paymentTxHash: true,
        status: true,
        createdAt: true,
        proofPayload: true,
        _count: {
          select: {
            verifications: true,
          },
        },
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            success: true,
            revoked: true,
          },
        },
      },
    }),
    prisma.telegramUser.count({
      where: { walletAddress: creatorAddress },
    }),
    prisma.payment.count({
      where: {
        PaymentLink: { creatorAddress },
        telegramId: { not: null },
      },
    }),
    prisma.webhookEndpoint.count({
      where: {
        creatorAddress,
        active: true,
      },
    }),
    prisma.webhookDelivery.findMany({
      where: {
        endpoint: {
          creatorAddress,
        },
      },
      orderBy: { attemptedAt: "desc" },
      take: 10,
      select: {
        success: true,
        responseStatus: true,
        attemptedAt: true,
      },
    }),
  ])

  const totalVolume = links.reduce((sum, link) => sum + toNumber(link.totalVolume), 0)
  const totalPayments = links.reduce((sum, link) => sum + (link.paymentsReceived ?? 0), 0)
  const totalViews = links.reduce((sum, link) => sum + (link.views ?? 0), 0)
  const activeLinks = links.filter((link) => link.active).length
  const conversionRate = totalViews > 0 ? totalPayments / totalViews : 0
  const disclosureRate = totalPayments > 0 ? distinctDisclosedPayments.length / totalPayments : 0

  const chartTemplate = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo)
    date.setDate(sevenDaysAgo.getDate() + index)

    return {
      date: formatDayKey(date),
      label: formatDayLabel(date),
      volume: 0,
    }
  })

  const chartMap = new Map(chartTemplate.map((entry) => [entry.date, entry]))

  for (const payment of chartPayments) {
    const key = formatDayKey(startOfDay(payment.createdAt))
    const target = chartMap.get(key)

    if (target) {
      target.volume += toNumber(payment.amount)
    }
  }

  const botActivity = linkedTelegramUsers + botPayments + links.length

  const latestWebhookDelivery = recentWebhookDeliveries[0]
  const webhookHealth =
    activeWebhookEndpoints === 0
      ? "Not configured"
      : !latestWebhookDelivery
        ? "Awaiting traffic"
        : latestWebhookDelivery.success
          ? `${latestWebhookDelivery.responseStatus || 200} OK`
          : "Degraded"

  const automationTriggers = activeWebhookEndpoints + (linkedTelegramUsers > 0 ? 1 : 0)

  return {
    pulse: {
      telegram: {
        online: Boolean(process.env.BOT_TOKEN),
        linkedUsers: linkedTelegramUsers,
      },
      webhooks: {
        status: webhookHealth,
        activeEndpoints: activeWebhookEndpoints,
      },
      proofs: {
        live: true,
      },
    },
    metrics: {
      totalVolume,
      activeLinks,
      totalPayments,
      totalViews,
      conversionRate,
      disclosureRate,
      disclosedPayments: distinctDisclosedPayments.length,
      botActivity,
      chart: chartTemplate,
    },
    connectivity: {
      telegram: {
        status: Boolean(process.env.BOT_TOKEN) ? "Online" : "Offline",
        linkedUsers: linkedTelegramUsers,
        interactions: botActivity,
      },
      webhooks: {
        status: webhookHealth,
        activeEndpoints: activeWebhookEndpoints,
        recentDeliveries: recentWebhookDeliveries.length,
      },
      automation: {
        status: automationTriggers > 0 ? "Ready" : "Needs setup",
        triggers: automationTriggers,
      },
    },
    feeds: {
      payments: recentPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount.toString(),
        token: payment.token,
        status: payment.status,
        source: payment.PaymentLink.title,
        sourceType: payment.telegramId ? "Telegram Bot" : "Tracked Link",
        createdAt: payment.createdAt.toISOString(),
        txHash: payment.txHash,
      })),
      proofs: recentProofs.map((proof) => {
        const meta = getProofPayloadMeta(proof.proofPayload)
        const latestVerification = proof.verifications[0] || null

        return {
          proofId: proof.proofId,
          paymentTxHash: proof.paymentTxHash,
          createdAt: proof.createdAt.toISOString(),
          proofType: meta.proofType,
          actorRole: meta.actorRole,
          status: getProofVerificationStatus({
            status: proof.status,
            latestVerification,
          }),
          verificationCount: proof._count.verifications,
        }
      }),
    },
  }
}
