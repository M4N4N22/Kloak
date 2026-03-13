import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)

    const creator = searchParams.get("creator")

    if (!creator) {
      return NextResponse.json(
        { error: "creator address required" },
        { status: 400 }
      )
    }

    /* ---------------- FETCH CAMPAIGNS ---------------- */

    const campaigns = await prisma.campaign.findMany({
      where: {
        creatorAddress: creator
      },
      select: {
        totalBudget: true,
        poolAmount: true,
        claimedAmount: true,
        totalRecipients: true,
        claimedCount: true,
        status: true
      }
    })

    /* ---------------- AGGREGATE ---------------- */

    let totalCampaigns = campaigns.length
    let activeCampaigns = 0

    let totalBudget = BigInt(0)
    let totalClaimed = BigInt(0)
    let totalRecipients = 0
    let totalClaimedRecipients = 0

    for (const c of campaigns) {

      if (c.status === "FUNDED") {
        activeCampaigns++
      }

      totalBudget += c.totalBudget ?? BigInt(0)
      totalClaimed += c.claimedAmount ?? BigInt(0)

      totalRecipients += c.totalRecipients ?? 0
      totalClaimedRecipients += c.claimedCount ?? 0
    }

    const claimRate =
      totalRecipients === 0
        ? 0
        : Math.round((totalClaimedRecipients / totalRecipients) * 100)

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalRecipients,
      claimedRecipients: totalClaimedRecipients,
      claimRate,

      totalBudget: Number(totalBudget) / 1_000_000,
      totalClaimed: Number(totalClaimed) / 1_000_000
    })

  } catch (err) {

    console.error("Analytics error:", err)

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}