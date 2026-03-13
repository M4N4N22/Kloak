import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
    req: Request,
    context: { params: Promise<{ campaignId: string }> }
) {
    try {

        const { campaignId } = await context.params

        if (!campaignId) {
            return NextResponse.json(
                { error: "Missing campaignId" },
                { status: 400 }
            )
        }

        const body = await req.json()

        const { txHash, amount } = body

        if (!txHash) {
            return NextResponse.json(
                { error: "Missing txHash" },
                { status: 400 }
            )
        }

        await prisma.campaign.update({
            where: {
                id: campaignId
            },
            data: {
                status: "FUNDED",
                poolAmount: BigInt(amount),
                fundingTxHash: txHash
            }
        })

        return NextResponse.json({
            success: true
        })

    } catch (err) {

        console.error("Funding update error:", err)

        return NextResponse.json(
            { error: "Failed to update funding status" },
            { status: 500 }
        )
    }
}