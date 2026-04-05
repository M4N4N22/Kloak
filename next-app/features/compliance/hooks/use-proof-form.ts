"use client"

import { useMemo, useState } from "react"

import type { CompliancePayment } from "@/hooks/use-compliance-payments"

export type GenerateFormState = {
  paymentTxHash: string
  requestId: string
  actorRole: "payer" | "receiver"
  proofType: "existence" | "amount" | "threshold"
  minAmount: string
  maxAmount: string
  timestampFrom: string
  timestampTo: string
}

const initialState: GenerateFormState = {
  paymentTxHash: "",
  requestId: "",
  actorRole: "payer",
  proofType: "existence",
  minAmount: "",
  maxAmount: "",
  timestampFrom: "",
  timestampTo: "",
}

function validateGenerateForm(form: GenerateFormState) {
  if (!form.paymentTxHash.trim()) {
    return "Choose a payment from your history before generating a proof."
  }

  if (!form.requestId.trim()) {
    return "A request ID is required to bind the proof to the original payment request."
  }

  if (form.proofType === "threshold" && !form.minAmount.trim()) {
    return "Threshold proofs require a minimum amount."
  }

  return null
}

export function useProofForm(payments: { sent: CompliancePayment[]; received: CompliancePayment[] }) {
  const [form, setForm] = useState<GenerateFormState>(initialState)
  const [error, setError] = useState<string | null>(null)

  const selectedPayment = useMemo(() => {
    const allPayments = [...payments.sent, ...payments.received]
    return allPayments.find((payment) => payment.txHash === form.paymentTxHash) || null
  }, [form.paymentTxHash, payments.received, payments.sent])

  const setField = <K extends keyof GenerateFormState>(field: K, value: GenerateFormState[K]) => {
    if (error) {
      setError(null)
    }

    setForm((current) => ({ ...current, [field]: value }))
  }

  const selectPayment = (payment: CompliancePayment) => {
    setError(null)
    setForm((current) => ({
      ...current,
      paymentTxHash: payment.txHash,
      requestId: payment.requestId,
      actorRole: payment.direction === "sent" ? "payer" : "receiver",
    }))
  }

  const validate = () => {
    const validationError = validateGenerateForm(form)
    setError(validationError)
    return !validationError
  }

  return {
    form,
    error,
    setError,
    setField,
    selectedPayment,
    selectPayment,
    validate,
  }
}
