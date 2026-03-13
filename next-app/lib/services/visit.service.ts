import crypto from "crypto"
import { prisma } from "@/lib/prisma"

export async function recordVisit(linkId: string, ip: string, userAgent: any) {
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex")

  await prisma.paymentLinkVisit.create({
    data: {
      linkId,
      ipHash,
      userAgent
    }
  })

  await prisma.paymentLink.update({
    where: { id: linkId },
    data: { views: { increment: 1 } }
  })
}