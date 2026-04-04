"use client"

import { ReceiptText, ScanSearch, ShieldCheck, Wallet, ArrowRight, Fingerprint } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ComplianceHeaderProps = {
  actorAddress: string
  proofCount: number
  activeProofCount: number
}

const summaryItems = [
  {
    title: "Receipt-based proofs",
    description: "Secrets stay client-side. Wallet-owned receipts power all disclosures.",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Role-aware workflows",
    description: "Supports both payer and receiver attestations in one lifecycle.",
    icon: Wallet,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Compliance-ready modes",
    description: "Threshold and exact amount proofs for rapid operational audits.",
    icon: ReceiptText,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
]

export function ComplianceHeader({
  actorAddress,
  proofCount,
  activeProofCount,
}: ComplianceHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Main Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem]  bg-zinc-950 p-8 md:p-12">
        {/* Animated Gradient Orbs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1">
              <Fingerprint className="mr-1 h-3 w-3" /> Compliance Console
            </Badge>
            <Badge variant="outline" className="border-white/10 text-white/60">
              Selective Disclosure v2
            </Badge>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div className="space-y-4">
              <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl lg:leading-[1.1]">
                Private payments. <br />
                <span className="text-zinc-500">Publicly auditable.</span>
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-zinc-400">
                Generate auditable ZK-proofs from private records. You choose what to disclose; we keep the verification flows production-ready.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard label="Operator" value={actorAddress} isAddress />
              <StatCard label="Inventory" value={`${proofCount} Total`} />
              <StatCard label="Active" value={`${activeProofCount} Disclosures`} isHighlight />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryItems.map((item) => (
          <Card key={item.title} className="group  ">
            <CardContent className="p-6">
              <div className={cn("mb-4 inline-flex rounded-xl p-3", item.bg, item.color)}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process Stepper */}
      <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-1">
        <div className="grid grid-cols-1 divide-y divide-white/5 md:grid-cols-4 md:divide-x md:divide-y-0">
          <Step number="01" title="Policy" desc="Select disclosure rule" />
          <Step number="02" title="Locate" desc="Scan wallet receipts" />
          <Step number="03" title="Prove" desc="Generate ZK-Proof" />
          <Step number="04" title="Verify" desc="Share JSON payload" isLast />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, isAddress, isHighlight }: { label: string, value: string | number, isAddress?: boolean, isHighlight?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col justify-between rounded-2xl border border-white/5 p-4 transition-all",
      isHighlight ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5"
    )}>
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className={cn(
        "mt-2 block truncate font-medium",
        isAddress ? "font-mono text-xs text-emerald-400" : "text-white",
        isHighlight && "text-emerald-400"
      )}>
        {isAddress ? `${value.toString().slice(0, 6)}...${value.toString().slice(-4)}` : value}
      </span>
    </div>
  )
}

function Step({ number, title, desc, isLast }: { number: string, title: string, desc: string, isLast?: boolean }) {
  return (
    <div className="relative p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-zinc-600">{number}</span>
        {!isLast && <ArrowRight className="hidden h-4 w-4 text-zinc-800 md:block" />}
      </div>
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <p className="mt-1 text-xs text-zinc-500">{desc}</p>
    </div>
  )
}