"use client"

import { ShieldCheck } from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"

export function DashboardDisconnectedState() {
  return (
    <div className="rounded-[2.5rem] max-w-7xl mx-auto border border-dashed border-foreground/10 bg-[radial-gradient(circle_at_top,rgba(156,227,125,0.12),transparent_30%),rgba(255,255,255,0.02)] p-16 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
        <div className="rounded-3xl bg-primary/10 p-4 text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Connect Shield Wallet</h1>
          <p className="text-sm leading-7 text-neutral-400">
            Access your payment operations dashboard, manage private payment links, generate selective disclosure proofs, and connect automation surfaces from one place.
          </p>
        </div>
        <WalletConnect />
      </div>
    </div>
  )
}
