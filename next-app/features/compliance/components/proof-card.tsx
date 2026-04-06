"use client"

import { useState } from "react"
import {
  Check,
  Copy,
  ExternalLink,
  FileCode2,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import type { SelectiveDisclosureProof } from "@/hooks/use-selective-disclosure-proofs"
import { buildSharedDisclosureProof } from "@/lib/selective-disclosure"
import { cn } from "@/lib/utils"
import {
  buildProofSummary,
  formatDateTime,
  shortHash,
} from "@/features/compliance/lib/presentation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ProofTableRowProps = {
  proof: SelectiveDisclosureProof
  busy: boolean
  onDelete?: (proofId: string) => void
}

export function ProofTableRow({ proof, busy, onDelete }: ProofTableRowProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const isActive = proof.status === "ACTIVE"
  const shareLink = `${window.location.origin}/compliance/verify?proofId=${proof.proofId}`
  const sharedPayload = buildSharedDisclosureProof({
    program: proof.contractProgram,
    proofId: proof.proofId,
    paymentTxHash: proof.paymentTxHash,
    disclosureTxHash: proof.disclosureTxHash,
    requestId: proof.requestId,
    ownerAddress: proof.ownerAddress,
    proverAddress: proof.proverAddress,
    commitment: proof.commitment,
    actorRole: proof.actorRole,
    proofType: proof.proofType,
    disclosedAmount: proof.disclosedAmount,
    thresholdAmount: proof.thresholdAmount,
    constraints: proof.constraints,
  })
  const sharedPayloadText = JSON.stringify(sharedPayload, null, 2)
  const summaryLines = buildProofSummary(proof)

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <tr className="group transition-colors hover:bg-foreground/[0.02]">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {isActive ? (
            <div className="flex items-center gap-1.5 text-primary">
              <span className="text-xs font-bold uppercase ">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-500">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-tight">Revoked</span>
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{summaryLines[0]}</span>
            <Badge variant="outline" className="border-foreground/10 text-neutral-400 capitalize">
              {proof.actorRole}
            </Badge>
          </div>
          <div className="space-y-0.5">
            {summaryLines.slice(1).map((line) => (
              <p key={line} className="text-xs text-neutral-500">
                {line}
              </p>
            ))}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <div className="group/id flex items-center gap-2">
            <code className="text-xs font-mono text-neutral-400">
              ID: {shortHash(proof.proofId, 6, 4)}
            </code>
            <button
              onClick={() => copy(proof.proofId, "id")}
              className="opacity-0 transition-opacity group-hover/id:opacity-100"
            >
              {copied === "id" ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <Copy className="h-3 w-3 text-neutral-600" />
              )}
            </button>
          </div>
          <code className="text-xs font-mono text-neutral-600">
            TX: {shortHash(proof.paymentTxHash, 6, 4)}
          </code>
        </div>
      </td>

      <td className="px-6 py-4 text-xs text-neutral-400">
        {formatDateTime(proof.createdAt)}
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isActive ? (
            <Button
              variant="outline"
              onClick={() => copy(shareLink, "link")}
            >
              {copied === "link" ? "Copied" : "Copy Link"}
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-foreground/[0.04] hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 border-foreground/10 bg-neutral-900 text-foreground"
            >
              <DropdownMenuItem onClick={() => copy(sharedPayloadText, "json")} className="gap-2">
                <FileCode2 className="h-4 w-4" />
                {copied === "json" ? "Copied" : "Copy Proof Package"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(shareLink, "_blank")} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Verification
              </DropdownMenuItem>
              {isActive && onDelete ? (
                <>
                  <DropdownMenuSeparator className="bg-foreground/5" />
                  <DropdownMenuItem
                    onClick={() => onDelete(proof.proofId)}
                    disabled={busy}
                    className={cn(
                      "gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400",
                      busy && "opacity-60",
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                    {busy ? "Revoking..." : "Revoke Proof"}
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}
