"use client"

import { useCallback, useEffect, useState } from "react"

export type CompliancePayment = {
  id: string
  txHash: string
  requestId: string
  amount: string
  token: "ALEO" | "USDCX" | "USAD"
  createdAt: string
  title: string
  description: string | null
  payerAddress: string | null
  merchantAddress: string | null
  direction: "sent" | "received"
}

type CompliancePaymentsResponse = {
  sent: CompliancePayment[]
  received: CompliancePayment[]
}

export function useCompliancePayments(viewerAddress?: string | null) {
  const [payments, setPayments] = useState<CompliancePaymentsResponse>({ sent: [], received: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Failed to load compliance payments"

  const refresh = useCallback(async () => {
    if (!viewerAddress) {
      setPayments({ sent: [], received: [] })
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/proof/payments?viewer=${encodeURIComponent(viewerAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load compliance payments")
      }

      setPayments({
        sent: data.sent || [],
        received: data.received || [],
      })
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
    payments,
    loading,
    error,
    refresh,
  }
}
