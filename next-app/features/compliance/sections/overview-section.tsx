"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Eye, FileCheck2, Shield, Scale, Clock3, ArrowUpRight, ArrowDownLeft, Fingerprint, ShieldCheck } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { EyeOff, Lock } from "lucide-react"
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
        description="Turn wallet-held payment receipts into verifiable disclosures. Share only the fields a workflow requires while keeping payer identity, balances, and unrelated activity out of scope."
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
      <div className="grid gap-6 lg:grid-cols-3 ">
        <FeatureCard
          title="What is a Proof?"
          desc="A verifiable receipt that confirms a payment statement without exposing your full wallet history or unrelated balances."
          icon={Shield}
        />
        <FeatureCard
          title="When to Share?"
          desc="Useful for reimbursements, tax workflows, and partner checks where someone needs proof of payment without broader wallet visibility."
          icon={FileCheck2}
        />
        <FeatureCard
          title="Selective Privacy"
          desc="You do not expose your whole wallet. You disclose only the payment statement and constraints you intentionally choose."
          icon={Eye}
        />
      </div>

      {/* 4. VISUAL DISCLOSURE MODEL: Shared vs. Protected */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* SHARED SECTION - The "Public Disclosure" */}
        <Card className="lg:col-span-3 relative overflow-hidden border-primary/20  shadow-[0_0_40px_rgba(var(--primary-rgb),0.05)] rounded-[2.5rem] h-fit">
          {/* Subtle background glow */}
          <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-primary/40 blur-[80px]" />

          <CardContent className="relative p-8 md:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs  text-primary">
                  <Eye className="h-4 w-4" />
                  Public Disclosure
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  What you share with the world
                </h3>
              </div>
              <div className="hidden sm:block rounded-full bg-primary/10 px-3 py-1 text-[10px]  uppercase tracking-widest text-primary ">
                Verified
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <ListItem2
                icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                label="Payment Existence"
                desc="Proof that a matching payment exists without exposing the rest of the wallet's activity."
              />
              <ListItem2
                icon={<Scale className="h-5 w-5 text-primary" />}
                label="Selective Amount"
                desc="Reveal only the exact total or prove it meets a required threshold."
              />
              <ListItem2
                icon={<Clock3 className="h-5 w-5 text-primary" />}
                label="Time Window"
                desc="Show the relevant date range when needed without exposing unrelated timeline data."
              />
              <ListItem2
                icon={<Fingerprint className="h-5 w-5 text-primary" />}
                label="Cryptographic Auth"
                desc="A unique ZK-signature derived from your secure ledger record."
              />
            </div>
          </CardContent>
          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="text-xs text-neutral-500">
              Zero-Knowledge Protected
            </span>
          </div>
        </Card>



        {/* HIDDEN SECTION - The "Secure Vault" */}
        <Card className="lg:col-span-2">
          <CardContent className="p-8 md:p-10">
            <div className="mb-8 space-y-1">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
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
                desc="Payments outside the selected receipt stay out of the disclosure package."
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

function ListItem2({
  label,
  desc,
  icon,
  secondary = false,
}: {
  label: string
  desc: string
  icon: ReactNode
  secondary?: boolean
}) {
  return (
    <div className="group flex items-start gap-4">
      <div className={cn(
        "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
        secondary
          ? "  text-neutral-500"
          : "  text-primary group-hover:text-black"
      )}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className={cn(
          "text-sm font-medium ",
          secondary ? "text-neutral-400  decoration-neutral-700" : "text-foreground"
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

function QuickStat({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  sub: string
  icon: LucideIcon
  color: string
}) {
  return (
    <Card className="">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
           <p className="text-base">{label}</p>
          <div className={cn("p-4 rounded-full border", color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
       
        <p className="mt-2 text-xs text-neutral-500 leading-tight">{sub}</p>
      </CardContent>
    </Card>
  )
}

function FeatureCard({
  title,
  desc,
  icon: Icon,
}: {
  title: string
  desc: string
  icon: LucideIcon
}) {
  return (
    <div className="flex gap-4 py-8 px-6 rounded-[2.5rem] border">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-semibold text-neutral-100 text-sm mb-1">{title}</h4>
        <p className="text-xs leading-relaxed text-neutral-500">{desc}</p>
      </div>
    </div>
  )
}
