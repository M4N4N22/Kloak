"use client"

import { useCallback, useEffect, useState } from "react"

export type BotsOverview = {
  pulse: {
    online: boolean
    linked: boolean
    linkedUsers: number
    alerts: string
  }
  metrics: {
    linkedUsers: number
    trackedLinksCount: number
    paymentAlertsCount: number
    trackedVolume: number
  }
  feeds: {
    payments: Array<{
      id: string
      txHash: string | null
      amount: string
      token: "ALEO" | "USDCX" | "USAD"
      status: string
      source: string
      createdAt: string
      channel: string
    }>
    links: Array<{
      id: string
      title: string
      requestId: string
      createdAt: string
      active: boolean
      paymentsReceived: number
      totalVolume: number
    }>
  }
}

export function useBotsOverview(creatorAddress?: string | null) {
  const [overview, setOverview] = useState<BotsOverview | null>(null)
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

      const res = await fetch(`/api/bots/overview?creator=${encodeURIComponent(creatorAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load bot overview")
      }

      setOverview(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bot overview")
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
