"use client"

import { useCallback, useEffect, useState } from "react"

export type SelectiveDisclosureProof = {
  proofId: string
  paymentTxHash: string
  disclosureTxHash?: string | null
  requestId: string
  ownerAddress: string
  counterpartyAddress: string
  actorRole: "payer" | "receiver"
  proofType: "existence" | "amount" | "threshold"
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  paymentTimestamp?: string | null
  proverAddress: string
  commitment: string
  nullifier?: string | null
  contractProgram: string
  constraints: {
    minAmount?: number
    maxAmount?: number
    requestId?: string
    timestampFrom?: string
    timestampTo?: string
  }
  proofDigest: string
  status: "ACTIVE" | "REVOKED"
  createdAt: string
  revokedAt: string | null
  verificationCount: number
}

export function useSelectiveDisclosureProofs(viewerAddress?: string | null) {
  const [proofs, setProofs] = useState<SelectiveDisclosureProof[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Failed to load selective disclosure proofs"

  const refresh = useCallback(async () => {
    if (!viewerAddress) {
      setProofs([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/proof?viewer=${encodeURIComponent(viewerAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load selective disclosure proofs")
      }

      setProofs(data.proofs || [])
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [viewerAddress])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    proofs,
    loading,
    error,
    refresh,
    setProofs,
  }
}
