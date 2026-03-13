import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const link = await prisma.paymentLink.findUnique({
    where: { id }
  })

  if (!link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(link)
}