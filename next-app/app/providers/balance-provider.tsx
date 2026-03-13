"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react"

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

type BalanceContextType = {
  balances: Balances
  loadingPublic: boolean
  loadingPrivate: boolean
  refreshPublicBalances: () => Promise<void>
  fetchPrivateBalance: () => Promise<void>
}

const BalanceContext = createContext<BalanceContextType | null>(null)

const CACHE: Record<string, { value: number; time: number }> = {}
const CACHE_TTL = 60_000

let activeScan: Promise<number | null> | null = null

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { address, connected, requestRecords, decrypt } = useWallet()

  const [loadingPublic, setLoadingPublic] = useState(false)
  const [loadingPrivate, setLoadingPrivate] = useState(false)

  const [balances, setBalances] = useState<Balances>({
    aleo: { public: null, private: null },
    tokens: { usdcx: null },
  })

  const fetchPublicBalances = async () => {
    if (!address) return null

    const res = await fetch(`/api/balances?address=${address}`)
    if (!res.ok) throw new Error("Public balance fetch failed")

    return res.json()
  }

  const scanPrivate = async () => {
    if (!address) return null

    const cached = CACHE[address]

    if (cached && Date.now() - cached.time < CACHE_TTL) {
      console.log("Using cached private balance")
      return cached.value
    }

    console.log("Scanning wallet records...")

    const records: any = await requestRecords("credits.aleo", true)

    const values = await Promise.all(
      records.map(async (r: any) => {
        if (!r.recordCiphertext || r.spent) return 0

        const decrypted = await decrypt(r.recordCiphertext)

        const match = decrypted.match(/microcredits:\s*(\d+)u64/)

        return match ? Number(match[1]) : 0
      })
    )

    const microcredits = values.reduce((a, b) => a + b, 0)

    const result = microcredits / 1_000_000

    CACHE[address] = {
      value: result,
      time: Date.now(),
    }

    return result
  }

  const fetchPrivateBalance = useCallback(async () => {
    if (!connected || !address) return

    try {
      setLoadingPrivate(true)

      if (!activeScan) {
        activeScan = scanPrivate().finally(() => {
          activeScan = null
        })
      }

      const privateBalance = await activeScan

      setBalances((prev) => ({
        ...prev,
        aleo: {
          ...prev.aleo,
          private: privateBalance,
        },
      }))
    } finally {
      setLoadingPrivate(false)
    }
  }, [address, connected])

  const refreshPublicBalances = useCallback(async () => {
    if (!connected || !address) return

    try {
      setLoadingPublic(true)

      const publicData = await fetchPublicBalances()

      setBalances((prev) => ({
        ...prev,
        aleo: {
          ...prev.aleo,
          public: Number(publicData?.aleo ?? 0),
        },
        tokens: {
          usdcx: Number(publicData?.usdcx ?? 0),
        },
      }))
    } finally {
      setLoadingPublic(false)
    }
  }, [address, connected])

  useEffect(() => {
    refreshPublicBalances()
  }, [refreshPublicBalances])

  return (
    <BalanceContext.Provider
      value={{
        balances,
        loadingPublic,
        loadingPrivate,
        refreshPublicBalances,
        fetchPrivateBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  )
}

export function useBalances() {
  const ctx = useContext(BalanceContext)

  if (!ctx) {
    throw new Error("useBalances must be used inside BalanceProvider")
  }

  return ctx
}