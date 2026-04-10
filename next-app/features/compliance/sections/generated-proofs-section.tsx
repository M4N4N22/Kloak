"use client"

import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { RefreshCw, FileStack } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/features/compliance/components/section-header"
import { ProofTableRow } from "@/features/compliance/components/proof-card"
import { useSelectiveDisclosure } from "@/hooks/use-selective-disclosure"
import { useSelectiveDisclosureProofs } from "@/hooks/use-selective-disclosure-proofs"
import { cn

 } from "@/lib/utils"
export function GeneratedProofsSection() {
  const { address } = useWallet()
  const actorAddress = address || ""
  const { proofs, loading, error, refresh, setProofs } = useSelectiveDisclosureProofs(actorAddress)
  const { revokeProof, busyAction, error: actionError } = useSelectiveDisclosure()

  const handleDelete = async (proofId: string) => {
    if (!actorAddress) return
    try {
      const revoked = await revokeProof(proofId, actorAddress)
      setProofs((current) => current.map((p) => (p.proofId === proofId ? revoked : p)))
    } catch { return }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Compliance Ledger"
        title="Issued Proofs"
        description="A record of the proofs you have shared. Send the proof package when someone needs the raw proof data, or send the verify link when they can review it inside Kloak."
        action={
          <div className="flex gap-3">
            <Button variant="outline"  onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Sync Ledger
            </Button>
          </div>
        }
      />

      {(error || actionError) && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertDescription>{error || actionError}</AlertDescription>
        </Alert>
      )}

      <div className="">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-neutral-900/50 p-4">
            <p className="text-xs font-semibold  text-neutral-600">
              Proof Package JSON
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Best when an auditor, employer, or authority wants the full proof package to verify themselves.
            </p>
          </div>
          <div className="rounded-2xl  bg-neutral-900/50 p-4">
            <p className="text-xs font-semibold  text-neutral-600">
              Verify Link
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Best when the reviewer can open Kloak and check the proof in a guided flow.
            </p>
          </div>
        </div>
      </div>

      {proofs.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] border border-dashed border-foreground/10 bg-neutral-900/20 text-center">
          <div className="h-12 w-12 rounded-2xl bg-neutral-800 flex items-center justify-center mb-4 text-neutral-500">
            <FileStack className="h-6 w-6" />
          </div>
          <h3 className="text-foreground font-medium">No proofs found</h3>
          <p className="text-neutral-500 text-sm max-w-xs mt-1">
            You haven&apos;t generated any disclosure proofs yet.
          </p>
        </div>
      ) : (
        <div className="rounded-[2rem] border  overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-neutral-950">
                <tr className="border-b  text-xs  text-neutral-500">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Proof Type & Role</th>
                  <th className="px-6 py-4">ID / Transaction</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.04]">
                {proofs.map((proof) => (
                  <ProofTableRow
                    key={proof.proofId}
                    proof={proof}
                    busy={busyAction === "revoke"}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
