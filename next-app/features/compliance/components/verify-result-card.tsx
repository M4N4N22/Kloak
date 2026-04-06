"use client"

import {
  Calendar,
  ClipboardCheck,
  Fingerprint,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatDateRange,
  formatDateTime,
  formatProofTypeLabel,
  shortHash,
} from "@/features/compliance/lib/presentation"

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
  paymentTimestamp?: string | null
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
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-foreground/10 bg-neutral-900/20 py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-600">
          <Fingerprint className="h-6 w-6" />
        </div>
        <h3 className="font-medium text-neutral-400">Awaiting Verification</h3>
        <p className="mt-1 max-w-xs px-6 text-xs text-neutral-500">
          Submit a proof payload above to generate a human-readable audit report.
        </p>
      </div>
    )
  }

  const isValid = result.valid && !result.revoked
  const timeRange = formatDateRange(result.constraints.timestampFrom, result.constraints.timestampTo)

  return (
    <div className="overflow-hidden rounded-[2.5rem] border shadow-2xl">
      <div
        className={cn(
          "flex items-center justify-between px-8 py-6 transition-colors border-b",
          isValid ? "" : "",
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full shadow-lg",
              isValid ? "bg-primary/10 text-primary" : "bg-red-500 text-foreground",
            )}
          >
            {isValid ? <ShieldCheck className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
          </div>
          <div>
            <h2
              className={cn(
                "text-xl font-medium tracking-tight",
                isValid ? "text-primary" : "text-red-400",
              )}
            >
              {isValid ? "Compliance Verified" : "Verification Failed"}
            </h2>
            <p className="mt-0.5 text-xs font-medium  text-neutral-500">
              Ref: {shortHash(result.proofId, 8, 8)}
            </p>
          </div>
        </div>
        <Badge
        variant={"secondary"}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs ",
            isValid
              ? " bg-primary/20 text-primary"
              : " bg-red-500/20 text-red-400",
          )}
        >
          {isValid ? "AUTHENTIC" : "INVALID"}
        </Badge>
      </div>

      <div className="space-y-8 p-8">
        <section className="space-y-4">
          <h3 className="px-1 text-sm font-semibold text-neutral-500">
            Executive Summary
          </h3>
          <div className="flex flex-col gap-4">
            <div className="space-y-4 rounded-3xl  bg-foreground/[0.03] p-6">
              <div className="flex items-center gap-3 font-semibold text-foreground">
                <Scale className="h-5 w-5 text-primary" />
                Proven Disclosure
              </div>
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-neutral-400">
                  This zero-knowledge proof confirms that the{" "}
                  <span className="font-bold text-foreground">{result.actorRole}</span> successfully
                  processed a transaction of type{" "}
                  <span className="font-bold text-foreground">
                    {formatProofTypeLabel(result.proofType)}
                  </span>
                  .
                </p>
                {result.disclosedAmount ? (
                  <div className="flex items-center justify-between border-t border-foreground/5 pt-2">
                    <span className="text-xs text-neutral-500">Revealed Amount</span>
                    <span className="text-lg font-bold tracking-tight text-foreground">
                      {result.disclosedAmount}
                    </span>
                  </div>
                ) : null}
                {result.thresholdAmount ? (
                  <div className="flex items-center justify-between border-t border-foreground/5 pt-2">
                    <span className="text-xs text-neutral-500">Disclosed Threshold</span>
                    <span className="text-lg font-bold tracking-tight text-foreground">
                      {result.thresholdAmount}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl  bg-foreground/[0.03] p-6">
              <div className="flex items-center gap-3 font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                Temporal Context
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Payment Date</span>
                  <span className="text-neutral-200">
                    {result.paymentTimestamp
                      ? formatDateTime(result.paymentTimestamp)
                      : "Exact date remained private"}
                  </span>
                </div>
                {timeRange ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Disclosed Range</span>
                    <span className="text-neutral-200">{timeRange}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-foreground/5 pt-2 text-[10px] text-neutral-600">
                  <span>Verified Locally On</span>
                  <span>{formatDateTime(result.verifiedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="px-1 text-sm font-semibold text-neutral-500">
            Technical Evidence
          </h3>
          <div className="overflow-hidden rounded-3xl border border-foreground/5 bg-black/40">
            <table className="w-full border-collapse text-left">
              <tbody className="divide-y divide-foreground/[0.04]">
                <TraceRow label="On-Chain Transaction" value={result.paymentTxHash} />
                <TraceRow label="Request Identifier" value={result.requestId} />
                <TraceRow label="Prover Identity (Address)" value={result.proverAddress} />
                <TraceRow label="ZK Commitment" value={result.commitment} />
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex items-center justify-between rounded-2xl border border-foreground/5 bg-neutral-950/50 p-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-neutral-500">
              Cryptographically secured by Aleo zero-knowledge circuits
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TraceRow({
  label,
  value,
  truncate = 12,
}: {
  label: string
  value: string
  truncate?: number
}) {
  return (
    <tr className="group">
      <td className="px-6 py-4 text-xs font-semibold text-neutral-500">{label}</td>
      <td className="px-6 py-4 text-right">
        <div className="group flex items-center justify-end gap-2">
          <code className="text-[11px] font-mono text-neutral-400 transition-colors group-hover:text-primary">
            {shortHash(value, truncate, truncate)}
          </code>
          <button className="text-neutral-700 transition-colors hover:text-foreground">
            <ClipboardCheck className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}
