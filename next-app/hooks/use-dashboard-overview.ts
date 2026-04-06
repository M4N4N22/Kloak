"use client"

import { useCallback, useEffect, useState } from "react"

export type DashboardOverview = {
  pulse: {
    telegram: {
      online: boolean
      linkedUsers: number
    }
    webhooks: {
      status: string
      activeEndpoints: number
    }
    proofs: {
      live: boolean
    }
  }
  metrics: {
    totalVolume: number
    activeLinks: number
    totalPayments: number
    totalViews: number
    conversionRate: number
    chart: Array<{
      date: string
      label: string
      volume: number
    }>
  }
  connectivity: {
    telegram: {
      status: string
      linkedUsers: number
      interactions: number
    }
    webhooks: {
      status: string
      activeEndpoints: number
      recentDeliveries: number
    }
    automation: {
      status: string
      triggers: number
    }
  }
  feeds: {
    payments: Array<{
      id: string
      amount: string
      token: "ALEO" | "USDCX" | "USAD"
      status: string
      source: string
      sourceType: string
      createdAt: string
      txHash: string | null
    }>
  }
}

export function useDashboardOverview(creatorAddress?: string | null) {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
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

      const res = await fetch(`/api/dashboard?creator=${encodeURIComponent(creatorAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load dashboard overview")
      }

      setOverview(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard overview")
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
