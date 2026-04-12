"use client"

import Link from "next/link"
import { CheckCircle2, Copy, ExternalLink } from "lucide-react"

import type { SelectiveDisclosureProof } from "@/hooks/use-selective-disclosure-proofs"
import { formatRoleLabel } from "@/features/compliance/lib/presentation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type ProofGeneratedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  proof: SelectiveDisclosureProof | null
  verifyLink: string
  copiedValue: "proofId" | "verifyLink" | null
  onCopy: (value: string, kind: "proofId" | "verifyLink") => void | Promise<void>
}

export function ProofGeneratedDialog({
  open,
  onOpenChange,
  proof,
  verifyLink,
  copiedValue,
  onCopy,
}: ProofGeneratedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="items-center text-center">
          <CheckCircle2 className="mb-2 h-10 w-10 text-primary" />
          <DialogTitle>Proof generated</DialogTitle>
          <DialogDescription>
            Your selective disclosure proof is ready to share and verify.
          </DialogDescription>
        </DialogHeader>

        {proof ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-foreground/8 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Role
                </p>
                <p className="mt-2 text-sm text-foreground">{formatRoleLabel(proof.actorRole)}</p>
              </div>
              <div className="rounded-2xl border border-foreground/8 bg-black/20 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Proof type
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {proof.proofType === "existence"
                    ? "Basic"
                    : proof.proofType === "amount"
                      ? "Exact Amount"
                      : "Threshold"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Proof ID</p>
              <div className="flex items-center gap-2">
                <Input value={proof.proofId} readOnly className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void onCopy(proof.proofId, "proofId")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedValue === "proofId" ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Verify link</p>
              <div className="flex items-center gap-2">
                <Input value={verifyLink} readOnly className="truncate text-xs" />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void onCopy(verifyLink, "verifyLink")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedValue === "verifyLink" ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/compliance/proofs" className="flex-1">
                <Button className="w-full">
                  See issued proofs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => void onCopy(verifyLink, "verifyLink")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy verify link
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
