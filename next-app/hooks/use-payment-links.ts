"use client"

import { useCallback, useEffect, useState } from "react"

import type { PaymentLinkTemplateId } from "@/features/payment-links/lib/templates"

export type PaymentLinkRecord = {
  id: string
  creatorAddress: string | null
  requestId: string
  title: string
  description: string | null
  template: PaymentLinkTemplateId
  successMessage: string | null
  redirectUrl: string | null
  suggestedAmounts: number[] | null
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
}

export function usePaymentLinks(creatorAddress?: string | null) {
  const [links, setLinks] = useState<PaymentLinkRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!creatorAddress) {
      setLinks([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/payment-links?creator=${encodeURIComponent(creatorAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load payment links")
      }

      setLinks(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payment links")
    } finally {
      setLoading(false)
    }
  }, [creatorAddress])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    links,
    loading,
    error,
    refresh,
  }
}
