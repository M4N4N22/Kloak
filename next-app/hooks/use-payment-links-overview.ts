"use client"

import { useCallback, useEffect, useState } from "react"

export type PaymentLinksOverview = {
  totals: {
    totalVolume: number
    totalPayments: number
    totalViews: number
    uniqueVisitors: number
    activeLinks: number
    conversionRate: number
  }
  insights: {
    highestRevenueLink: {
      id: string
      title: string
      revenue: number
    } | null
    highestConversionLink: {
      id: string
      title: string
      conversion: number
    } | null
    topLinksThisWeek: Array<{
      id: string
      title: string
      weeklyRevenue: number
    }>
  }
}

export function usePaymentLinksOverview(creatorAddress?: string | null) {
  const [overview, setOverview] = useState<PaymentLinksOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!creatorAddress) {
      setOverview(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/analytics/payment-links?creator=${encodeURIComponent(creatorAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load payment link analytics")
      }

      setOverview(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payment link analytics")
    } finally {
      setLoading(false)
    }
  }, [creatorAddress])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    overview,
    loading,
    error,
    refresh,
  }
}
