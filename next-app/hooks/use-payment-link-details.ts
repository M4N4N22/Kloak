"use client"

import { useCallback, useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import {
  clearCachedCreatorAccessPayload,
  CREATOR_READ_SCOPE,
  getOrCreateCreatorAccessPayload,
} from "@/lib/creator-access"

import type { PaymentLinkTemplateId } from "@/features/payment-links/lib/templates"

export type PaymentLinkDetail = {
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
  payments: Array<{
    id: string
    txHash: string | null
    amount: string
    token: "ALEO" | "USDCX" | "USAD"
    status: string
    createdAt: string
    proofCount: number
  }>
  analytics: {
    conversionRate: number
  }
}

export function usePaymentLinkDetails(linkId?: string | null, creatorAddress?: string | null) {
  const { signMessage } = useWallet()
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
      })
      const res = await fetch(`/api/payment-links/${encodeURIComponent(linkId)}?${searchParams.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearCachedCreatorAccessPayload(CREATOR_READ_SCOPE, creatorAddress)
        }
        throw new Error(data.error || "Failed to load payment link details")
      }

      setDetail(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payment link details")
    } finally {
      setLoading(false)
    }
  }, [creatorAddress, linkId, signMessage])

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
