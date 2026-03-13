import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params

        const body = await req.json()
        const { claimer, payout, txHash } = body

        if (!claimer || !payout || !txHash) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                id: true,
                status: true,
                expiry: true,
            },
        })

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            )
        }

        if (campaign.expiry && new Date() > campaign.expiry) {
            return NextResponse.json(
                { error: "Campaign expired" },
                { status: 400 }
            )
        }

        if (campaign.status !== "FUNDED" && campaign.status !== "CREATED") {
            return NextResponse.json(
                { error: "Campaign not claimable" },
                { status: 400 }
            )
        }

        /* ---------------- NULLIFIER ---------------- */

        const nullifier = crypto
            .createHash("sha256")
            .update(`${claimer}:${campaignId}`)
            .digest("hex")

        /* ---------------- ATOMIC TRANSACTION ---------------- */

        await prisma.$transaction(async (tx) => {
            const existing = await tx.claimNullifier.findUnique({
                where: { nullifier },
            })

            if (existing) {
                throw new Error("CLAIM_ALREADY_RECORDED")
            }

            await tx.claimNullifier.create({
                data: {
                    nullifier,
                    campaignId,
                },
            })

            await tx.campaign.update({
                where: { id: campaignId },
                data: {
                    claimedCount: {
                        increment: 1,
                    },
                    claimedAmount: {
                        increment: BigInt(payout),
                    },
                    poolAmount: {
                        decrement: BigInt(payout),
                    },
                },
            })
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        if (error.message === "CLAIM_ALREADY_RECORDED") {
            return NextResponse.json(
                { error: "Claim already recorded" },
                { status: 400 }
            )
        }

        console.error("Claim recording error:", error)

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}