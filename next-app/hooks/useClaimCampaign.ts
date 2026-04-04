"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import {
  generateDeterministicSecret,
  computeCommitment,
  computeLeaf,
  computeHash2
} from "@/core/zk"

export type ClaimStatus =
  | "idle"
  | "signing"
  | "pending"
  | "broadcasting"
  | "finalized"
  | "error"

export function useClaimCampaign(campaign: any) {

  const {
    connected,
    address,
    executeTransaction,
    transactionStatus
  } = useWallet()

  const [status, setStatus] = useState<ClaimStatus>("idle")
  const [txId, setTxId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleClaim = async () => {

    if (!connected || !address) return

    try {

      setLoading(true)
      setErrorMessage(null)

      const campaignId = campaign.id;

      /* ---------------- FETCH PROOF FROM API ---------------- */

      const res = await fetch(`/api/campaigns/${campaignId}/debug-proof`)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch proof")
      }

      const walletAddress = json.walletAddress
      const payoutRaw = json.payout.toString().replace("u64", "")
      const proof = json.proof

      /* ---------------- SECRET ---------------- */

      const secretField = await generateDeterministicSecret(
        walletAddress,
        campaignId
      )

      const secret = secretField.toString()

      /* ---------------- COMMITMENT ---------------- */

      const commitment = await computeCommitment(secretField)

      /* ---------------- LEAF ---------------- */

      const leaf = await computeLeaf(commitment, payoutRaw)

      /* ---------------- ROOT RECONSTRUCTION ---------------- */

      let current = leaf

      for (let i = 1; i <= 10; i++) {

        const sibling = proof[`s${i}`]
        const dir = proof[`d${i}`]

        const left = dir ? sibling : current
        const right = dir ? current : sibling

        current = await computeHash2(left, right)
      }

      const reconstructedRoot = current.toString()

      /* ---------------- PROOF STRUCT ---------------- */

      const proofStruct = `{
  s1: ${proof.s1}, s2: ${proof.s2}, s3: ${proof.s3}, s4: ${proof.s4}, s5: ${proof.s5},
  s6: ${proof.s6}, s7: ${proof.s7}, s8: ${proof.s8}, s9: ${proof.s9}, s10: ${proof.s10},
  d1: ${proof.d1}, d2: ${proof.d2}, d3: ${proof.d3}, d4: ${proof.d4}, d5: ${proof.d5},
  d6: ${proof.d6}, d7: ${proof.d7}, d8: ${proof.d8}, d9: ${proof.d9}, d10: ${proof.d10}
}`

      /* ---------------- FINAL INPUTS ---------------- */

      const inputs = [
        campaignId,
        reconstructedRoot,
        `${payoutRaw}u64`,
        secret,
        proofStruct
      ]

      console.log("CLAIM INPUTS:", inputs)

      /* ---------------- EXECUTE TX ---------------- */

      setStatus("signing")

      const resultPromise = executeTransaction({
        program: "kloak_protocol_v8.aleo",
        function: "claim_distribution",
        inputs,
        privateFee: false
      })

      const provingTimeout = setTimeout(() => {
        setStatus("pending")
      }, 2000)

      const result = await resultPromise

      clearTimeout(provingTimeout)

      if (!result?.transactionId) {
        setStatus("error")
        setErrorMessage("Transaction rejected.")
        return
      }

      let txId = result.transactionId
      setTxId(txId)

      /* ---------------- CONFIRMATION ---------------- */

      setStatus("broadcasting")

      let attempts = 0

      const poll = setInterval(async () => {

        attempts++

        try {

          const response = await transactionStatus(txId)

          const realTxId = response?.transactionId

          if (realTxId && realTxId !== txId) {
            txId = realTxId
            setTxId(realTxId)
          }

          const currentStatus =
            (typeof response === "string"
              ? response
              : response.status)?.toLowerCase()

          if (
            ["finalized", "completed", "accepted"].includes(currentStatus)
          ) {

            clearInterval(poll)

            const finalId = realTxId || txId

            await fetch(`/api/campaigns/${campaign.id}/claim`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                claimer: address,
                payout: payoutRaw,
                txHash: finalId
              })
            })

            setStatus("finalized")
          }

          if (["failed", "rejected"].includes(currentStatus)) {

            clearInterval(poll)

            setStatus("error")
            setErrorMessage(`Transaction ${currentStatus}`)
          }

          if (attempts > 150) {

            clearInterval(poll)

            setStatus("error")
            setErrorMessage("Network confirmation timeout")
          }

        } catch (err) {
          console.warn(err)
        }

      }, 5000)

    } catch (err: any) {

      setStatus("error")
      setErrorMessage(err?.message || "Claim failed")

    } finally {

      setLoading(false)

    }
  }

  return {
    handleClaim,
    status,
    txId,
    loading,
    errorMessage,
    connected
  }
}