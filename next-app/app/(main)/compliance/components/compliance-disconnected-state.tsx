"use client"

import { ShieldEllipsis } from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Card, CardContent } from "@/components/ui/card"

export function ComplianceDisconnectedState() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-neutral-900 via-background to-primary/10 p-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <div className="flex items-center gap-3 text-primary">
            <ShieldEllipsis className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">Compliance Console</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Connect the wallet that owns the compliance receipts.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Production disclosure flows depend on the operator wallet holding the payer or receiver receipt record.
            Connect Shield to review proofs, issue new disclosures, and verify payloads.
          </p>
          <div className="pt-2">
            <WalletConnect />
          </div>
        </div>
      </div>

      <Card className="border-foreground/10 bg-black/20">
        <CardContent className="grid gap-4 p-6 text-sm text-muted-foreground md:grid-cols-3">
          <div>
            <div className="font-medium text-foreground">Payer workflows</div>
            <p className="mt-1">Show a payment exists, prove the exact amount, or satisfy a reimbursement threshold.</p>
          </div>
          <div>
            <div className="font-medium text-foreground">Receiver workflows</div>
            <p className="mt-1">Issue receipt-side proofs for accounting, tax reporting, or revenue reconciliation.</p>
          </div>
          <div>
            <div className="font-medium text-foreground">Verification</div>
            <p className="mt-1">Share compact JSON proofs with partners and verify them without exposing receipt secrets.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
