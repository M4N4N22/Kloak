"use client"

import { useCallback, useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import {
  clearCachedCreatorAccessPayload,
  CREATOR_READ_SCOPE,
  getCachedCreatorAccessPayload,
  getOrCreateCreatorAccessPayload,
} from "@/lib/creator-access"

type CreatorProfile = {
  walletAddress: string
  isProUser: boolean
}

export function useCreatorProfile(
  walletAddress?: string | null,
  options?: { autoAuthorize?: boolean },
) {
  const { signMessage } = useWallet()
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const autoAuthorize = options?.autoAuthorize ?? true

  const refresh = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const cached = getCachedCreatorAccessPayload(CREATOR_READ_SCOPE, walletAddress)

      if (!autoAuthorize && !cached) {
        setProfile(null)
        return
      }

      const access = cached ?? await getOrCreateCreatorAccessPayload({
        scope: CREATOR_READ_SCOPE,
        viewerAddress: walletAddress,
        signMessage,
      })
      const searchParams = new URLSearchParams({
        viewerAddress: access.viewerAddress,
        scope: access.scope,
        issuedAt: access.issuedAt,
        signature: access.signature,
      })
      const res = await fetch(`/api/creator-profile?${searchParams.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearCachedCreatorAccessPayload(CREATOR_READ_SCOPE, walletAddress)
        }
        throw new Error(data.error || "Failed to load creator profile")
      }

      setProfile(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load creator profile")
    } finally {
      setLoading(false)
    }
  }, [autoAuthorize, signMessage, walletAddress])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    profile,
    loading,
    error,
    refresh,
  }
}
