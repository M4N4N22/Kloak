"use client"

import { useCallback, useEffect, useState } from "react"
import {
  clearCachedComplianceAccessPayload,
  COMPLIANCE_READ_SCOPE,
  getCachedComplianceAccessPayload,
} from "@/lib/compliance-access"

export type SelectiveDisclosureProof = {
  proofId: string
  paymentTxHash: string
  disclosureTxHash?: string | null
  requestId: string
  ownerAddress: string
  counterpartyAddress: string | null
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
    const viewer = viewerAddress?.trim()

    if (!viewer) {
      setProofs([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const accessPayload = getCachedComplianceAccessPayload(COMPLIANCE_READ_SCOPE, viewer)

      if (!accessPayload) {
        setProofs([])
        return
      }

      const res = await fetch("/api/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accessPayload),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearCachedComplianceAccessPayload(COMPLIANCE_READ_SCOPE, viewer)
          throw new Error("Your wallet confirmation expired or could not be checked. Please unlock your compliance records again.")
        }

        throw new Error(data.error || "We couldn't load your issued proofs right now.")
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
