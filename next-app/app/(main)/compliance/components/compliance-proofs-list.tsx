"use client"

import { Copy, Eye, RefreshCcw, ShieldX, FileCheck, History, Fingerprint, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SelectiveDisclosureProof } from "@/hooks/use-selective-disclosure-proofs"
import { cn } from "@/lib/utils"
import { formatJson, prettyDate } from "./compliance-utils"

type ComplianceProofsListProps = {
  proofs: SelectiveDisclosureProof[]
  loading: boolean
  listError: string | null
  actionError: string | null
  activeProofCount: number
  busyAction: "generate" | "verify" | "revoke" | null
  onRefresh: () => void
  onLoad: (payload: string) => void
  onRevoke: (proofId: string) => void
}

export function ComplianceProofsList({
  proofs,
  loading,
  listError,
  actionError,
  activeProofCount,
  busyAction,
  onRefresh,
  onLoad,
  onRevoke,
}: ComplianceProofsListProps) {
  
  const handleCopy = async (payload: string) => {
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      onLoad(payload)
    }
  }

  return (
    <Card className="border-white/10 bg-zinc-950 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-zinc-900/30 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-medium text-white flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-emerald-500" />
              Operational Inventory
            </CardTitle>
            <p className="text-sm text-zinc-400 max-w-2xl">
              A cryptographically verifiable trail of all issued disclosures. Use these to satisfy compliance requests without exposing raw transaction data.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="border-white/10 bg-zinc-900 hover:bg-zinc-800 self-start lg:self-center"
            disabled={loading}
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh Inventory
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {/* Summary Stats Bar */}
        <div className="flex flex-wrap items-center gap-6 py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-xs font-medium uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px]">Total Vaulted</span>
            <span className="text-white font-mono">{proofs.length}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
            <span className="text-zinc-500 text-[10px]">Currently Active</span>
            <span className="text-emerald-400 font-mono">{activeProofCount}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
            <span className="text-zinc-500 text-[10px]">Revoked/Expired</span>
            <span className="text-red-400 font-mono">{Math.max(proofs.length - activeProofCount, 0)}</span>
          </div>
        </div>

        {listError && <p className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{listError}</p>}

        {!loading && proofs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-zinc-900/20 text-center">
            <History className="h-10 w-10 text-zinc-700 mb-4" />
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              No proofs have been issued yet. Once generated, they will appear here for audit management.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {proofs.map((proof) => (
              <ProofCard 
                key={proof.proofId} 
                proof={proof} 
                busyAction={busyAction} 
                onLoad={onLoad} 
                onCopy={handleCopy} 
                onRevoke={onRevoke} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProofCard({ 
  proof, 
  busyAction, 
  onLoad, 
  onCopy, 
  onRevoke 
}: { 
  proof: SelectiveDisclosureProof, 
  busyAction: string | null, 
  onLoad: (p: string) => void, 
  onCopy: (p: string) => void, 
  onRevoke: (id: string) => void 
}) {
  const isRevoked = proof.status !== "ACTIVE"
  
  return (
    <div className={cn(
      "relative group rounded-[2rem] border transition-all duration-300 p-6",
      isRevoked 
        ? "border-white/5 bg-zinc-950 opacity-60 grayscale-[0.5]" 
        : "border-white/10 bg-zinc-900/40 hover:border-emerald-500/30 hover:bg-zinc-900/60"
    )}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1 space-y-6">
          {/* Top Line: Status & IDs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <Fingerprint className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-mono text-xs text-white">{proof.proofId.slice(0, 16)}...</span>
            </div>
            <Badge className={cn(
              "font-semibold tracking-wide",
              isRevoked ? "bg-zinc-800 text-zinc-500" : "bg-emerald-500/10 text-emerald-400"
            )}>
              {proof.status}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-zinc-400 capitalize">{proof.actorRole}</Badge>
            <Badge variant="outline" className="border-white/10 text-emerald-500/70 capitalize">{proof.proofType} Proof</Badge>
          </div>

          {/* Data Grid */}
          <div className="grid gap-x-8 gap-y-4 text-[13px] md:grid-cols-2 lg:grid-cols-3">
            <DataPoint label="Payment Hash" value={proof.paymentTxHash} isMono />
            <DataPoint label="Request Reference" value={proof.requestId} isMono />
            <DataPoint label="Disclosed Amount" value={proof.disclosedAmount || "Shielded"} />
            <DataPoint label="Threshold Set" value={proof.thresholdAmount || "N/A"} />
            <DataPoint label="Verification Count" value={proof.verificationCount.toString()} />
            <DataPoint label="Created On" value={prettyDate(proof.createdAt)} />
          </div>

          {/* Sub-container for JSON data */}
          <div className="rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-[10px] text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-emerald-500/50 mr-2">CONSTRAINTS:</span>
            {formatJson(proof.constraints)}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="flex flex-row xl:flex-col shrink-0 gap-2 border-t xl:border-t-0 xl:border-l border-white/5 pt-6 xl:pt-0 xl:pl-6">
          <Button 
            className="flex-1 xl:w-32 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/20" 
            size="sm" 
            onClick={() => onLoad(formatJson(proof))}
          >
            <Eye className="mr-2 h-4 w-4" /> Load
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 xl:w-32 border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300" 
            size="sm" 
            onClick={() => onCopy(formatJson(proof))}
          >
            <Copy className="mr-2 h-4 w-4" /> JSON
          </Button>
          <Button
            variant="ghost"
            className="flex-1 xl:w-32 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            size="sm"
            disabled={isRevoked || busyAction !== null}
            onClick={() => onRevoke(proof.proofId)}
          >
            <ShieldX className="mr-2 h-4 w-4" />
            {busyAction === "revoke" ? "Revoking..." : "Revoke"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DataPoint({ label, value, isMono }: { label: string, value: string, isMono?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">{label}</div>
      <div className={cn(
        "text-zinc-300 truncate",
        isMono ? "font-mono text-[11px] text-zinc-400" : "font-medium"
      )}>
        {value}
      </div>
    </div>
  )
}