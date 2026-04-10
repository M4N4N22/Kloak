"use client"

import { useCallback, useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import {
  buildCreatorAccessMessage,
  bytesToBase64,
  clearCachedCreatorAccessPayload,
  CREATOR_READ_SCOPE,
  getCachedCreatorAccessPayload,
  setCachedCreatorAccessPayload,
  type CreatorAccessPayload,
} from "@/lib/creator-access"

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
  const { signMessage } = useWallet()
  const [overview, setOverview] = useState<BotsOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestCreatorReadAccess = useCallback(async (): Promise<CreatorAccessPayload> => {
    if (!creatorAddress) {
      throw new Error("Connect your wallet to load bot data.")
    }

    const cached = getCachedCreatorAccessPayload(CREATOR_READ_SCOPE, creatorAddress)

    if (cached) {
      return cached
    }

    if (!signMessage) {
      throw new Error("This wallet does not support signed creator access.")
    }

    const issuedAt = Date.now().toString()
    const message = buildCreatorAccessMessage({
      scope: CREATOR_READ_SCOPE,
      viewerAddress: creatorAddress,
      issuedAt,
    })
    const signatureBytes = await signMessage(new TextEncoder().encode(message))

    if (!signatureBytes) {
      throw new Error("This wallet did not return a creator access signature.")
    }

    const payload: CreatorAccessPayload = {
      viewerAddress: creatorAddress,
      scope: CREATOR_READ_SCOPE,
      issuedAt,
      signature: bytesToBase64(signatureBytes),
    }

    setCachedCreatorAccessPayload(payload)
    return payload
  }, [creatorAddress, signMessage])

  const refresh = useCallback(async () => {
    if (!creatorAddress) {
      setOverview(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const access = await requestCreatorReadAccess()
      const searchParams = new URLSearchParams({
        viewerAddress: access.viewerAddress,
        scope: access.scope,
        issuedAt: access.issuedAt,
        signature: access.signature,
      })
      const res = await fetch(`/api/bots/overview?${searchParams.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearCachedCreatorAccessPayload(CREATOR_READ_SCOPE, creatorAddress)
        }
        throw new Error(data.error || "Failed to load bot overview")
      }

      setOverview(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bot overview")
    } finally {
      setLoading(false)
    }
  }, [creatorAddress, requestCreatorReadAccess])

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
