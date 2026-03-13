"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

type Status =
  | "idle"
  | "signing"
  | "broadcasting"
  | "finalizing"
  | "completed"
  | "error"

interface FundParams {
  campaignId: string
  amount: number
}

export function useFundCampaign() {

  const { connected, address, executeTransaction, transactionStatus } = useWallet()

  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const fundCampaign = async ({ campaignId, amount }: FundParams) => {

    if (!connected || !address) {
      throw new Error("Wallet not connected")
    }

    try {

      const requiredMicro = BigInt(Math.floor(amount * 1_000_000))

      /* ---------------- SIGN TX ---------------- */

      setStatus("signing")

      const result = await executeTransaction({
        program: "kloak_protocol_v5.aleo",
        function: "deposit_campaign_funds",
        inputs: [
          campaignId,
          `${requiredMicro}u64`
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

          if (!res) {
            await new Promise(r => setTimeout(r, 4000))
            attempts++
            continue
          }

          /* update shield tx → real network tx */

          const realTxId = res?.transactionId

          if (realTxId && realTxId !== txId) {
            console.log("Updating TX ID:", realTxId)
            txId = realTxId
          }

          const txStatus =
            (typeof res === "string" ? res : res.status)?.toLowerCase()

          if (["finalized", "accepted", "completed"].includes(txStatus)) {
            confirmed = true
            break
          }

          if (["failed", "rejected"].includes(txStatus)) {
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

      /* ---------------- UPDATE DB ---------------- */

      await fetch(`/api/campaigns/${campaignId}/fund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          txHash: txId,
          amount: requiredMicro.toString()
        })
      })

      setStatus("completed")

      return { txId }

    } catch (err: any) {

      console.error(err)

      setError(err.message || "Funding failed")

      setStatus("error")

      throw err
    }
  }

  return {
    fundCampaign,
    status,
    error
  }
}