"use client"

import { cn } from "@/lib/utils"

import type { ClaimStatus } from "@/hooks/useClaimCampaign"

export default function ClaimStepper({
  status,
}: {
  status: ClaimStatus
}) {

  const currentStep =
    ["idle", "scanning"].includes(status)
      ? 1
      : status === "signing"
      ? 2
      : ["pending", "broadcasting"].includes(status)
      ? 3
      : status === "finalized"
      ? 4
      : 1

  const steps = [
    {
      n: 1,
      label: "Wallet Preparation",
      desc: "Scanning wallet records",
      done: ["signing", "pending", "broadcasting", "finalized"].includes(status),
    },
    {
      n: 2,
      label: "Transaction Signing",
      desc: "Authorize claim in wallet",
      done: ["pending", "broadcasting", "finalized"].includes(status),
    },
    {
      n: 3,
      label: "ZK Proof & Broadcast",
      desc:
        status === "pending"
          ? "Generating zero-knowledge proof"
          : "Submitting claim to Aleo network",
      done: status === "finalized",
    },
    {
      n: 4,
      label: "Claim Confirmation",
      desc: "Reward finalized on-chain",
      done: status === "finalized",
    },
  ]

  return (
    <div className="space-y-8 max-w-xs">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Private Reward Claim
        </h1>

        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Claim your reward using Aleo shielded transactions. Your identity and payout remain private.
        </p>
      </div>

      {/* Stepper */}

      <nav className="space-y-0">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4">

            {/* Step Icon */}

            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                  status === "error" && currentStep === s.n
                    ? "bg-red-500 text-white"
                    : currentStep === s.n
                    ? "bg-flagship-gradient text-primary-foreground ring-4 ring-primary/20 animate-in fade-in zoom-in"
                    : s.done
                    ? "bg-flagship-gradient text-primary-foreground"
                    : "bg-white/10 text-foreground/50"
                )}
              >
                {s.done ? "✓" : s.n}
              </div>

              {s.n !== steps.length && (
                <div
                  className={cn(
                    "w-0.5 h-10 my-1 transition-colors duration-500",
                    s.done ? "bg-flagship-gradient" : "bg-zinc-800"
                  )}
                />
              )}
            </div>

            {/* Step Text */}

            <div className="pt-1">
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-colors",
                  currentStep === s.n
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {s.label}
              </p>

              <p
                className={cn(
                  "text-[11px] transition-all",
                  currentStep === s.n
                    ? "text-primary/80 font-medium"
                    : "text-muted-foreground"
                )}
              >
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}