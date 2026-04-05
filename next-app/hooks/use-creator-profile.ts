"use client"

import { useCallback, useEffect, useState } from "react"

type CreatorProfile = {
  walletAddress: string
  isProUser: boolean
}

export function useCreatorProfile(walletAddress?: string | null) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/creator-profile?walletAddress=${encodeURIComponent(walletAddress)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load creator profile")
      }

      setProfile(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load creator profile")
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

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
