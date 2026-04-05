"use client"

import { useMemo } from "react"
import {
  SearchCheck,
  ClipboardPaste,
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
    <div className="relative overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-neutral-900/40 p-1 shadow-2xl">
      {/* 1. Header with Status */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SearchCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Verifier Portal</h3>
          </div>

          {/* Detection Badge */}
          {detection && value && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-300",
              detection.type === 'invalid'
                ? "border-red-500/20 bg-red-500/10 text-red-400"
                : "border-primary/20 bg-primary/10 text-primary"
            )}>
              {detection.type === 'link' ? <LinkIcon className="h-3 w-3" /> : <FileJson className="h-3 w-3" />}
              {detection.label}
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed text-neutral-500">
          Input a cryptographic payload to translate ZK-proofs into a human-readable compliance outcome.
        </p>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* 2. Main Input Area */}
        <div className="group relative">
          <Textarea
            id="proofInput"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder='Paste JSON or a verification URL...'
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
              Authenticating...
            </div>
          ) : (
            <div className="flex items-center gap-2">

              Verify Proof
            </div>
          )}
        </Button>

        {/* 5. Educational Footer */}
        <div className="flex items-start gap-3 rounded-2xl border border-foreground/5 bg-neutral-900/60 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" />
          <p className="text-[11px] leading-normal text-neutral-500 italic">
            Verification is performed locally. Your private keys never interact with the payload, and no transaction is recorded on-chain during this check.
          </p>
        </div>
      </div>
    </div>
  )
}