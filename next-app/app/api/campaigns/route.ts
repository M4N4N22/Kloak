import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {

        const body = await req.json()

        const {
            id,
            name,
            creatorAddress,
            description,
            asset,
            merkleRoot,
            totalBudget,
            totalRecipients,
            txHash,
            proofs
        } = body

        if (!id || !merkleRoot) {
            return NextResponse.json(
                { error: "Invalid campaign payload" },
                { status: 400 }
            )
        }

        await prisma.$transaction(async (tx) => {

            await tx.campaign.create({
                data: {
                    id,
                    name,
                    creatorAddress,
                    description,
                    asset,
                    merkleRoot,
                    totalBudget: BigInt(totalBudget),
                    totalRecipients,
                    status: "CREATED",
                    creationTxHash: txHash
                }
            })
            const proofRows = proofs.map((p: any) => ({
                lookupHash: p.lookupHash,
                campaignId: id,
                payout: BigInt(p.payout),
                proofData: p.proof
            }))

            await tx.merkleProofStore.createMany({
                data: proofRows
            })

        })

        return NextResponse.json({
            success: true
        })

    } catch (err) {

        console.error("Create campaign error:", err)

        return NextResponse.json(
            { error: "Failed to store campaign" },
            { status: 500 }
        )
    }
}