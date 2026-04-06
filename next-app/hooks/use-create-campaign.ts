"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { buildMerkleTree } from "@/core/merkle"
import {
    generateDeterministicSecret,
    computeCommitment,
    computeLeaf
} from "@/core/zk"
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from "@noble/hashes/utils.js"
import { generateProof } from "@/core/merkle"

type Status =
    | "idle"
    | "calculating"
    | "registering"
    | "broadcasting"
    | "finalizing"
    | "completed"
    | "error"

interface CsvRow {
    address: string
    amount: number
}

interface CreateCampaignParams {
    name: string
    description?: string
    asset: number
    rows: CsvRow[]
}

export function useCreateCampaign() {

    const { connected, executeTransaction, transactionStatus, address } = useWallet()

    const [status, setStatus] = useState<Status>("idle")
    const [error, setError] = useState<string | null>(null)

    const createCampaign = async ({
        name,
        description,
        asset,
        rows
    }: CreateCampaignParams) => {

        if (!connected) {
            throw new Error("Wallet not connected")
        }

        try {

            setStatus("calculating")

            const { Field } = await import("@provablehq/sdk")
            const campaignField = Field.random()

            const campaignIdFormatted = campaignField.toString() // used for contract

            const campaignIdRaw = campaignIdFormatted.replace("field", "") // used for hashing

            /* ---------------- BUILD LEAVES ---------------- */

            const leaves = await Promise.all(
                rows.map(async (row) => {

                    const payoutMicro = row.amount

                    const secret = await generateDeterministicSecret(
                        row.address,
                        campaignIdRaw
                    )

                    const commitment = await computeCommitment(secret)

                    const leaf = await computeLeaf(
                        commitment,
                        payoutMicro.toString()
                    )

                    return leaf

                })
            )

            /* ---------------- BUILD TREE ---------------- */

            const tree = await buildMerkleTree(leaves)

            const merkleRoot = tree.root.toString()

            /* ---------------- GENERATE PROOFS ---------------- */

            const proofs = rows.map((row, index) => {

                const { s, d } = generateProof(tree, index)

                const proof = {
                    s1: s[0],
                    s2: s[1],
                    s3: s[2],
                    s4: s[3],
                    s5: s[4],
                    s6: s[5],
                    s7: s[6],
                    s8: s[7],
                    s9: s[8],
                    s10: s[9],
                    d1: d[0],
                    d2: d[1],
                    d3: d[2],
                    d4: d[3],
                    d5: d[4],
                    d6: d[5],
                    d7: d[6],
                    d8: d[7],
                    d9: d[8],
                    d10: d[9],
                }

                const lookupHash = bytesToHex(
                    sha256(
                        new TextEncoder().encode(`${row.address}:${campaignIdFormatted}`)
                    )
                )
                const payoutMicro = row.amount
                return {
                    lookupHash,
                    payout: payoutMicro,
                    proof
                }

            })

            const microBudget = rows.reduce((sum, r) => sum + r.amount, 0)


            /* ---------------- CREATE CAMPAIGN TX ---------------- */

            setStatus("registering")

            const result = await executeTransaction({
                program: "kloak_protocol_v10.aleo",
                function: "create_campaign",
                inputs: [
                    campaignIdFormatted,
                    merkleRoot,
                    `${asset}u8`,
                    `${microBudget}u64`
                ],
                privateFee: false
            })

            if (!result?.transactionId) {
                throw new Error("Transaction rejected by wallet")
            }

            let txId = result.transactionId

            setStatus("broadcasting")

            /* ---------------- WAIT FINALIZATION ---------------- */

            setStatus("finalizing")

            let attempts = 0
            let confirmed = false

            while (!confirmed && attempts < 120) {

                try {

                    const res = await transactionStatus(txId)

                    console.log("TX STATUS:", res)

                    if (!res) {
                        await new Promise(r => setTimeout(r, 4000))
                        attempts++
                        continue
                    }

                    /* --- update shield tx → real network tx --- */

                    const realTxId = res?.transactionId

                    if (realTxId && realTxId !== txId) {
                        console.log("Updating TX ID:", realTxId)
                        txId = realTxId
                    }

                    const status =
                        (typeof res === "string" ? res : res.status)?.toLowerCase()

                    if (["finalized", "accepted", "completed"].includes(status)) {
                        confirmed = true
                        break
                    }

                    if (["failed", "rejected"].includes(status)) {
                        throw new Error("Transaction failed on network")
                    }

                } catch (e) {

                    console.warn("Status check error (normal during propagation):", e)

                }

                await new Promise(r => setTimeout(r, 4000))
                attempts++
            }

            if (!confirmed) {
                console.warn("TX confirmation timeout — assuming success")
            }

            /* ---------------- STORE CAMPAIGN ---------------- */

            await fetch("/api/campaigns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: campaignIdFormatted,
                    name,
                    creatorAddress: address,
                    description,
                    asset,
                    merkleRoot,
                    totalBudget: microBudget,
                    totalRecipients: rows.length,
                    txHash: txId,
                    proofs
                })
            })

            setStatus("completed")

            return {
                campaignId: campaignIdFormatted,
                merkleRoot,
                txId
            }

        } catch (err: any) {

            console.error(err)

            setError(err.message || "Campaign creation failed")

            setStatus("error")

            throw err
        }
    }

    return {
        createCampaign,
        status,
        error
    }
}