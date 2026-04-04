"use client"

import { useMemo, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { useCompliancePayments, type CompliancePayment } from "@/hooks/use-compliance-payments"
import { useSelectiveDisclosure } from "@/hooks/use-selective-disclosure"
import { useSelectiveDisclosureProofs } from "@/hooks/use-selective-disclosure-proofs"

import { ComplianceDisconnectedState } from "./components/compliance-disconnected-state"
import { ComplianceGenerateCard } from "./components/compliance-generate-card"
import { ComplianceHeader } from "./components/compliance-header"
import { CompliancePaymentPicker } from "./components/compliance-payment-picker"
import { ComplianceProofsList } from "./components/compliance-proofs-list"
import { ComplianceVerifyCard } from "./components/compliance-verify-card"
import { formatJson } from "./components/compliance-utils"

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

function validateGenerateForm(form: GenerateFormState) {
  const paymentTxHash = form.paymentTxHash.trim()
  const requestId = form.requestId.trim()

  if (!paymentTxHash) {
    return "Choose a payment from your sent or received history before generating a proof."
  }

  if (!requestId || requestId === "field") {
    return "Enter the request ID from the original payment link. It should be a field value such as `123field`."
  }

  if (form.proofType === "threshold" && !form.minAmount.trim()) {
    return "Threshold proofs need a minimum amount."
  }

  return null
}

export default function CompliancePage() {
  const { connected, address } = useWallet()
  const actorAddress = address || ""
  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
    refresh: refreshPayments,
  } = useCompliancePayments(actorAddress)

  const { proofs, loading, error: listError, refresh, setProofs } = useSelectiveDisclosureProofs(
    actorAddress,
  )
  const { busyAction, error, lastVerified, generateProof, verifyProof, revokeProof } =
    useSelectiveDisclosure()

  const [form, setForm] = useState<GenerateFormState>({
    paymentTxHash: "",
    requestId: "",
    actorRole: "payer",
    proofType: "existence",
    minAmount: "",
    maxAmount: "",
    timestampFrom: "",
    timestampTo: "",
  })
  const [proofPayload, setProofPayload] = useState("")
  const [generateError, setGenerateError] = useState<string | null>(null)

  const activeProofs = useMemo(() => proofs.filter((proof) => proof.status === "ACTIVE"), [proofs])
  const selectedPayment = useMemo(() => {
    const allPayments = [...payments.sent, ...payments.received]
    return allPayments.find((payment) => payment.txHash === form.paymentTxHash) || null
  }, [form.paymentTxHash, payments.received, payments.sent])

  const handleFieldChange = <K extends keyof GenerateFormState>(field: K, value: GenerateFormState[K]) => {
    if (generateError) {
      setGenerateError(null)
    }

    setForm((current) => ({ ...current, [field]: value }))
  }

  const handlePaymentSelect = (payment: CompliancePayment) => {
    setGenerateError(null)
    setForm((current) => ({
      ...current,
      paymentTxHash: payment.txHash,
      requestId: payment.requestId,
      actorRole: payment.direction === "sent" ? "payer" : "receiver",
    }))
  }

  const handleGenerate = async () => {
    if (!actorAddress) return

    const validationError = validateGenerateForm(form)

    if (validationError) {
      setGenerateError(validationError)
      return
    }

    try {
      setGenerateError(null)

      const created = await generateProof({
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
      })

      setProofs((current) => [created, ...current.filter((proof) => proof.proofId !== created.proofId)])
      setProofPayload(formatJson(created))
    } catch {
      return
    }
  }

  const handleVerify = async () => {
    const trimmed = proofPayload.trim()

    if (!trimmed) {
      throw new Error("Paste a proof payload or load one from the issued proofs list")
    }

    try {
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
        verifier: actorAddress || undefined,
      })
    } catch {
      return
    }
  }

  const handleRevoke = async (proofId: string) => {
    if (!actorAddress) return

    try {
      const revoked = await revokeProof(proofId, actorAddress)
      setProofs((current) => current.map((proof) => (proof.proofId === proofId ? revoked : proof)))
    } catch {
      return
    }
  }

  if (!connected) {
    return <ComplianceDisconnectedState />
  }

  return (
    <div className="space-y-8">
      <ComplianceHeader
        actorAddress={actorAddress}
        proofCount={proofs.length}
        activeProofCount={activeProofs.length}
      />

      <div className="">
        <div className="space-y-6">
          <CompliancePaymentPicker
            payments={payments}
            selectedTxHash={form.paymentTxHash}
            loading={paymentsLoading}
            error={paymentsError}
            onRefresh={() => void refreshPayments()}
            onSelect={handlePaymentSelect}
          />

          <ComplianceGenerateCard
            form={form}
            error={generateError}
            selectedPaymentLabel={
              selectedPayment
                ? `${selectedPayment.title} • ${selectedPayment.amount} ${selectedPayment.token}`
                : null
            }
            onFieldChange={handleFieldChange}
            onGenerate={handleGenerate}
            busy={busyAction !== null}
          />
        </div>

        <ComplianceVerifyCard
          proofPayload={proofPayload}
          onPayloadChange={setProofPayload}
          onVerify={handleVerify}
          busy={busyAction !== null}
          lastVerified={lastVerified}
        />
      </div>

      <ComplianceProofsList
        proofs={proofs}
        loading={loading}
        listError={listError}
        actionError={error}
        activeProofCount={activeProofs.length}
        busyAction={busyAction}
        onRefresh={() => void refresh()}
        onLoad={setProofPayload}
        onRevoke={(proofId) => void handleRevoke(proofId)}
      />
    </div>
  )
}
