"use client"

import {
  CalendarRange, LockKeyhole, ReceiptText, Scale,
  ShieldCheck, UserCircle2, Settings2, Info, RefreshCw
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { shortHash } from "../lib/presentation"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type GenerateFormState = {
  paymentTxHash: string
  requestId: string
  actorRole: "payer" | "receiver"
  proofType: "existence" | "amount" | "threshold"
  minAmount: string
  maxAmount: string
  timestampFrom: string
  timestampTo: string
}

type ProofFormProps = {
  form: GenerateFormState
  selectedPaymentLabel?: string | null
  error: string | null
  busy: boolean
  actionLabel?: string
  onFieldChange: <K extends keyof GenerateFormState>(field: K, value: GenerateFormState[K]) => void
  onGenerate: () => void
}

const proofTypes = [
  {
    value: "existence" as const,
    label: "Basic",
    helper: "Reveal only that the payment exists.",
    icon: ShieldCheck,
  },
  {
    value: "amount" as const,
    label: "Exact Amount",
    helper: "Reveal the settled amount for reimbursement or tax workflows.",
    icon: ReceiptText,
  },
  {
    value: "threshold" as const,
    label: "Threshold",
    helper: "Reveal that the payment met a minimum amount without exposing the exact total.",
    icon: Scale,
  },
]

const roles = [
  {
    value: "payer" as const,
    label: "I am payer",
    helper: "Use the proof to show you made the payment.",
  },
  {
    value: "receiver" as const,
    label: "I am receiver",
    helper: "Use the proof to show you received the payment.",
  },
]

export function ProofForm({
  form,
  selectedPaymentLabel,
  error,
  busy,
  actionLabel = "Generate Proof",
  onFieldChange,
  onGenerate,
}: ProofFormProps) {
  return (
    <div className="space-y-8 ">



      {/* 2. CONFIGURATION CORE */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* Left Column: The "What" */}
        <div className="lg:col-span-7 space-y-6">
          <section className="space-y-4 ">
            <div className="flex items-center gap-2 px-1 ">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">Identity Context</h3>
            </div>
            <RadioGroup
              disabled
              value={form.actorRole}
              onValueChange={(v) => onFieldChange("actorRole", v as any)}
              className="grid gap-3 border p-6 rounded-3xl"
            >
              {roles.map((role) => (
                <Label
                  key={role.value}
                  className={cn(
                    "group relative flex cursor-pointer items-center gap-4 rounded-2xl  transition-all duration-300 ",
                    form.actorRole === role.value
                      ? ""
                      : ""
                  )}
                >
                  <RadioGroupItem value={role.value} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm font-bold transition-colors",
                        form.actorRole === role.value ? "" : "text-foreground/70"
                      )}>
                        {role.label}
                      </span>



                    </div>
                    <p className="text-xs leading-relaxed text-neutral-500 group-hover:text-neutral-400 transition-colors">
                      {role.helper}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </section>
          <section className="space-y-4 ">
            <div className="flex items-center gap-2 px-1 ">
              <LockKeyhole className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 ">
                Disclosure Policy
              </h3>
            </div>

            <RadioGroup

              value={form.proofType}
              onValueChange={(value) => onFieldChange("proofType", value as GenerateFormState["proofType"])}
              className="grid gap-3 border p-6 rounded-3xl"
            >
              {proofTypes.map((type) => {
                const Icon = type.icon
                const active = form.proofType === type.value

                return (
                  <Label
                    key={type.value}
                    htmlFor={type.value}
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-4 rounded-2xl  transition-all duration-300 ",
                      active
                        ? ""
                        : ""
                    )}
                  >
                    {/* Shadcn Radio Item - Hidden visually but functional for accessibility */}
                    <RadioGroupItem value={type.value} id={type.value} />

                    {/* Icon Container */}


                    {/* Text Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-bold transition-colors",
                          active ? "" : "text-foreground/70"
                        )}>
                          {type.label}
                        </span>



                      </div>
                      <p className="text-xs leading-relaxed text-neutral-500 group-hover:text-neutral-400 transition-colors">
                        {type.helper}
                      </p>
                    </div>

                    {/* Subtle active glow effect */}

                  </Label>
                )
              })}
            </RadioGroup>
          </section>



        </div>

        {/* Right Column: The "Rules" (Constraints) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-[2rem]   space-y-6">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">Constraints</h3>
            </div>

            <div className="space-y-5 border p-6 rounded-3xl">
              {/* Amount Inputs with Logic Highlighting */}
              <div className="space-y-3">
                <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Value Bounds</Label>
                <div className="grid gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-600 text-sm">$</span>
                    <Input
                      type="number"
                      value={form.minAmount}
                      onChange={(e) => onFieldChange("minAmount", e.target.value)}
                      placeholder="Min amount..."
                      className={cn(
                        "pl-7 border-foreground/5 bg-black/40 h-11 rounded-xl focus:ring-primary/20",
                        form.proofType === 'threshold' && "border-primary/30 bg-primary/[0.02]"
                      )}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-600 text-sm">$</span>
                    <Input
                      type="number"
                      value={form.maxAmount}
                      onChange={(e) => onFieldChange("maxAmount", e.target.value)}
                      placeholder="Max amount (Optional)"
                      className="pl-7 border-foreground/5 bg-black/40 h-11 rounded-xl"
                    />
                  </div>
                </div>
                {form.proofType === 'threshold' && (
                  <p className="text-[10px] text-primary flex items-center gap-1">
                    <Info className="h-3 w-3" /> Min amount is required for threshold proofs.
                  </p>
                )}
              </div>

              {/* Date Inputs */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Time Window</Label>
                <div className="grid gap-2">
                  <Input
                    type="datetime-local"
                    value={form.timestampFrom}
                    onChange={(e) => onFieldChange("timestampFrom", e.target.value)}
                    className="border-foreground/5 bg-black/40 h-11 rounded-xl text-xs"
                  />
                  <Input
                    type="datetime-local"
                    value={form.timestampTo}
                    onChange={(e) => onFieldChange("timestampTo", e.target.value)}
                    className="border-foreground/5 bg-black/40 h-11 rounded-xl text-xs"
                  />
                </div>
                <p className="text-[10px] text-neutral-600">
                  Proof will only validate if the payment falls within this range.
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 py-3">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              disabled={busy}
              onClick={onGenerate}
            >
              {busy ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Computing Circuit...
                </div>
              ) : actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
