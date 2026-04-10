import { prisma } from "@/lib/prisma"
import { decryptTextAtRest, encryptTextAtRest } from "@/lib/at-rest-encryption"

function normalizeWebhookUrl(rawUrl?: string | null) {
  if (!rawUrl?.trim()) {
    throw new Error("Webhook URL is required")
  }

  const url = new URL(rawUrl.trim())

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Webhook URL must use http or https")
  }

  return url.toString()
}

export async function createWebhookEndpoint(data: {
  creatorAddress: string
  url: string
  secret?: string | null
}) {
  if (!data.creatorAddress?.trim()) {
    throw new Error("Creator address is required")
  }

  const normalizedSecret = data.secret?.trim() || null

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      creatorAddress: data.creatorAddress.trim(),
      url: normalizeWebhookUrl(data.url),
      secret: encryptTextAtRest(normalizedSecret),
    },
  })

  return {
    id: endpoint.id,
    url: endpoint.url,
    secret: normalizedSecret,
    hasSecret: Boolean(normalizedSecret),
    active: endpoint.active,
    createdAt: endpoint.createdAt,
    updatedAt: endpoint.updatedAt,
  }
}

export async function getWebhookEndpoints(creatorAddress: string) {
  if (!creatorAddress?.trim()) {
    throw new Error("Creator address is required")
  }

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { creatorAddress: creatorAddress.trim() },
    include: {
      deliveries: {
        orderBy: { attemptedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return endpoints.map((endpoint) => ({
    id: endpoint.id,
    url: endpoint.url,
    hasSecret: Boolean(decryptTextAtRest(endpoint.secret)),
    isActive: endpoint.active,
    createdAt: endpoint.createdAt,
    updatedAt: endpoint.updatedAt,
    lastDelivery: endpoint.deliveries[0]?.attemptedAt ?? null,
    deliveryStatus:
      endpoint.deliveries.length === 0
        ? null
        : endpoint.deliveries[0].success
          ? "success"
          : "failed",
  }))
}

export async function deleteWebhookEndpoint(id: string, creatorAddress: string) {
  if (!creatorAddress?.trim()) {
    throw new Error("Creator address is required")
  }

  return prisma.webhookEndpoint.deleteMany({
    where: {
      id,
      creatorAddress: creatorAddress.trim(),
    },
  })
}
