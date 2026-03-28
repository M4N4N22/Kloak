import { prisma } from "@/lib/prisma"

function normalizeWalletAddress(walletAddress?: string | null) {
  const normalized = walletAddress?.trim()

  if (!normalized) {
    throw new Error("Wallet address is required")
  }

  return normalized
}

export async function getCreatorProfile(walletAddress: string) {
  const normalized = normalizeWalletAddress(walletAddress)

  return prisma.creatorProfile.upsert({
    where: { walletAddress: normalized },
    update: {},
    create: {
      walletAddress: normalized,
    },
  })
}

export async function activateProPlan(walletAddress: string) {
  const normalized = normalizeWalletAddress(walletAddress)

  return prisma.creatorProfile.upsert({
    where: { walletAddress: normalized },
    update: {
      isProUser: true,
    },
    create: {
      walletAddress: normalized,
      isProUser: true,
    },
  })
}
