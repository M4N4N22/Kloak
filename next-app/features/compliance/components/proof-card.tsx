"use client"

import { useState } from "react"
import { 
  Check, Copy, ExternalLink, FileCode2, 
  MoreHorizontal, Trash2, ShieldCheck, ShieldAlert 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDateTime, formatProofTypeLabel, shortHash } from "@/features/compliance/lib/presentation"

export function ProofTableRow({ proof, busy, onDelete }: any) {
  const [copied, setCopied] = useState<string | null>(null)
  const isActive = proof.status === "ACTIVE"

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const shareLink = `${window.location.origin}/compliance/verify?proofId=${proof.proofId}`

  return (
    <tr className="group hover:bg-foreground/[0.02] transition-colors">
      {/* Status Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {isActive ? (
            <div className="flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-500">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Revoked</span>
            </div>
          )}
        </div>
      </td>

      {/* Type Column */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {formatProofTypeLabel(proof.proofType)}
          </span>
          <span className="text-xs text-neutral-500 capitalize">
            {proof.actorRole} disclosure
          </span>
        </div>
      </td>

      {/* IDs Column */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 group/id">
            <code className="text-[10px] font-mono text-neutral-400">ID: {shortHash(proof.proofId, 6, 4)}</code>
            <button onClick={() => copy(proof.proofId, 'id')} className="opacity-0 group-hover/id:opacity-100 transition-opacity">
              {copied === 'id' ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-neutral-600" />}
            </button>
          </div>
          <code className="text-[10px] font-mono text-neutral-600">TX: {shortHash(proof.paymentTxHash, 6, 4)}</code>
        </div>
      </td>

      {/* Date Column */}
      <td className="px-6 py-4 text-xs text-neutral-500 foregroundspace-nowrap">
        {formatDateTime(proof.createdAt)}
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isActive && (
            <Button 
              variant="outline" 
             
              onClick={() => copy(shareLink, 'link')}
            >
              {copied === 'link' ? "Copied" : "Copy Link"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <MoreHorizontal className="h-4 w-4" />     
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-foreground/10 text-foreground">
              <DropdownMenuItem onClick={() => copy(JSON.stringify(proof), 'json')} className="gap-2">
                <FileCode2 className="h-4 w-4" /> {copied === 'json' ? "Copied" : "Copy JSON Payload"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(shareLink, '_blank')} className="gap-2">
                <ExternalLink className="h-4 w-4" /> Open Verification
              </DropdownMenuItem>
              {isActive && onDelete && (
                <>
                  <DropdownMenuSeparator className="bg-foreground/5" />
                  <DropdownMenuItem 
                    onClick={() => onDelete(proof.proofId)}
                    className="gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" /> Revoke Proof
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}