"use client"

import { Eye, FileCheck2, Shield, Scale, Clock3, ArrowUpRight, ArrowDownLeft, Fingerprint, ShieldCheck } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { EyeOff, Lock, CheckCircle2, MinusCircle } from "lucide-react"
import { useCompliancePayments } from "@/hooks/use-compliance-payments"
import { useSelectiveDisclosureProofs } from "@/hooks/use-selective-disclosure-proofs"
import { Card, CardContent } from "@/components/ui/card"
import { SectionHeader } from "@/features/compliance/components/section-header"
import { cn } from "@/lib/utils"

export function OverviewSection() {
  const { address } = useWallet()
  const actorAddress = address || ""
  const { payments } = useCompliancePayments(actorAddress)
  const { proofs } = useSelectiveDisclosureProofs(actorAddress)

  return (
    <div className="space-y-10">
      {/* 1. THE ORIGINAL HEADER: Contextual anchor */}
      <SectionHeader
        eyebrow="Compliance Overview"
        title="Privacy-preserving proofs for real-world workflows"
        description="Transform your private payment receipts into secure, verifiable disclosures. Share only what is necessary with auditors, employers, or tax authorities while keeping your wallet's inner workings hidden."
      />

      {/* 2. LIVE WORKSPACE SNAPSHOT: High-density data metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStat
          label="Issued Proofs"
          value={proofs.length}
          sub="Verified disclosures in vault"
          icon={ShieldCheck}
          color="text-primary"
        />
        <QuickStat
          label="Outbound Activity"
          value={payments.sent.length}
          sub="Available for payer proofs"
          icon={ArrowUpRight}
          color="text-blue-400"
        />
        <QuickStat
          label="Inbound Activity"
          value={payments.received.length}
          sub="Available for receiver proofs"
          icon={ArrowDownLeft}
          color="text-purple-400"
        />
        <QuickStat
          label="Identity Bond"
          value="Active"
          sub="Wallet-bound trust enabled"
          icon={Fingerprint}
          color="text-emerald-400"
        />
      </div>

      {/* 3. THE "HOW IT WORKS" GRID: Human-centric explanations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FeatureCard
          title="What is a Proof?"
          desc="A secure 'digital stamp' that confirms a payment happened. It acts as a receipt that doesn't reveal your name or balance."
          icon={Shield}
        />
        <FeatureCard
          title="When to Share?"
          desc="Perfect for expense reimbursements, tax filings, or platform access where a verifier needs 'Yes/No' confidence."
          icon={FileCheck2}
        />
        <FeatureCard
          title="Total Privacy"
          desc="Your raw transaction history and total balances are never touched. You only disclose the specific policy you select."
          icon={Eye}
        />
      </div>

      {/* 4. VISUAL DISCLOSURE MODEL: Shared vs. Protected */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* SHARED SECTION - The "Public Disclosure" */}
        <Card className="lg:col-span-3 relative overflow-hidden border-primary/20 bg-primary/[0.03] shadow-[0_0_40px_rgba(var(--primary-rgb),0.05)] rounded-[2.5rem] h-fit">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-40 h-64 w-64 rounded-full bg-primary/50 blur-[90px]" />

          <CardContent className="relative p-8 md:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  <Eye className="h-4 w-4" />
                  Public Disclosure
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  What you share with the world
                </h3>
              </div>
              <div className="hidden sm:block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary ">
                Verified
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <ListItem2
                icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                label="Payment Existence"
                desc="Cryptographic proof that the specific transaction is recorded on-chain."
              />
              <ListItem2
                icon={<Scale className="h-5 w-5 text-primary" />}
                label="Selective Amount"
                desc="Reveal only the exact total or prove it meets a required threshold."
              />
              <ListItem2
                icon={<Clock3 className="h-5 w-5 text-primary" />}
                label="Time Window"
                desc="A verifiable timestamp of the event without exposing other history."
              />
              <ListItem2
                icon={<Fingerprint className="h-5 w-5 text-primary" />}
                label="Cryptographic Auth"
                desc="A unique ZK-signature derived from your secure ledger record."
              />
            </div>
          </CardContent>
          <div className="mt-10 flex items-center justify-center gap-2  bg-black  border-foreground/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Zero-Knowledge Protected
            </span>
          </div>
        </Card>



        {/* HIDDEN SECTION - The "Secure Vault" */}
        <Card className="lg:col-span-2 border-foreground/5 bg-neutral-900/50 backdrop-blur-xl rounded-[2.5rem]">
          <CardContent className="p-8 md:p-10">
            <div className="mb-8 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                <EyeOff className="h-4 w-4" />
                Private Enclave
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-300">Always stays hidden</h3>
            </div>

            <div className="space-y-8">
              <ListItem2
                icon={<Lock className="h-4 w-4 text-neutral-600" />}
                label="Wallet Balance"
                desc="Your total net worth and asset distribution stays invisible."
                secondary
              />
              <ListItem2
                icon={<Lock className="h-4 w-4 text-neutral-600" />}
                label="Private Secrets"
                desc="Seed phrases and keys never leave your local hardware."
                secondary
              />
              <ListItem2
                icon={<Lock className="h-4 w-4 text-neutral-600" />}
                label="Unrelated Activity"
                desc="Past and future transaction metadata is completely shielded."
                secondary
              />
            </div>

            {/* Secure Badge */}

          </CardContent>
        </Card>
      </div>


    </div>
  )
}

/** HELPER COMPONENTS FOR CLEANER LAYOUT **/

function ListItem2({ label, desc, icon, secondary = false }: any) {
  return (
    <div className="group flex items-start gap-4">
      <div className={cn(
        "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl  transition-all duration-300",
        secondary
          ? " bg-foreground/5 text-neutral-500 opacity-60"
          : " bg-primary/10 text-primary group-hover:text-black"
      )}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className={cn(
          "text-sm font-bold tracking-tight",
          secondary ? "text-neutral-400 line-through decoration-neutral-700" : "text-foreground"
        )}>
          {label}
        </h4>
        <p className="text-xs leading-relaxed text-neutral-500">
          {desc}
        </p>
      </div>
    </div>
  )
}

function QuickStat({ label, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="border-foreground/5 bg-neutral-900/50 hover:bg-neutral-900/80 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg bg-neutral-800", color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</p>
        <p className="mt-2 text-[11px] text-neutral-600 leading-tight">{sub}</p>
      </CardContent>
    </Card>
  )
}

function FeatureCard({ title, desc, icon: Icon }: any) {
  return (
    <div className="flex gap-4 py-8 px-4 rounded-3xl border">
      <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-semibold text-neutral-100 text-sm mb-1">{title}</h4>
        <p className="text-xs leading-relaxed text-neutral-500">{desc}</p>
      </div>
    </div>
  )
}

function ListItem({ label, desc, secondary }: { label: string, desc: string, secondary?: boolean }) {
  return (
    <li className="space-y-1">
      <div className={cn("text-sm font-medium", secondary ? "text-neutral-400" : "text-emerald-50")}>
        {label}
      </div>
      <p className="text-xs text-neutral-500 leading-normal">{desc}</p>
    </li>
  )
}