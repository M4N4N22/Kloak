"use client"

import { CheckCircle2, FileJson2, SearchCheck, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

import { prettyDate } from "./compliance-utils"

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
  message: string
  paymentTimestamp?: string | null
  constraints?: {
    timestampFrom?: string
    timestampTo?: string
  }
}

type ComplianceVerifyCardProps = {
  proofPayload: string
  onPayloadChange: (value: string) => void
  onVerify: () => void
  busy: boolean
  lastVerified: VerifyResult | null
}

export function ComplianceVerifyCard({
  proofPayload,
  onPayloadChange,
  onVerify,
  busy,
  lastVerified,
}: ComplianceVerifyCardProps) {
  return (
    <Card className="border-foreground/10 bg-black/20 hidden">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Verify Proof</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Review or paste a proof payload the way a partner, auditor, or compliance operator would receive it.
            </p>
          </div>
          <div className="rounded-2xl bg-foreground/8 p-3 text-primary">
            <SearchCheck className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-4 text-sm text-muted-foreground">
          Production apps typically hand out a compact proof JSON, not raw wallet state. Verification checks that
          the proof metadata matches the disclosed payment statement and that the disclosure transaction was finalized.
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileJson2 className="h-4 w-4 text-primary" />
            Proof payload
          </div>
          <Textarea
            className="min-h-80 border-foreground/10 bg-black/30 font-mono text-xs"
            value={proofPayload}
            onChange={(e) => onPayloadChange(e.target.value)}
            placeholder={`{
  "proofId": "sdp_...",
  "paymentTxHash": "at1...",
  "disclosureTxHash": "at1...",
  "requestId": "123field",
  "ownerAddress": "aleo1...",
  "counterpartyAddress": "aleo1...",
  "actorRole": "receiver",
  "proofType": "amount",
  "disclosedAmount": "25000000",
  "commitment": "123field",
  "proofDigest": "..."
}`}
          />
        </div>

        <Button variant="secondary" className="w-full" disabled={busy} onClick={onVerify}>
          {busy ? "Verifying proof..." : "Verify Proof"}
        </Button>

        <div className="rounded-2xl border border-foreground/10 bg-black/30 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            {lastVerified?.valid ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-orange-400" />
            )}
            Latest verification
          </div>

          {lastVerified ? (
            <div className="mt-4 grid gap-3 text-muted-foreground sm:grid-cols-2">
              <p>Status: {lastVerified.valid ? "Valid" : "Needs review"}</p>
              <p>Proof ID: {lastVerified.proofId}</p>
              <p>Role: {lastVerified.actorRole}</p>
              <p>Proof type: {lastVerified.proofType}</p>
              <p>Request ID: {lastVerified.requestId}</p>
              <p>Owner: {lastVerified.ownerAddress}</p>
              <p>Counterparty: {lastVerified.counterpartyAddress}</p>
              <p>Payment TX: {lastVerified.paymentTxHash}</p>
              <p>Disclosure TX: {lastVerified.disclosureTxHash || "-"}</p>
              <p>Disclosed amount: {lastVerified.disclosedAmount || "-"}</p>
              <p>Threshold amount: {lastVerified.thresholdAmount || "-"}</p>
              <p>Payment timestamp: {lastVerified.paymentTimestamp ? prettyDate(lastVerified.paymentTimestamp) : "Exact date stayed hidden"}</p>
              <p className="sm:col-span-2">Message: {lastVerified.message}</p>
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">
              No proof has been verified yet in this session.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
