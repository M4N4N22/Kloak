"use client"

import { useMemo, useState } from "react"

import { ActionProgressOverlay } from "@/components/action-progress-overlay"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProofGeneratedDialog } from "@/features/compliance/components/proof-generated-dialog"
import { VerifyResultCard } from "@/features/compliance/components/verify-result-card"
import { PaymentLinkCreatedDialog } from "@/features/payment-links/components/payment-link-created-dialog"
import type { SelectiveDisclosureProof } from "@/hooks/use-selective-disclosure-proofs"

type VerifyPreviewResult = Parameters<typeof VerifyResultCard>[0]["result"]

const sampleProof: SelectiveDisclosureProof = {
  proofId: "proof_testnet_01HZYKLOAK1234567890",
  paymentTxHash: "at1abcxyz1234567890proofpaymenthashdemo",
  disclosureTxHash: "at1verifyxyz1234567890disclosurehashdemo",
  requestId: "1293653064539664018331373576220668715854514026966430605741255806178450045915field",
  ownerAddress: "aleo1owner9c4vcu4muwjkhkrfdamad4l6xg76dju5dh77guwhvcdq6cv9s6nk4l4",
  counterpartyAddress: "aleo1counterparty9c4vcu4muwjkhkrfdamad4l6xg76dju5dh77guwhvcdq6cv9s6nk4l4",
  actorRole: "payer",
  proofType: "threshold",
  thresholdAmount: "25 USDCX",
  proverAddress: "aleo1owner9c4vcu4muwjkhkrfdamad4l6xg76dju5dh77guwhvcdq6cv9s6nk4l4",
  commitment: "440165999999999999999999999999999999999999999999999999999999999field",
  contractProgram: "kloak_protocol_v10.aleo",
  constraints: {
    minAmount: 25,
    requestId: "1293653064539664018331373576220668715854514026966430605741255806178450045915field",
  },
  proofDigest: "digest_01HZYKLOAK1234567890",
  status: "ACTIVE",
  createdAt: "2026-04-12T11:30:00.000Z",
  revokedAt: null,
  verificationCount: 4,
}

function buildVerifyResult(
  variant: "verified" | "package-only" | "failed",
): NonNullable<VerifyPreviewResult> {
  if (variant === "package-only") {
    return {
      valid: true,
      verificationMode: "portable-package",
      kloakVerified: false,
      publicChainStatus: "unavailable",
      publicChainMessage: "The proof package was intact, but Aleo could not be checked right now.",
      recordStatus: "missing",
      recordMessage: "Kloak could not find a matching stored record for this shared package.",
      verificationChecks: {
        packageIntegrity: true,
        publicChainPaymentTransaction: false,
        publicChainDisclosureTransaction: false,
        publicChainDisclosureMatch: false,
        kloakRecordFound: false,
        kloakRevocationChecked: false,
        kloakPaymentHistoryChecked: false,
      },
      proofId: sampleProof.proofId,
      paymentTxHash: sampleProof.paymentTxHash,
      disclosureTxHash: sampleProof.disclosureTxHash,
      requestId: sampleProof.requestId,
      ownerAddress: sampleProof.ownerAddress,
      counterpartyAddress: sampleProof.counterpartyAddress,
      actorRole: sampleProof.actorRole,
      proofType: sampleProof.proofType,
      disclosedAmount: null,
      thresholdAmount: sampleProof.thresholdAmount,
      proverAddress: sampleProof.proverAddress,
      commitment: sampleProof.commitment,
      nullifier: null,
      revoked: false,
      verifiedAt: "2026-04-12T11:35:00.000Z",
      paymentTimestamp: "2026-04-11T18:30:00.000Z",
      constraints: sampleProof.constraints,
      message: "The package is internally valid and can be checked again when chain access is available.",
    }
  }

  if (variant === "failed") {
    return {
      valid: false,
      verificationMode: "portable-package",
      kloakVerified: false,
      publicChainStatus: "mismatch",
      publicChainMessage: "The public Aleo references do not match the shared proof package.",
      recordStatus: "missing",
      recordMessage: "No active Kloak record matched this tampered package.",
      verificationChecks: {
        packageIntegrity: false,
        publicChainPaymentTransaction: false,
        publicChainDisclosureTransaction: false,
        publicChainDisclosureMatch: false,
        kloakRecordFound: false,
        kloakRevocationChecked: false,
        kloakPaymentHistoryChecked: false,
      },
      proofId: sampleProof.proofId,
      paymentTxHash: sampleProof.paymentTxHash,
      disclosureTxHash: sampleProof.disclosureTxHash,
      requestId: sampleProof.requestId,
      ownerAddress: sampleProof.ownerAddress,
      counterpartyAddress: sampleProof.counterpartyAddress,
      actorRole: sampleProof.actorRole,
      proofType: sampleProof.proofType,
      disclosedAmount: null,
      thresholdAmount: sampleProof.thresholdAmount,
      proverAddress: sampleProof.proverAddress,
      commitment: sampleProof.commitment,
      nullifier: null,
      revoked: false,
      verifiedAt: "2026-04-12T11:36:00.000Z",
      paymentTimestamp: "2026-04-11T18:30:00.000Z",
      constraints: sampleProof.constraints,
      message: "This proof package was changed after it was created.",
    }
  }

  return {
    valid: true,
    verificationMode: "kloak-backed",
    kloakVerified: true,
    publicChainStatus: "verified",
    publicChainMessage: "The public Aleo chain confirms the payment and disclosure transactions.",
    recordStatus: "active",
    recordMessage: "Kloak confirmed the stored proof record and revocation status.",
    verificationChecks: {
      packageIntegrity: true,
      publicChainPaymentTransaction: true,
      publicChainDisclosureTransaction: true,
      publicChainDisclosureMatch: true,
      kloakRecordFound: true,
      kloakRevocationChecked: true,
      kloakPaymentHistoryChecked: true,
    },
    proofId: sampleProof.proofId,
    paymentTxHash: sampleProof.paymentTxHash,
    disclosureTxHash: sampleProof.disclosureTxHash,
    requestId: sampleProof.requestId,
    ownerAddress: sampleProof.ownerAddress,
    counterpartyAddress: sampleProof.counterpartyAddress,
    actorRole: sampleProof.actorRole,
    proofType: sampleProof.proofType,
    disclosedAmount: null,
    thresholdAmount: sampleProof.thresholdAmount,
    proverAddress: sampleProof.proverAddress,
    commitment: sampleProof.commitment,
    nullifier: null,
    revoked: false,
    verifiedAt: "2026-04-12T11:34:00.000Z",
    paymentTimestamp: "2026-04-11T18:30:00.000Z",
    constraints: sampleProof.constraints,
    message: "The proof is valid and confirmed on Aleo.",
  }
}

export default function TestPage() {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayMode, setOverlayMode] = useState<"create" | "generate" | "verify">("create")
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [proofDialogOpen, setProofDialogOpen] = useState(false)
  const [copiedValue, setCopiedValue] = useState<"proofId" | "verifyLink" | null>(null)
  const [verifyVariant, setVerifyVariant] = useState<"verified" | "package-only" | "failed">("verified")

  const verifyLink = "http://localhost:3000/compliance/verify?proofId=proof_testnet_01HZYKLOAK1234567890&guide=chain-first"

  const overlayCopy = {
    create: {
      eyebrow: "Creating link",
      title: "Saving payment link",
      description: "Kloak is finalizing the payment request and storing the shareable link.",
      statusLabel: "Writing link metadata",
    },
    generate: {
      eyebrow: "Generating proof",
      title: "Creating selective disclosure proof",
      description: "Kloak is preparing your proof, waiting for Aleo confirmation, and storing the final record.",
      statusLabel: "Saving the proof record",
    },
    verify: {
      eyebrow: "Verifying proof",
      title: "Checking proof validity",
      description: "Kloak is checking the proof package, confirming Aleo references, and adding record status where available.",
      statusLabel: "Checking public Aleo references",
    },
  }[overlayMode]

  const verifyResult = useMemo(() => buildVerifyResult(verifyVariant), [verifyVariant])

  const handleCopyProofValue = async (value: string, kind: "proofId" | "verifyLink") => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(kind)
    window.setTimeout(() => {
      setCopiedValue((current) => (current === kind ? null : current))
    }, 1800)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Component Test Lab</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Action states and result previews</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Use this page to preview the long-wait overlays, success dialogs, and verification result states without
          creating a payment link, generating a proof, or verifying anything on-chain.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="border-foreground/8 bg-black/20">
            <CardHeader>
              <CardTitle className="text-base">Overlays and dialogs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Loading overlays</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOverlayMode("create")
                      setOverlayOpen(true)
                    }}
                  >
                    Preview create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOverlayMode("generate")
                      setOverlayOpen(true)
                    }}
                  >
                    Preview generate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOverlayMode("verify")
                      setOverlayOpen(true)
                    }}
                  >
                    Preview verify
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Success dialogs</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setLinkDialogOpen(true)}>
                    Show link created
                  </Button>
                  <Button variant="outline" onClick={() => setProofDialogOpen(true)}>
                    Show proof generated
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-foreground/8 bg-black/20">
            <CardHeader>
              <CardTitle className="text-base">Verification states</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Switch between realistic result states to check copy, spacing, and visual hierarchy.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={verifyVariant === "verified" ? "default" : "outline"}
                  onClick={() => setVerifyVariant("verified")}
                >
                  Chain verified
                </Button>
                <Button
                  variant={verifyVariant === "package-only" ? "default" : "outline"}
                  onClick={() => setVerifyVariant("package-only")}
                >
                  Package only
                </Button>
                <Button
                  variant={verifyVariant === "failed" ? "default" : "outline"}
                  onClick={() => setVerifyVariant("failed")}
                >
                  Failed
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <VerifyResultCard result={verifyResult} />
      </div>

      <ActionProgressOverlay
        open={overlayOpen}
        eyebrow={overlayCopy.eyebrow}
        title={overlayCopy.title}
        description={overlayCopy.description}
        statusLabel={overlayCopy.statusLabel}
      />

      <PaymentLinkCreatedDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        generatedLink="http://localhost:3000/pay/paylink_demo_123"
        txId="at1n2a66sl5dkh55tgqe36ny5puumcxencpx9cjg3fks6595yynh5yqtz4e2u"
      />

      <ProofGeneratedDialog
        open={proofDialogOpen}
        onOpenChange={setProofDialogOpen}
        proof={sampleProof}
        verifyLink={verifyLink}
        copiedValue={copiedValue}
        onCopy={handleCopyProofValue}
      />
    </div>
  )
}
