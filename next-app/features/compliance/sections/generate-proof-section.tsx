"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { ArrowLeft, CheckCircle2, FileSearch, type LucideIcon, Settings2, ShieldCheck } from "lucide-react"
import { shortHash } from "@/features/compliance/lib/presentation"
import type { CompliancePayment } from "@/hooks/use-compliance-payments"
import { useCompliancePayments } from "@/hooks/use-compliance-payments"
import { useSelectiveDisclosure } from "@/hooks/use-selective-disclosure"
import type { SelectiveDisclosureProof } from "@/hooks/use-selective-disclosure-proofs"
import { PaymentSelector } from "@/features/compliance/components/payment-selector"
import { ProofForm } from "@/features/compliance/components/proof-form"
import { ProofPreview } from "@/features/compliance/components/proof-preview"
import { SectionHeader } from "@/features/compliance/components/section-header"
import { useProofForm } from "@/features/compliance/hooks/use-proof-form"
import { buildDisclosurePreview, formatMoney, formatRoleLabel } from "@/features/compliance/lib/presentation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ActionProgressOverlay } from "@/components/action-progress-overlay"
import { ProofGeneratedDialog } from "@/features/compliance/components/proof-generated-dialog"
import { cn } from "@/lib/utils"

export function GenerateProofSection() {
  const [currentStep, setCurrentStep] = useState(1)
  const [generatedProof, setGeneratedProof] = useState<SelectiveDisclosureProof | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [copiedValue, setCopiedValue] = useState<"proofId" | "verifyLink" | null>(null)
  const { address } = useWallet()
  const searchParams = useSearchParams()
  const hasAppliedPrefill = useRef(false)
  const actorAddress = address || ""
  const preselectedTxHash = searchParams.get("txHash")?.trim() || ""

  const {
    payments,
    loading,
    recoveringCommitment,
    error: paymentsError,
    refresh,
    recoverPayment,
  } = useCompliancePayments(actorAddress)
  const { generateProof, busyAction, busyStage, error, duplicateProof, availableProofTypes } = useSelectiveDisclosure()
  const { form, error: formError, setError, setField, selectedPayment, selectPayment, validate } =
    useProofForm(payments)
  const activeDuplicateProof =
    duplicateProof && duplicateProof.proofType === form.proofType && duplicateProof.actorRole === form.actorRole
      ? duplicateProof
      : null

  useEffect(() => {
    if (!preselectedTxHash) return
    if (hasAppliedPrefill.current) return

    const payment = [...payments.sent, ...payments.received].find((item) => item.txHash === preselectedTxHash)

    if (!payment) return

    hasAppliedPrefill.current = true
    selectPayment(payment)

    const timer = window.setTimeout(() => {
      setCurrentStep(2)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [payments.received, payments.sent, preselectedTxHash, selectPayment])

  const previewItems = useMemo(
    () =>
      buildDisclosurePreview({
        proofType: form.proofType,
        minAmount: form.minAmount,
        timestampFrom: form.timestampFrom,
        timestampTo: form.timestampTo,
        token: selectedPayment?.token || null,
      }),
    [form.minAmount, form.proofType, form.timestampFrom, form.timestampTo, selectedPayment?.token],
  )

  const hiddenItems = useMemo(() => {
    const items = ["Wallet receipt secret", "Other wallet balances", "Unselected payment metadata"]

    if (form.proofType !== "amount") {
      items.push("Exact payment amount")
    }

    if (!form.timestampFrom && !form.timestampTo) {
      items.push("Payment timing constraints")
    }

    return items
  }, [form.proofType, form.timestampFrom, form.timestampTo])

  const verifyLink = useMemo(() => {
    if (!generatedProof) return ""

    const path = `/compliance/verify?proofId=${encodeURIComponent(generatedProof.proofId)}&guide=chain-first`

    if (typeof window === "undefined") return path
    return `${window.location.origin}${path}`
  }, [generatedProof])

  const handlePaymentPick = (payment: CompliancePayment) => {
    selectPayment(payment)
    setCurrentStep(2)
  }

  const handleRecovery = async (input: {
    diagnostic: (typeof payments.diagnostics.sent)[number]
    txHash: string
  }) => {
    const recoveredPayment = await recoverPayment({
      walletReceipt: input.diagnostic.walletReceipt,
      txHash: input.txHash,
    })

    handlePaymentPick(recoveredPayment)
  }

  const handleReview = () => {
    if (!validate()) return
    setCurrentStep(3)
  }

  const handleGenerate = async () => {
    if (!validate()) return

    try {
      setError(null)
      const proof = await generateProof({
        txHash: form.paymentTxHash.trim(),
        requestId: form.requestId.trim(),
        actorRole: form.actorRole,
        proofType: form.proofType,
        constraints: {
          minAmount: form.minAmount ? Number(form.minAmount) : undefined,
          maxAmount: form.maxAmount ? Number(form.maxAmount) : undefined,
          requestId: form.requestId.trim() || undefined,
          timestampFrom: form.timestampFrom || undefined,
          timestampTo: form.timestampTo || undefined,
        },
        walletReceipt: selectedPayment?.walletReceipt,
      })
      setGeneratedProof(proof)
      setCopiedValue(null)
      setSuccessOpen(true)
    } catch {
      return
    }
  }

  const handleCopy = async (value: string, kind: "proofId" | "verifyLink") => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(kind)
    window.setTimeout(() => setCopiedValue((current) => (current === kind ? null : current)), 1800)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-20">
      <ActionProgressOverlay
        open={busyAction === "generate"}
        eyebrow="Generating proof"
        title="Creating selective disclosure proof"
        description="Kloak is preparing your proof, waiting for Aleo confirmation, and storing the final proof record."
        statusLabel={busyStage || "Preparing proof"}
      />
      <ProofGeneratedDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        proof={generatedProof}
        verifyLink={verifyLink}
        copiedValue={copiedValue}
        onCopy={handleCopy}
      />
      <SectionHeader
        eyebrow="Proof Generator"
        title="Verified Compliance Workflow"
        description="Choose a payment, configure the disclosure policy, then confirm exactly what the verifier will learn before the proof is generated."
      />

      <nav className="mb-12 flex items-center justify-center space-x-4">
        <StepNavItem
          step={1}
          current={currentStep}
          label="Select Payment"
          icon={FileSearch}
          isDone={currentStep > 1}
        />
        <div className="h-px w-12 bg-neutral-900" />
        <StepNavItem
          step={2}
          current={currentStep}
          label="Configure Policy"
          icon={Settings2}
          isDone={currentStep > 2}
        />
        <div className="h-px w-12 bg-neutral-900" />
        <StepNavItem
          step={3}
          current={currentStep}
          label="Review & Issue"
          icon={ShieldCheck}
          isDone={false}
        />
      </nav>

      {currentStep === 1 ? (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <PaymentSelector
            payments={payments}
            selectedTxHash={form.paymentTxHash}
            loading={loading}
            recoveringCommitment={recoveringCommitment}
            error={paymentsError}
            onRefresh={() => void refresh()}
            onSelect={handlePaymentPick}
            onRecover={handleRecovery}
          />
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 fade-in space-y-6 duration-500">
          <div>
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 2 ? "Select a different payment" : "Back to configuration"}
            </Button>
          </div>

          {currentStep === 2 ? (
            <div className="space-y-6">
              <div className="relative group overflow-hidden rounded-3xl bg-neutral-950 p-1">



                <div className="rounded-[1.8rem] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-full text-primary">
                          <ShieldCheck className="h-3 w-3" />
                        </div>
                        <p className="text-xs text-primary">
                          Selected Transaction
                        </p>
                      </div>

                      <h4 className="text-xl font-bold tracking-tight mt-2">
                        {selectedPayment?.title || "Unknown Transaction"}
                      </h4>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-lg font-semibold text-muted-foreground tabular-nums">
                          {formatMoney(selectedPayment?.amount || "0", selectedPayment?.token || "")}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-neutral-700" />
                        <span className="text-sm font-medium text-neutral-500">
                          Verified Record
                        </span>
                      </div>
                    </div>

                    {/* Hash Badge with "Copy" Feel */}
                    <div className="flex flex-col items-end ">
                      <div className=" ">
                        <code className="text-[11px] font-mono font-medium text-primary/90">
                          {shortHash(form.paymentTxHash, 4, 4)}
                        </code>
                      </div>
                      <p className="text-xs font-medium text-neutral-500 ">
                        Tx Hash
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <ProofForm
                form={form}
                selectedPaymentLabel={selectedPayment?.title}
                error={formError || error}
                busy={false}
                actionLabel="Review disclosure"
                onFieldChange={setField}
                onGenerate={handleReview}
              />
              {activeDuplicateProof ? (
                <DuplicateProofNotice
                  proofId={activeDuplicateProof.proofId}
                  availableProofTypes={availableProofTypes}
                />
              ) : null}
            </div>
          ) : (
            <>
              <div className="space-y-2 ">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold tracking-tight text-foreground">Review Disclosure Policy</h3>
                </div>
                <p className="text-sm leading-relaxed text-neutral-500 ">
                  Review your Zero-Knowledge disclosure policy. Only the <span className="text-primary font-medium">shared statements</span> will be cryptographically revealed.
                </p>
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.05fr_1.5fr] ">
                <div className="space-y-6">


                  <ProofPreview disclosedItems={previewItems} hiddenItems={hiddenItems} />
                </div>

                <Card className=" bg-transparent ">

                  <CardContent className="space-y-5  ">
                    <div className="rounded-3xl border  p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">Payment</p>
                      <p className="mt-2 text-sm font-medium ">
                        {selectedPayment?.title} • {formatMoney(selectedPayment?.amount || "0", selectedPayment?.token || "")}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">{shortHash(form.paymentTxHash, 6, 6)}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-foreground/8 bg-black/20 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Role</p>
                        <p className="mt-2 text-sm ">{formatRoleLabel(form.actorRole)}</p>
                      </div>
                      <div className="rounded-3xl border border-foreground/8 bg-black/20 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Proof Type</p>
                        <p className="mt-2 text-sm ">
                          {form.proofType === "existence"
                            ? "Basic"
                            : form.proofType === "amount"
                              ? "Exact Amount"
                              : "Threshold"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-foreground/8 bg-black/20 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                        Applied Constraints
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-neutral-300">
                        <p>Request ID: {shortHash(form.requestId, 6, 6)}</p>
                        {form.minAmount ? <p>Minimum amount: {form.minAmount}</p> : null}
                        {form.maxAmount ? <p>Maximum amount: {form.maxAmount}</p> : null}
                        {form.timestampFrom || form.timestampTo ? (
                          <p>
                            Time range: {form.timestampFrom || "Any start"} to {form.timestampTo || "Any end"}
                          </p>
                        ) : (
                          <p>No time range disclosed</p>
                        )}
                      </div>
                    </div>

                    {(formError || error) ? (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {formError || error}
                      </div>
                    ) : null}

                    {activeDuplicateProof ? (
                      <DuplicateProofNotice
                        proofId={activeDuplicateProof.proofId}
                        availableProofTypes={availableProofTypes}
                      />
                    ) : null}

                    <Button
                      size="lg"
                      onClick={handleGenerate}
                      disabled={busyAction === "generate"}
                      className="w-full "
                    >
                      {busyAction === "generate" ? "Generating proof..." : "Generate proof"}
                    </Button>
                  </CardContent>
                </Card>


              </div>
            </>
          )}
        </div>

      )}
    </div>
  )
}

function DuplicateProofNotice({
  proofId,
  availableProofTypes,
}: {
  proofId: string
  availableProofTypes: Array<"existence" | "amount" | "threshold">
}) {
  return (
    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-4 text-sm text-orange-100">
      <p className="font-medium">An active proof for this exact statement already exists.</p>
      <p className="mt-2 text-orange-100/80">
        Reuse proof <span className="font-mono">{shortHash(proofId, 8, 6)}</span>, revoke it from your issued proofs ledger, or generate one of the other proof types.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {availableProofTypes.map((type) => (
          <span key={type} className="rounded-full border border-orange-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100/90">
            {type === "existence" ? "Basic" : type === "amount" ? "Amount" : "Threshold"}
          </span>
        ))}
        <Link href="/compliance/proofs">
          <Button size="sm" variant="outline" className="rounded-xl border-orange-400/20 bg-transparent text-orange-100 hover:bg-orange-500/10 hover:text-orange-50">
            See issued proofs
          </Button>
        </Link>
      </div>
    </div>
  )
}

function StepNavItem({
  step,
  current,
  label,
  icon: Icon,
  isDone,
}: {
  step: number
  current: number
  label: string
  icon: LucideIcon
  isDone: boolean
}) {
  const active = current === step

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 transition-all duration-500",
        active ? "opacity-100" : isDone ? "opacity-90" : "opacity-40"
      )}
    >
      <div className="flex items-center gap-3">
        {/* The Circle Indicator */}
        <div
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500",
            active
              ? "scale-110  bg-primary/10 "
              : isDone
                ? " bg-primary text-black"
                : "border-foreground/10 bg-neutral-900"
          )}
        >
          {/* Transition between Icon and Checkmark */}
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300" />
          ) : (
            <Icon className={cn(
              "h-5 w-5 transition-colors",
              active ? "text-primary" : "text-neutral-500"
            )} />
          )}


        </div>

        {/* Text Label Group */}
        <div className="hidden flex-col sm:flex">
          <span className={cn(
            "text-xs font-bold uppercase tracking-widest transition-colors",
            active ? "text-primary" : isDone ? "text-foreground" : "text-neutral-500"
          )}>
            {label}
          </span>
          <span className="text-[10px] font-medium text-neutral-600">
            {active ? "In Progress" : isDone ? "Completed" : `Step ${step}`}
          </span>
        </div>
      </div>
    </div>
  )
}
