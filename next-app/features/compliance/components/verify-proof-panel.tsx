"use client"

import { useMemo, type ReactNode } from "react"
import {
  CheckCircle2,
  Fingerprint,
  SearchCheck,
  Link as LinkIcon,
  FileJson,
  ShieldCheck,
  Info,
  RefreshCw
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  formatDateRange,
  formatProofTypeLabel,
  shortHash,
} from "@/features/compliance/lib/presentation"

type ParsedProofPreview = {
  proofId: string
  actorRole: "payer" | "receiver"
  proofType: "existence" | "amount" | "threshold"
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  timestampFrom?: string
  timestampTo?: string
  ownerAddress: string
}

type VerifyProofPanelProps = {
  value: string
  busy: boolean
  error: string | null
  onValueChange: (value: string) => void
  onVerify: () => void
}

export function VerifyProofPanel({
  value,
  busy,
  error,
  onValueChange,
  onVerify,
}: VerifyProofPanelProps) {
  const parsedPreview = useMemo<ParsedProofPreview | null>(() => {
    if (!value || value.startsWith("http")) {
      return null
    }

    try {
      const parsed = JSON.parse(value) as Record<string, unknown>

      if (
        parsed.kind === "kloak.selective-disclosure-proof" &&
        parsed.statement &&
        typeof parsed.statement === "object" &&
        parsed.subject &&
        typeof parsed.subject === "object" &&
        typeof parsed.proofId === "string"
      ) {
        const statement = parsed.statement as Record<string, unknown>
        const subject = parsed.subject as Record<string, unknown>
        const constraints =
          statement.constraints && typeof statement.constraints === "object"
            ? (statement.constraints as Record<string, unknown>)
            : {}

        const actorRole = statement.actorRole === "receiver" ? "receiver" : "payer"
        const proofType =
          statement.proofType === "amount" || statement.proofType === "threshold"
            ? statement.proofType
            : "existence"

        if (typeof subject.ownerAddress === "string") {
          return {
            proofId: parsed.proofId,
            actorRole,
            proofType,
            disclosedAmount:
              typeof statement.disclosedAmount === "string" || statement.disclosedAmount === null
                ? (statement.disclosedAmount as string | null)
                : null,
            thresholdAmount:
              typeof statement.thresholdAmount === "string" || statement.thresholdAmount === null
                ? (statement.thresholdAmount as string | null)
                : null,
            timestampFrom:
              typeof constraints.timestampFrom === "string" ? constraints.timestampFrom : undefined,
            timestampTo:
              typeof constraints.timestampTo === "string" ? constraints.timestampTo : undefined,
            ownerAddress: subject.ownerAddress,
          }
        }
      }

      if (
        typeof parsed.proofId === "string" &&
        typeof parsed.ownerAddress === "string"
      ) {
        return {
          proofId: parsed.proofId,
          actorRole: parsed.actorRole === "receiver" ? "receiver" : "payer",
          proofType:
            parsed.proofType === "amount" || parsed.proofType === "threshold"
              ? parsed.proofType
              : "existence",
          disclosedAmount:
            typeof parsed.disclosedAmount === "string" || parsed.disclosedAmount === null
              ? (parsed.disclosedAmount as string | null)
              : null,
          thresholdAmount:
            typeof parsed.thresholdAmount === "string" || parsed.thresholdAmount === null
              ? (parsed.thresholdAmount as string | null)
              : null,
          timestampFrom:
            parsed.constraints &&
            typeof parsed.constraints === "object" &&
            typeof (parsed.constraints as Record<string, unknown>).timestampFrom === "string"
              ? ((parsed.constraints as Record<string, unknown>).timestampFrom as string)
              : undefined,
          timestampTo:
            parsed.constraints &&
            typeof parsed.constraints === "object" &&
            typeof (parsed.constraints as Record<string, unknown>).timestampTo === "string"
              ? ((parsed.constraints as Record<string, unknown>).timestampTo as string)
              : undefined,
          ownerAddress: parsed.ownerAddress,
        }
      }
    } catch {
      return null
    }

    return null
  }, [value])

  // Logic to detect what kind of input we have
  const detection = useMemo(() => {
    if (!value) return null
    try {
      if (value.startsWith('http')) {
        const url = new URL(value)
        const proofId = url.searchParams.get("proofId")
        return { type: 'link', label: 'Verification Link', id: proofId || 'Detected' }
      }
      JSON.parse(value)
      return { type: 'json', label: 'JSON Payload', id: 'Valid Structure' }
    } catch {
      return { type: 'invalid', label: 'Unknown Format', id: null }
    }
  }, [value])

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText()
    onValueChange(text)
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border  p-1 shadow-2xl">
      {/* 1. Header with Status */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SearchCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Verifier Portal</h3>
          </div>

          {/* Detection Badge */}
          {detection && value && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full  text-xs uppercase  animate-in fade-in zoom-in duration-300",
              detection.type === 'invalid'
                ? " bg-red-500/10 text-red-400"
                : " bg-primary/10 text-primary"
            )}>
              {detection.type === 'link' ? <LinkIcon className="h-3 w-3" /> : <FileJson className="h-3 w-3" />}
              {detection.label}
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed text-neutral-500">
          Paste a proof package or verification link to confirm what was disclosed and whether the proof is still valid.
        </p>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* 2. Main Input Area */}
        <div className="group relative">
          <Textarea
            id="proofInput"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder='Paste a proof package or verification URL...'
            className="min-h-50 w-full rounded-2xl border-foreground/5 bg-black/40 p-4 font-mono text-xs leading-relaxed text-neutral-300 transition-all focus:border-primary/30 focus:ring-primary/5 group-hover:border-foreground/10"
          />

          {/* Action Overlay */}
          {!value && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Button
                variant="outline"
                className="pointer-events-auto "
                onClick={handlePaste}
              >
                Paste from Clipboard
              </Button>
            </div>
          )}
        </div>

        {/* 3. Detected ID Preview (Refined) */}
        {detection?.type === 'link' && detection.id && (
          <div className="rounded-2xl border border-foreground/5 bg-foreground/2 p-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Extracted Proof ID</span>
              <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
            </div>
            <code className="text-xs font-mono text-primary break-all">{detection.id}</code>
          </div>
        )}

        {parsedPreview ? (
          <div className="space-y-4 rounded-2xl border  p-5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">
                  Package Preview
                </p>
                <h4 className="mt-1 text-sm font-semibold text-foreground">
                  What this proof is claiming
                </h4>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Ready to review
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <PreviewItem
                icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
                label="Proof type"
                value={formatProofTypeLabel(parsedPreview.proofType)}
              />
              <PreviewItem
                icon={<Fingerprint className="h-4 w-4 text-primary" />}
                label="Claim made by"
                value={parsedPreview.actorRole === "payer" ? "Payer" : "Receiver"}
              />
              <PreviewItem
                icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                label="Proof owner"
                value={shortHash(parsedPreview.ownerAddress, 10, 8)}
              />
              <PreviewItem
                icon={<Fingerprint className="h-4 w-4 text-primary" />}
                label="Proof reference"
                value={shortHash(parsedPreview.proofId, 8, 6)}
              />
            </div>

            <div className="rounded-2xl border  p-4">
              <p className="text-xs text-neutral-500">
                What will be checked
              </p>
              <div className="mt-3 space-y-2 text-sm text-neutral-300">
                <p>This package matches a real proof issued by Kloak.</p>
                <p>The proof still points to a finalized disclosure transaction.</p>
                <p>The disclosed statement still matches the linked payment record.</p>
                {parsedPreview.disclosedAmount ? (
                  <p>Disclosed exact amount: {parsedPreview.disclosedAmount}</p>
                ) : null}
                {parsedPreview.thresholdAmount ? (
                  <p>Disclosed threshold: {parsedPreview.thresholdAmount}</p>
                ) : null}
                {parsedPreview.timestampFrom || parsedPreview.timestampTo ? (
                  <p>
                    Disclosed date range:{" "}
                    {formatDateRange(parsedPreview.timestampFrom, parsedPreview.timestampTo)}
                  </p>
                ) : null}
                {!parsedPreview.disclosedAmount &&
                !parsedPreview.thresholdAmount &&
                !parsedPreview.timestampFrom &&
                !parsedPreview.timestampTo ? (
                  <p>No extra payment details are disclosed in this package beyond the proof statement.</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {error && (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-400 py-3">
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* 4. The Big Action */}
        <Button
          className="w-full"
          disabled={busy || !value || detection?.type === 'invalid'}
          onClick={onVerify}
        >
          {busy ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Checking proof...
            </div>
          ) : (
            <div className="flex items-center gap-2">

              Verify Proof
            </div>
          )}
        </Button>

        {/* 5. Educational Footer */}
        <div className="flex items-start gap-3 rounded-2xl border border-foreground/5 bg-neutral-900/50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" />
          <p className="text-xs leading-normal text-neutral-500">
            Verification checks the shared proof package against Kloak&apos;s recorded proof and payment references. Your wallet is not asked to sign and no new on-chain transaction is created during this check.
          </p>
        </div>
      </div>
    </div>
  )
}

function PreviewItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
