"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { SectionHeader } from "@/features/compliance/components/section-header"
import { VerifyProofPanel } from "@/features/compliance/components/verify-proof-panel"
import { VerifyResultCard } from "@/features/compliance/components/verify-result-card"
import { useSelectiveDisclosure } from "@/hooks/use-selective-disclosure"

function getProofIdFromLink(value: string) {
  try {
    const url = new URL(value, "https://kloak.local")
    return url.searchParams.get("proofId")
  } catch {
    return null
  }
}

export function VerifyProofSection() {
  const searchParams = useSearchParams()
  const { address } = useWallet()
  const { verifyProof, busyAction, error, lastVerified } = useSelectiveDisclosure()
  const [value, setValue] = useState("")

  const proofIdFromUrl = searchParams.get("proofId")
  const initialLinkValue = proofIdFromUrl
    ? `${window.origin}/compliance/verify?proofId=${encodeURIComponent(proofIdFromUrl)}`
    : ""
  const currentValue = value || initialLinkValue

  const linkProofId = useMemo(() => getProofIdFromLink(currentValue), [currentValue])

  const handleVerify = async () => {
    const trimmed = currentValue.trim()
    if (!trimmed) return

    try {
      if (trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed)

        await verifyProof({
          proof: {
            proofId: parsed.proofId,
            paymentTxHash: parsed.paymentTxHash,
            disclosureTxHash: parsed.disclosureTxHash,
            requestId: parsed.requestId,
            ownerAddress: parsed.ownerAddress,
            commitment: parsed.commitment,
            nullifier: parsed.nullifier,
            actorRole: parsed.actorRole,
            proofType: parsed.proofType,
            proofDigest: parsed.proofDigest,
          },
          verifier: address || undefined,
        })

        return
      }

      if (linkProofId) {
        await verifyProof({
          proofId: linkProofId,
          verifier: address || undefined,
        })
      }
    } catch {
      return
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Verify Proof"
        title="Validate a shared proof"
        description="Review a proof payload or link, confirm whether it is valid, and see a structured explanation of what the proof actually demonstrates."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <VerifyProofPanel
          value={currentValue}
          busy={busyAction === "verify"}
          error={error}
          onValueChange={setValue}
          onVerify={handleVerify}
        />
        <VerifyResultCard result={lastVerified} />
      </div>
    </div>
  )
}
