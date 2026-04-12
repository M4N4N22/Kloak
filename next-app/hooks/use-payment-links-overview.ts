"use client"

import { useCallback, useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import {
  clearCachedCreatorAccessPayload,
  CREATOR_READ_SCOPE,
  getOrCreateCreatorAccessPayload,
} from "@/lib/creator-access"

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

export function usePaymentLinksOverview(
  creatorAddress?: string | null,
  selectedToken: "ALEO" | "USDCX" | "USAD" = "ALEO",
) {
  const { signMessage } = useWallet()
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

      const access = await getOrCreateCreatorAccessPayload({
        scope: CREATOR_READ_SCOPE,
        viewerAddress: creatorAddress,
        signMessage,
      })
      const searchParams = new URLSearchParams({
        viewerAddress: access.viewerAddress,
        scope: access.scope,
        issuedAt: access.issuedAt,
        signature: access.signature,
        token: selectedToken,
      })
      const res = await fetch(`/api/analytics/payment-links?${searchParams.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearCachedCreatorAccessPayload(CREATOR_READ_SCOPE, creatorAddress)
        }
        throw new Error(data.error || "Failed to load payment link analytics")
      }

      setOverview(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payment link analytics")
    } finally {
      setLoading(false)
    }
  }, [creatorAddress, signMessage, selectedToken])

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
