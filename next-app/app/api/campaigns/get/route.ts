import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)

    const creatorAddress = searchParams.get("creator")

    if (!creatorAddress) {
      return NextResponse.json(
        { error: "creator address required" },
        { status: 400 }
      )
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        creatorAddress
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        nullifiers: true
      }
    })

    const formatted = campaigns.map((c) => {

      const claimedCount = c.nullifiers.length

      const claimedAmount = c.nullifiers.reduce(
        (acc, n: any) => acc + Number(n.amount || 0),
        0
      )

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        asset: c.asset,
        totalBudget: c.totalBudget.toString(),
        totalRecipients: c.totalRecipients,
        claimedCount,
        claimedAmount,
        createdAt: c.createdAt,
        merkleRoot: c.merkleRoot,
        status: c.status
      }
    })

    return NextResponse.json({
      campaigns: formatted
    })

  } catch (error) {

    console.error("Fetch campaigns error:", error)

    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}