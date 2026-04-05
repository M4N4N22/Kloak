"use client"

import { useCallback, useEffect, useState } from "react"

export type PaymentLinkDetail = {
  id: string
  creatorAddress: string | null
  requestId: string
  title: string
  description: string | null
  amount: string | null
  token: "ALEO" | "USDCX" | "USAD"
  allowCustomAmount: boolean
  maxPayments: number | null
  paymentsReceived: number
  expiresAt: string | null
  active: boolean
  views: number
  uniqueVisitors: number
  totalVolume: string
  createdAt: string
  updatedAt: string
  payments: Array<{
    id: string
    txHash: string | null
    amount: string
    token: "ALEO" | "USDCX" | "USAD"
    status: string
    createdAt: string
    payerAddress: string | null
    proofCount: number
  }>
  analytics: {
    conversionRate: number
  }
}

export function usePaymentLinkDetails(linkId?: string | null, creatorAddress?: string | null) {
  const [detail, setDetail] = useState<PaymentLinkDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!linkId || !creatorAddress) {
      setDetail(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/payment-links/${encodeURIComponent(linkId)}?creator=${encodeURIComponent(creatorAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load payment link details")
      }

      setDetail(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payment link details")
    } finally {
      setLoading(false)
    }
  }, [creatorAddress, linkId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    detail,
    loading,
    error,
    refresh,
  }
}
