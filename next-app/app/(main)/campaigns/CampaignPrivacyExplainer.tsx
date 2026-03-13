"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Step = {
  title: string
  plain: string
  tech: string
  tag: string
}

const CREATOR_STEPS: Step[] = [
  {
    title: "Prepare distribution",
    plain:
      "Recipients and payouts are defined locally. The list is transformed into cryptographic commitments.",
    tech: "leaf = hash(commitment, payout)",
    tag: "Local preparation",
  },
  {
    title: "Generate Merkle root",
    plain:
      "All commitments are arranged into a Merkle tree. A single root represents the entire distribution.",
    tech: "Merkle root generated client-side",
    tag: "Privacy layer",
  },
  {
    title: "Fund campaign pool",
    plain:
      "Funds are deposited into a campaign pool linked to the root commitment.",
    tech: "deposit_campaign_funds()",
    tag: "Escrow",
  },
  {
    title: "Campaign published",
    plain:
      "Only the Merkle root and campaign parameters are stored on-chain.",
    tech: "campaign_root stored on-chain",
    tag: "Blockchain",
  },
]

const RECIPIENT_STEPS: Step[] = [
  {
    title: "Receive claim secret",
    plain:
      "Eligible recipients receive a secret used to reconstruct their commitment.",
    tech: "secret → commitment",
    tag: "Off-chain",
  },
  {
    title: "Generate eligibility proof",
    plain:
      "A Merkle proof demonstrates that the commitment belongs to the campaign root.",
    tech: "verify_merkle()",
    tag: "Verification",
  },
  {
    title: "Claim privately",
    plain:
      "The contract verifies the proof and releases funds from the campaign pool.",
    tech: "nullifier prevents double claim",
    tag: "Private payout",
  },
]

export default function CampaignPrivacyExplainer() {
  const [showTech, setShowTech] = useState(false)

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-foreground/5">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
            Kloak Privacy Model
          </span>

          <h2 className="text-4xl font-semibold text-foreground tracking-tight">
            Private reward distributions
          </h2>

          <p className="text-sm text-muted-foreground max-w-md">
            The blockchain stores only a cryptographic commitment to the distribution.
            Recipient identities and payouts never appear on-chain
            and are never stored by the protocol.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center p-1 rounded-full bg-black/50 border border-foreground/10">
          <button
            onClick={() => setShowTech(false)}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-full transition",
              !showTech
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Explanation
          </button>

          <button
            onClick={() => setShowTech(true)}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-full transition",
              showTech
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Protocol
          </button>
        </div>
      </div>

      {/* Creator Flow */}
      <FlowSection
        title="Creator Flow"
        steps={CREATOR_STEPS}
        showTech={showTech}
        accent="primary"
      />

      {/* Public Ledger */}
      <div className="py-8 px-6 rounded-2xl  border border-foreground/10 text-center space-y-4 shadow-xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          What appears on-chain
        </p>

        <div className="flex justify-center gap-3">
          <Badge variant="outline" >
            Merkle Root
          </Badge>
          <Badge variant="outline" >
            Campaign Pool
          </Badge>
          <Badge variant="outline" >
            Nullifiers
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="text-primary">Recipient lists</span> and <span className="text-primary">individual payouts lists</span> remain private.
        </p>
      </div>

      {/* Recipient Flow */}
      <FlowSection
        title="Recipient Flow"
        steps={RECIPIENT_STEPS}
        showTech={showTech}
        accent="emerald"
      />
    </div>
  )
}

function FlowSection({
  title,
  steps,
  showTech,
  accent,
}: {
  title: string
  steps: Step[]
  showTech: boolean
  accent: "primary" | "emerald"
}) {
  const accentColor =
    accent === "primary"
      ? "bg-primary/20 border-primary/30 text-primary"
      : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"

  return (
    <div className="space-y-6 ">
      <h3 className="text-xl uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>

      <div className="grid md:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="px-5 py-12 rounded-3xl border border-foreground/5 bg-foreground/2 shadow-xl"
          >

            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {step.tag}
              </span>
              <span className="text-[10px] font-mono text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <h4 className="text-sm text-foreground mb-2">
              {step.title}
            </h4>

            <p className="text-xs leading-relaxed text-muted-foreground font-mono">
              {showTech ? step.tech : step.plain}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}