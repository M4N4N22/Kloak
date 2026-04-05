"use client"

import { FileText, Landmark, LockKeyhole, Receipt, Sparkles, ShieldCheck, Zap, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ActorRole = "payer" | "receiver"
type ProofType = "existence" | "amount" | "threshold"

type GenerateFormState = {
  paymentTxHash: string
  requestId: string
  actorRole: ActorRole
  proofType: ProofType
  minAmount: string
  maxAmount: string
  timestampFrom: string
  timestampTo: string
}

type ComplianceGenerateCardProps = {
  form: GenerateFormState
  error: string | null
  selectedPaymentLabel?: string | null
  onFieldChange: <K extends keyof GenerateFormState>(field: K, value: GenerateFormState[K]) => void
  onGenerate: () => void
  busy: boolean
}

const presets: Array<{
  label: string
  description: string
  icon: typeof FileText
  values: Partial<GenerateFormState>
}> = [
  {
    label: "SaaS unlock",
    description: "Verify a payment exists without exposing the amount.",
    icon: LockKeyhole,
    values: { actorRole: "payer", proofType: "existence", minAmount: "", maxAmount: "" },
  },
  {
    label: "Tax receipt",
    description: "Show the receiver collected the exact payment amount.",
    icon: Landmark,
    values: { actorRole: "receiver", proofType: "amount", minAmount: "", maxAmount: "" },
  },
  {
    label: "Expense threshold",
    description: "Prove a payment met a reimbursement minimum.",
    icon: Receipt,
    values: { actorRole: "payer", proofType: "threshold" },
  },
]

const roleOptions = [
  {
    value: "payer" as const,
    label: "Payer proof",
    helper: "Use when the wallet owner needs to show they paid.",
  },
  {
    value: "receiver" as const,
    label: "Receiver proof",
    helper: "Use when the wallet owner needs to show they received funds.",
  },
]

const proofTypeOptions = [
  {
    value: "existence" as const,
    label: "Existence only",
    helper: "Reveal the payment happened, hide the exact amount.",
  },
  {
    value: "amount" as const,
    label: "Exact amount",
    helper: "Reveal the full settled amount for tax or bookkeeping flows.",
  },
  {
    value: "threshold" as const,
    label: "Threshold",
    helper: "Reveal the payment met a minimum without exposing the exact amount.",
  },
]

export function ComplianceGenerateCard({
  form,
  error,
  selectedPaymentLabel,
  onFieldChange,
  onGenerate,
  busy,
}: ComplianceGenerateCardProps) {
  const selectedRole = roleOptions.find((option) => option.value === form.actorRole)
  const selectedProofType = proofTypeOptions.find((option) => option.value === form.proofType)

  const applyPreset = (values: Partial<GenerateFormState>) => {
    Object.entries(values).forEach(([field, value]) => {
      if (typeof value !== "undefined") {
        onFieldChange(field as keyof GenerateFormState, value as GenerateFormState[keyof GenerateFormState])
      }
    })
  }

  return (
<Card className="overflow-hidden border-foreground/10 bg-neutral-950 shadow-2xl">
      <CardHeader className="border-b border-foreground/5 bg-neutral-900/30 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-medium text-foreground">Configure Disclosure</CardTitle>
            <p className="text-sm text-neutral-400">
              Define the privacy boundaries for this compliance proof.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-primary/10 p-3 text-emerald-400 md:block">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Improved Presets Bar */}
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {presets.map((preset) => {
            const Icon = preset.icon
            const isActive = form.proofType === preset.values.proofType && form.actorRole === preset.values.actorRole
            
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.values)}
                className={cn(
                  "group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200",
                  isActive 
                    ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                    : "border-foreground/5 bg-foreground/5 hover:border-foreground/20 hover:bg-foreground/10"
                )}
              >
                <div className={cn(
                  "mb-3 rounded-lg p-2 transition-colors",
                  isActive ? "bg-primary text-black" : "bg-neutral-800 text-neutral-400 group-hover:text-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-medium text-foreground text-sm">{preset.label}</div>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{preset.description}</p>
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-10">
        {/* Step 1: Identity & Binding */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">1</span>
            Data Binding
          </div>
          
          <div className={cn(
            "relative rounded-2xl border p-6 transition-all",
            selectedPaymentLabel ? "border-primary/20 bg-primary/5" : "border-dashed border-foreground/10 bg-neutral-900/50"
          )}>
            {!selectedPaymentLabel && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/60 backdrop-blur-[2px] rounded-2xl">
                <p className="text-sm font-medium text-neutral-300">Select a payment from history to unlock</p>
              </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-neutral-400">Transaction Hash</Label>
                <div className="font-mono text-xs text-foreground bg-black/40 p-3 rounded-lg border border-foreground/5 truncate">
                  {form.paymentTxHash || "at1..."}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400">Request Binding</Label>
                <div className="font-mono text-xs text-foreground bg-black/40 p-3 rounded-lg border border-foreground/5 truncate">
                  {form.requestId || "0field"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Policy Configuration */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">2</span>
            Disclosure Policy
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Attestation Role</Label>
              <Select value={form.actorRole} onValueChange={(v) => onFieldChange("actorRole", v as ActorRole)}>
                <SelectTrigger className="h-12 bg-neutral-900 border-foreground/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-foreground/10 text-foreground">
                  {roleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-neutral-500 leading-normal">{selectedRole?.helper}</p>
            </div>

            <div className="space-y-3">
              <Label>Disclosure Type</Label>
              <Select value={form.proofType} onValueChange={(v) => onFieldChange("proofType", v as ProofType)}>
                <SelectTrigger className="h-12 bg-neutral-900 border-foreground/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-foreground/10 text-foreground">
                  {proofTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-neutral-500 leading-normal">{selectedProofType?.helper}</p>
            </div>
          </div>
        </section>

        {/* Step 3: Numeric Constraints */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">3</span>
            ZK Constraints
          </div>

          <div className="grid gap-4 rounded-2xl bg-foreground/5 p-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minAmount" className="text-neutral-300">
                {form.proofType === "threshold" ? "Required Minimum" : "Min Filter"}
              </Label>
              <div className="relative">
                <Input
                  id="minAmount"
                  type="number"
                  className="bg-neutral-950 border-foreground/10 pl-9"
                  value={form.minAmount}
                  onChange={(e) => onFieldChange("minAmount", e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 text-xs font-mono">≥</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount" className="text-neutral-300">Max Filter</Label>
              <div className="relative">
                <Input
                  id="maxAmount"
                  type="number"
                  className="bg-neutral-950 border-foreground/10 pl-9"
                  value={form.maxAmount}
                  disabled={form.proofType === "amount"}
                  onChange={(e) => onFieldChange("maxAmount", e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 text-xs font-mono">≤</span>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-4">
           <Label className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
             <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">4</span>
             Time Window
           </Label>
           <div className="grid gap-4 md:grid-cols-2">
              <Input type="datetime-local" className="bg-neutral-900 border-foreground/10 text-foreground" value={form.timestampFrom} onChange={(e) => onFieldChange("timestampFrom", e.target.value)} />
              <Input type="datetime-local" className="bg-neutral-900 border-foreground/10 text-foreground" value={form.timestampTo} onChange={(e) => onFieldChange("timestampTo", e.target.value)} />
           </div>
        </section>

        {error && (
          <Alert className="border-red-500/20 bg-red-500/5 text-red-400">
            <AlertDescription className="text-xs flex items-center gap-2">
              <Info className="h-4 w-4" /> {error}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          className="h-14 w-full bg-emerald-600 text-foreground hover:bg-primary transition-all rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
          disabled={busy || !selectedPaymentLabel} 
          onClick={onGenerate}
        >
          {busy ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-pulse" /> Generating ZK-Proof...
            </>
          ) : (
            "Generate Secure Disclosure"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
