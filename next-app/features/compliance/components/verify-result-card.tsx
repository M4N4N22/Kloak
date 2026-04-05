"use client"

import { 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRightLeft, 
  Fingerprint, 
  Calendar, 
  Scale,
  ExternalLink,
  ClipboardCheck
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDateRange, formatDateTime, formatProofTypeLabel, shortHash } from "@/features/compliance/lib/presentation"

type VerifyResult = {
  valid: boolean
  proofId: string
  paymentTxHash: string
  disclosureTxHash?: string | null
  requestId: string
  ownerAddress: string
  counterpartyAddress: string
  actorRole: "payer" | "receiver"
  proofType: "existence" | "amount" | "threshold"
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  proverAddress: string
  commitment: string
  nullifier?: string | null
  revoked: boolean
  verifiedAt: string
  paymentTimestamp: string
  constraints: {
    minAmount?: number
    maxAmount?: number
    requestId?: string
    timestampFrom?: string
    timestampTo?: string
  }
  message: string
}

export function VerifyResultCard({ result }: { result: VerifyResult | null }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] border border-dashed border-foreground/10 bg-neutral-900/20 text-center">
        <div className="h-12 w-12 rounded-2xl bg-neutral-800 flex items-center justify-center mb-4 text-neutral-600">
          <Fingerprint className="h-6 w-6" />
        </div>
        <h3 className="text-neutral-400 font-medium">Awaiting Verification</h3>
        <p className="text-neutral-500 text-xs max-w-xs mt-1 px-6">
          Submit a proof payload above to generate a human-readable audit report.
        </p>
      </div>
    )
  }

  const isValid = result.valid && !result.revoked
  const timeRange = formatDateRange(result.constraints.timestampFrom, result.constraints.timestampTo)

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-neutral-900/40 shadow-2xl">
      {/* 1. THE VERDICT BANNER */}
      <div className={cn(
        "px-8 py-6 flex items-center justify-between  transition-colors",
        isValid ? "bg-primary/10 " : "bg-red-500/10 "
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
            isValid ? "bg-primary text-black" : "bg-red-500 text-foreground"
          )}>
            {isValid ? <ShieldCheck className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
          </div>
          <div>
            <h2 className={cn("text-xl font-bold tracking-tight", isValid ? "text-primary" : "text-red-400")}>
              {isValid ? "Compliance Verified" : "Verification Failed"}
            </h2>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mt-0.5">
              Ref: {shortHash(result.proofId, 8, 8)}
            </p>
          </div>
        </div>
        <Badge className={cn(
          "px-4 py-1.5 rounded-full font-bold tracking-tighter text-xs",
          isValid ? "bg-primary/20 text-primary border-primary/30" : "bg-red-500/20 text-red-400 border-red-500/30"
        )}>
          {isValid ? "AUTHENTIC" : "INVALID"}
        </Badge>
      </div>

      <div className="p-8 space-y-8">
        {/* 2. HUMAN-READABLE OUTCOME */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500 px-1">Executive Summary</h3>
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-foreground/[0.03] border border-foreground/5 p-6 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-semibold">
                <Scale className="h-5 w-5 text-primary" />
                Proven Disclosure
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 leading-relaxed italic">
                  "This zero-knowledge proof confirms that the <span className="text-foreground font-bold">{result.actorRole}</span> successfully processed a transaction of type <span className="text-foreground font-bold">{formatProofTypeLabel(result.proofType)}</span>."
                </p>
                {result.disclosedAmount && (
                  <div className="pt-2 flex items-center justify-between border-t border-foreground/5">
                    <span className="text-xs text-neutral-500">Revealed Amount</span>
                    <span className="text-lg font-mono font-bold text-foreground tracking-tight">{result.disclosedAmount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-foreground/[0.03] border border-foreground/5 p-6 space-y-4">
              <div className="flex items-center gap-3 text-foreground font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Temporal Context
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Payment Date</span>
                  <span className="text-neutral-200">{formatDateTime(result.paymentTimestamp)}</span>
                </div>
                {timeRange && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Constraint Range</span>
                    <span className="text-neutral-200">{timeRange}</span>
                  </div>
                )}
                <div className="pt-2 flex items-center justify-between border-t border-foreground/5 text-[10px] text-neutral-600">
                  <span>Verified Locally On</span>
                  <span>{formatDateTime(result.verifiedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CRYPTOGRAPHIC TRACEABILITY (The Evidence) */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500 px-1">Technical Evidence</h3>
          <div className="rounded-3xl border border-foreground/5 bg-black/40 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-foreground/[0.04]">
                <TraceRow label="On-Chain Transaction" value={shortHash(result.paymentTxHash, 6, 6)} />
                <TraceRow label="Request Identifier" value={shortHash(result.requestId, 6, 6)} />
                <TraceRow label="Prover Identity (Address)" value={shortHash(result.proverAddress, 6, 6)} />
                <TraceRow label="ZK-Commitment" value={shortHash(result.commitment, 6, 6)} />
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. AUDIT FOOTER */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/50 border border-foreground/5">
          <div className="flex items-center gap-3">
             
             <span className="text-[11px] font-medium text-neutral-500">
               Cryptographically secured by Aleo Zero-Knowledge Circuit
             </span>
          </div>
        
        </div>
      </div>
    </div>
  )
}

function TraceRow({ label, value, truncate = 12 }: { label: string, value: string, truncate?: number }) {
  return (
    <tr className="group">
      <td className="px-6 py-4 text-xs font-semibold text-neutral-500">{label}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 group">
          <code className="text-[11px] font-mono text-neutral-400 group-hover:text-primary transition-colors">
            {shortHash(value, truncate, truncate)}
          </code>
          <button className="text-neutral-700 hover:text-foreground transition-colors">
            <ClipboardCheck className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}