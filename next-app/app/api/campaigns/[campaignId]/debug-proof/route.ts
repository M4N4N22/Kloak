import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        console.log("DEBUG_PROOF_ROUTE_START")

        const { campaignId } = await params
        console.log("Campaign ID:", campaignId)

        if (!campaignId) {
            return NextResponse.json({ error: "Missing campaignId" }, { status: 400 })
        }

        /* ---------------- FETCH DATA ---------------- */

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        })

        const proofRow = await prisma.merkleProofStore.findFirst({
            where: { campaignId }
        })

        if (!campaign || !proofRow) {
            console.log("Campaign or Proof not found")
            return NextResponse.json({ error: "Data not found" }, { status: 404 })
        }

        /* ---------------- MAP INDIVIDUAL KEYS ---------------- */

        const p = proofRow.proofData as any
        
        // Map the flat keys (s1, d1, etc.) into a clean object
        const proof = {
            s1: p.s1, s2: p.s2, s3: p.s3, s4: p.s4, s5: p.s5,
            s6: p.s6, s7: p.s7, s8: p.s8, s9: p.s9, s10: p.s10,
            d1: p.d1, d2: p.d2, d3: p.d3, d4: p.d4, d5: p.d5,
            d6: p.d6, d7: p.d7, d8: p.d8, d9: p.d9, d10: p.d10
        }

        // Validate that we actually have the fields
        if (!proof.s1 || proof.d1 === undefined) {
            console.log("Proof data in DB is missing expected keys s1/d1")
            return NextResponse.json({ error: "Invalid proof structure in DB" }, { status: 500 })
        }

        /* ---------------- RESPONSE ---------------- */

        // Generate the Leo command for easy copy-pasting into your terminal
        const leoCommand = `leo run claim_distribution "${campaign.id}" "${campaign.merkleRoot}" "${proofRow.payout}u64" "YOUR_SECRET_HERE" "{ s1: ${p.s1}, s2: ${p.s2}, s3: ${p.s3}, s4: ${p.s4}, s5: ${p.s5}, s6: ${p.s6}, s7: ${p.s7}, s8: ${p.s8}, s9: ${p.s9}, s10: ${p.s10}, d1: ${p.d1}, d2: ${p.d2}, d3: ${p.d3}, d4: ${p.d4}, d5: ${p.d5}, d6: ${p.d6}, d7: ${p.d7}, d8: ${p.d8}, d9: ${p.d9}, d10: ${p.d10} }"`

        const responsePayload = {
            walletAddress: campaign.creatorAddress,
            campaignRoot: campaign.merkleRoot,
            payout: proofRow.payout.toString() + "u64",
            proof,
            leoCommand 
        }

        console.log("DEBUG_PROOF_ROUTE_SUCCESS")
        return NextResponse.json(responsePayload)

    } catch (err) {
        console.error("DEBUG_PROOF_ROUTE_ERROR:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}