"use client"

import { useEffect, useState, useCallback } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

type Balances = {
  aleo: {
    public: number | null
    private: number | null
  }
  tokens: {
    usdcx: number | null
  }
}

const PRIVATE_BALANCE_CACHE: Record<
  string,
  { value: number; timestamp: number }
> = {}

const PRIVATE_CACHE_TTL = 60 * 1000

export function useBalances() {
  const { address, connected, requestRecords, decrypt } = useWallet()

  const [balances, setBalances] = useState<Balances>({
    aleo: { public: null, private: null },
    tokens: { usdcx: null },
  })

  const [loading, setLoading] = useState(false)

  const fetchPublicBalances = async () => {
    if (!address) return null

    const res = await fetch(`/api/balances?address=${address}`)
    if (!res.ok) throw new Error("Public balance fetch failed")

    return res.json()
  }

  const fetchPrivateBalance = async () => {
    if (!address) return null

    const cached = PRIVATE_BALANCE_CACHE[address]

    if (cached && Date.now() - cached.timestamp < PRIVATE_CACHE_TTL) {
      console.log("Using cached private balance")
      return cached.value
    }

    try {
      console.log("Scanning private records")

      const records: any = await requestRecords("credits.aleo", true)

      if (!records || !Array.isArray(records)) return null

      let microcredits = 0

      const decryptJobs = records
        .filter((r: any) => r.recordCiphertext)
        .map(async (r: any) => {
          const decrypted = await decrypt(r.recordCiphertext)

          const match = decrypted.match(/microcredits:\s*(\d+)u64/)

          if (match) microcredits += Number(match[1])
        })

      await Promise.all(decryptJobs)

      const result = microcredits / 1_000_000

      PRIVATE_BALANCE_CACHE[address] = {
        value: result,
        timestamp: Date.now(),
      }

      return result
    } catch (err) {
      console.warn("Private balance scan failed:", err)
      return null
    }
  }

  const fetchBalances = useCallback(async () => {
    if (!connected || !address) {
      setBalances({
        aleo: { public: null, private: null },
        tokens: { usdcx: null },
      })
      return
    }

    try {
      setLoading(true)

      const [publicData, privateAleo] = await Promise.all([
        fetchPublicBalances(),
        fetchPrivateBalance(),
      ])

      setBalances({
        aleo: {
          public: Number(publicData?.aleo ?? 0),
          private: privateAleo,
        },
        tokens: {
          usdcx: Number(publicData?.usdcx ?? 0),
        },
      })
    } catch (err) {
      console.warn("Balance fetch error:", err)

      setBalances({
        aleo: { public: null, private: null },
        tokens: { usdcx: null },
      })
    } finally {
      setLoading(false)
    }
  }, [address, connected])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return {
    balances,
    loading,
    refreshBalances: fetchBalances,
  }
}