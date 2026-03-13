import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {

    const { campaignId } = await params
    const { searchParams } = new URL(req.url)
    const lookupHash = searchParams.get("lookupHash")

    if (!lookupHash) {
      return NextResponse.json(
        { error: "lookupHash is required" },
        { status: 400 }
      )
    }

    // Fetch campaign first (prevents probing other campaigns)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        merkleRoot: true,
        status: true,
        expiry: true
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    if (campaign.status !== "FUNDED" && campaign.status !== "CREATED") {
      return NextResponse.json(
        { error: "Campaign not claimable" },
        { status: 400 }
      )
    }

    if (campaign.expiry && new Date() > campaign.expiry) {
      return NextResponse.json(
        { error: "Campaign expired" },
        { status: 400 }
      )
    }

    const proof = await prisma.merkleProofStore.findFirst({
      where: {
        campaignId,
        lookupHash
      },
      select: {
        payout: true,
        proofData: true
      }
    })

    if (!proof) {
      return NextResponse.json(
        { eligible: false },
        { status: 200 }
      )
    }

    return NextResponse.json({
      eligible: true,
     payout: proof.payout.toString(),
      proof: proof.proofData,
      campaignRoot: campaign.merkleRoot
    })

  } catch (error) {
    console.error("Proof lookup error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}