"use client"

import { useState } from "react"
import {
    generateDeterministicSecret,
    computeCommitment,
    computeLeaf,
    computeHash2
} from "@/core/zk"

import { buildMerkleTree } from "@/core/merkle"

export default function ZKDebugPage() {

    const [campaignId, setCampaignId] = useState("")
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    async function debugMerklePath({
        leaf,
        proof,
        dbRoot
    }: {
        leaf: any
        proof: { s: string[], d: boolean[] }
        dbRoot: string
    }) {

        let current = leaf.toString().replace("field", "")

        console.log("START LEAF:", current)

        for (let i = 0; i < 10; i++) {

            const sibling = proof.s[i].replace("field", "")
            const dir = proof.d[i]

            const left = dir ? sibling : current
            const right = dir ? current : sibling

            const next = (await computeHash2(left, right))
                .toString()
                .replace("field", "")

            console.log(`LEVEL ${i + 1}`, {
                current,
                sibling,
                direction: dir,
                left,
                right,
                result: next
            })

            current = next
        }

        const normalizedDbRoot = dbRoot.replace("field", "")

        console.log("FINAL RESULT", {
            reconstructedRoot: current,
            dbRoot: normalizedDbRoot,
            match: current === normalizedDbRoot
        })
    }

    async function loadCampaign() {

        if (!campaignId) return

        try {

            setLoading(true)

            const res = await fetch(`/api/campaigns/${campaignId}/debug-proof`)
            const json = await res.json()

            if (!res.ok) {
                alert(json.error || "Failed to load debug proof")
                return
            }
            console.log(json)
            const address = json.walletAddress
            const payoutRaw = json.payout.toString().replace("u64", "")
            const proof = json.proof
            const root = json.campaignRoot
            console.log(payoutRaw)

            /* ---------------- SECRET ---------------- */

            const secretField = await generateDeterministicSecret(address, campaignId)
            const secret = secretField.toString()

            /* ---------------- COMMITMENT ---------------- */

            const commitment = await computeCommitment(secretField)

            /* ---------------- LEAF ---------------- */

            const leaf = await computeLeaf(commitment, payoutRaw)

            await debugMerklePath({
                leaf,
                proof: {
                    s: [
                        proof.s1, proof.s2, proof.s3, proof.s4, proof.s5,
                        proof.s6, proof.s7, proof.s8, proof.s9, proof.s10
                    ],
                    d: [
                        proof.d1, proof.d2, proof.d3, proof.d4, proof.d5,
                        proof.d6, proof.d7, proof.d8, proof.d9, proof.d10
                    ]
                },
                dbRoot: root
            })

            /* ---------------- PROOF ROOT RECONSTRUCTION ---------------- */

            let current = leaf
            const steps: any[] = []

            for (let i = 1; i <= 10; i++) {

                const sibling = proof[`s${i}`]
                const dir = proof[`d${i}`]

                const left = dir ? sibling : current
                const right = dir ? current : sibling

                const next = await computeHash2(left, right)

                const command =
                    `leo run debug_step ${current} ${sibling} ${dir}`

                steps.push({
                    level: i,
                    command,
                    expected: next.toString()
                })

                current = next
            }

            const reconstructedRoot = current.toString()

            /* ---------------- DEBUG TREE ---------------- */

            const tree = await buildMerkleTree([leaf])
            const debugRoot = tree.root.toString()

            /* ---------------- HARDCODED CSV TREE ---------------- */

            const hardcodedCampaignId =
                "1198462358568515927354527236442976562844425406441443040830047049345953060246field"

            const hardcodedRows = [
                {
                    address: "aleo1ryjv7hmxyc0ty7mtpe5auhqs992jrtn4r3s45lh7ph5mm5p67crsupmn7l",
                    amount: 0.1
                },
                {
                    address: "aleo1l5ukuke6t3wzg8fzuvkk8yxjnqye8vslyx87zxjl6fwaupaujcpq2uvuh4",
                    amount: 0.2
                }
            ]

            const hardcodedLeaves: any[] = []

            for (const row of hardcodedRows) {

                const payoutMicro = Math.floor(row.amount * 1_000_000_000_000)

                const secret = await generateDeterministicSecret(
                    row.address,
                    hardcodedCampaignId
                )

                const commitment = await computeCommitment(secret)

                const leaf = await computeLeaf(
                    commitment,
                    payoutMicro.toString()
                )

                hardcodedLeaves.push(leaf)
            }

            const hardcodedTree = await buildMerkleTree(hardcodedLeaves)
            const hardcodedRoot = hardcodedTree.root.toString()

            /* ---------------- COMMANDS ---------------- */

            const proofStruct = `{
  s1: ${proof.s1}, s2: ${proof.s2}, s3: ${proof.s3}, s4: ${proof.s4}, s5: ${proof.s5},
  s6: ${proof.s6}, s7: ${proof.s7}, s8: ${proof.s8}, s9: ${proof.s9}, s10: ${proof.s10},
  d1: ${proof.d1}, d2: ${proof.d2}, d3: ${proof.d3}, d4: ${proof.d4}, d5: ${proof.d5},
  d6: ${proof.d6}, d7: ${proof.d7}, d8: ${proof.d8}, d9: ${proof.d9}, d10: ${proof.d10}
}`

            const commitmentCommand =
                `leo run debug_commitment ${secret}`

            const leafCommand =
                `leo run debug_leaf ${secret} ${payoutRaw}u64`

            const alignmentCommand =
                `leo run test_merkle_alignment ${secret} ${payoutRaw}u64 "${proofStruct}"`

            const claimCommand =
                `leo run claim_distribution ${campaignId} ${reconstructedRoot} ${payoutRaw}u64 ${secret} "${proofStruct}"`

            setData({
                address,
                payout: `${payoutRaw}u64`,
                root,
                secret,
                commitment: commitment.toString(),
                leaf: leaf.toString(),

                debugRoot,
                reconstructedRoot,
                hardcodedRoot,

                steps,

                commitmentCommand,
                leafCommand,
                alignmentCommand,
                claimCommand
            })

        } catch (err) {

            console.error(err)
            alert("Failed to load debug data")

        } finally {

            setLoading(false)

        }

    }

    function copy(text: string) {
        navigator.clipboard.writeText(text)
        alert("Copied!")
    }

    return (

        <div className="min-h-screen bg-black text-white p-10 font-mono">

            <h1 className="text-2xl font-bold mb-8 text-yellow-400">
                ZK Campaign Debugger
            </h1>

            <div className="flex gap-4 mb-10">

                <input
                    placeholder="Campaign ID"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="bg-gray-900 border border-gray-700 p-3 rounded w-[600px]"
                />

                <button
                    onClick={loadCampaign}
                    disabled={loading}
                    className="bg-blue-600 px-6 py-3 rounded font-bold"
                >
                    {loading ? "Loading..." : "Load Campaign"}
                </button>

            </div>

            {data && (

                <div className="space-y-10">

                    <div className="bg-gray-900 p-6 rounded border border-gray-700">

                        <h2 className="text-green-400 mb-4 text-lg">Computed Values</h2>

                        <p>Secret: {data.secret}</p>
                        <p>Commitment: {data.commitment}</p>
                        <p>Leaf: {data.leaf}</p>

                        <p className="mt-4 text-yellow-400">Debug Root</p>
                        <p>{data.debugRoot}</p>

                        <p className="mt-4 text-yellow-400">Proof Reconstructed Root</p>
                        <p>{data.reconstructedRoot}</p>

                        <p className="mt-4 text-yellow-400">Hardcoded CSV Root</p>
                        <p>{data.hardcodedRoot}</p>

                        <p className="mt-4 text-yellow-400">Campaign Root (DB)</p>
                        <p>{data.root}</p>

                    </div>

                    {data.steps.map((step: any) => (
                        <CommandBlock
                            key={step.level}
                            title={`Merkle Step Test (Level ${step.level})`}
                            command={step.command}
                            compare={step.expected}
                            copy={copy}
                        />
                    ))}

                    <CommandBlock
                        title="Full Claim Test"
                        command={data.claimCommand}
                        compare={"Transaction should succeed"}
                        copy={copy}
                    />

                </div>

            )}

        </div>

    )
}

function CommandBlock({ title, command, compare, copy }: any) {

    return (

        <div className="bg-gray-900 p-6 rounded border border-gray-700">

            <h2 className="text-blue-400 mb-4">{title}</h2>

            <code className="text-xs break-all text-pink-400">
                {command}
            </code>

            <p className="mt-3 text-green-400 text-sm">
                Compare Leo output with:
            </p>

            <p className="text-yellow-400 break-all text-xs">
                {compare}
            </p>

            <button
                onClick={() => copy(command)}
                className="mt-4 bg-gray-800 px-4 py-2 rounded"
            >
                Copy Command
            </button>

        </div>

    )
}