"use client"

import type { ReactNode } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { ComplianceDisconnectedState } from "@/app/(main)/compliance/components/compliance-disconnected-state"

export function ComplianceAccessGate({ children }: { children: ReactNode }) {
  const { connected } = useWallet()

  if (!connected) {
    return <ComplianceDisconnectedState />
  }

  return <>{children}</>
}
