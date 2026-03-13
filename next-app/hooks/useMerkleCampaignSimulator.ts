"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import {
  generateDeterministicSecret,
  computeCommitment,
  computeLeaf
} from "@/core/zk"

import { buildMerkleTree, generateProof } from "@/core/merkle"

type CsvRow = {
  address: string
  amount: number
}

export function useMerkleCampaignSimulator() {

  const { executeTransaction } = useWallet()

  const [result, setResult] = useState<any>(null)

  async function simulate(rows: CsvRow[], campaignId: string) {

    console.log("===== SIMULATION START =====")

    const leaves: any[] = []
    const recipients: any[] = []

    /* ---------------- BUILD LEAVES ---------------- */

    for (const row of rows) {

      const payoutMicro = Math.floor(row.amount * 1_000_000)

      const secret = await generateDeterministicSecret(
        row.address,
        campaignId.replace("field","")
      )

      const commitment = await computeCommitment(secret)

      const leaf = await computeLeaf(
        commitment,
        payoutMicro.toString()
      )

      leaves.push(leaf)

      recipients.push({
        ...row,
        payout: payoutMicro,
        secret,
        leaf
      })
    }

    /* ---------------- BUILD TREE ---------------- */

    const tree = await buildMerkleTree(leaves)
    const root = tree.root.toString()

    console.log("MERKLE ROOT:", root)

    /* ---------------- GENERATE PROOFS ---------------- */

    const proofs = recipients.map((r, index) => {

      const { s, d } = generateProof(tree, index)

      return {
        ...r,
        proof: { s, d }
      }
    })

    /* ---------------- EXECUTE CREATE CAMPAIGN ---------------- */

    console.log("Creating campaign on-chain")

    const totalBudget =
      recipients.reduce((sum, r) => sum + r.payout, 0)

    const createTx = await executeTransaction({
      program: "kloak_protocol_v5.aleo",
      function: "create_campaign",
      inputs: [
        campaignId,
        root,
        "0u8",
        `${totalBudget}u64`
      ],
      privateFee: false
    })

    console.log("CREATE TX:", createTx)

    /* ---------------- EXECUTE CLAIM FOR FIRST RECIPIENT ---------------- */

    const first = proofs[0]

    const p = first.proof

    const proofStruct = `{
      s1:${p.s[0]},
      s2:${p.s[1]},
      s3:${p.s[2]},
      s4:${p.s[3]},
      s5:${p.s[4]},
      s6:${p.s[5]},
      s7:${p.s[6]},
      s8:${p.s[7]},
      s9:${p.s[8]},
      s10:${p.s[9]},
      d1:${p.d[0]},
      d2:${p.d[1]},
      d3:${p.d[2]},
      d4:${p.d[3]},
      d5:${p.d[4]},
      d6:${p.d[5]},
      d7:${p.d[6]},
      d8:${p.d[7]},
      d9:${p.d[8]},
      d10:${p.d[9]}
    }`

    console.log("Executing claim_distribution")

    const claimTx = await executeTransaction({
      program: "kloak_protocol_v5.aleo",
      function: "claim_distribution",
      inputs: [
        campaignId,
        root,
        `${first.payout}u64`,
        first.secret.toString(),
        proofStruct
      ],
      privateFee: false
    })

    console.log("CLAIM TX:", claimTx)

    setResult({
      root,
      proofs
    })
  }

  return {
    simulate,
    result
  }
}