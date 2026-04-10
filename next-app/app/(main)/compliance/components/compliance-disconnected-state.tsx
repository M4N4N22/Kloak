"use client"

import { ShieldEllipsis } from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Card, CardContent } from "@/components/ui/card"

export function ComplianceDisconnectedState() {
  return (
    <div className="space-y-8">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden p-4 sm:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ShieldEllipsis className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Audit Center</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Create, Review and share your <br />
              payment proofs.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
              Connect the wallet you used for payments to generate private receipts.
              You can share proof of payment with partners without revealing your full history or balance.
            </p>
          </div>

          <div className="pt-4">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* 2. CAPABILITY GRID */}
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureMiniCard
          title="For Payers"
          desc="Prove you made a payment or met a specific amount for reimbursements."
        />
        <FeatureMiniCard
          title="For Receivers"
          desc="Create reports for accounting, taxes, or income verification."
        />
        <FeatureMiniCard
          title="Instant Verification"
          desc="Share simple links that let others verify your proof in one click."
        />
      </div>
    </div>
  )
  // Simple helper for the bottom grid
  function FeatureMiniCard({ title, desc }: { title: string; desc: string }) {
    return (
      <div className="rounded-[2rem] border border-foreground/5 bg-zinc-900/40 p-6 transition-colors hover:bg-zinc-900/60">
        <h3 className="text-sm font-bold text-foreground mb-2 tracking-tight">{title}</h3>
        <p className="text-xs leading-relaxed text-zinc-500">{desc}</p>
      </div>
    )
  }
}
