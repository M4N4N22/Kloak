import { prisma } from "@/lib/prisma"

export async function getSession(telegramId: string) {
  return prisma.telegramSession.findUnique({
    where: { telegramId },
  })
}

export async function createOrUpdateSession(
  telegramId: string,
  step: string,
  data: any
) {
  return prisma.telegramSession.upsert({
    where: { telegramId },
    update: { step, data },
    create: {
      telegramId,
      step,
      data,
    },
  })
}

export async function clearSession(telegramId: string) {
  return prisma.telegramSession.deleteMany({
    where: { telegramId },
  })
}