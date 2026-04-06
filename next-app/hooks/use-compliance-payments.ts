"use client"

import { useCallback, useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import {
  clearCachedComplianceAccessPayload,
  COMPLIANCE_READ_SCOPE,
  getCachedComplianceAccessPayload,
} from "@/lib/compliance-access"

type WalletReceiptSummary = {
  requestId: string
  actorRole: "payer" | "receiver"
  ownerAddress: string
  counterpartyAddress: string
  commitment: string
  paymentTimestamp: string
  amountMicro: string
}

export type CompliancePayment = {
  id: string
  txHash: string
  requestId: string
  amount: string
  token: "ALEO" | "USDCX" | "USAD"
  createdAt: string
  title: string
  description: string | null
  direction: "sent" | "received"
  paymentSource: "wallet" | "server"
  walletReceipt?: WalletReceiptSummary
}

type CompliancePaymentsResponse = {
  sent: CompliancePayment[]
  received: CompliancePayment[]
  diagnostics: {
    sent: CompliancePaymentDiagnostic[]
    received: CompliancePaymentDiagnostic[]
  }
}

export type CompliancePaymentDiagnostic = {
  id: string
  direction: "sent" | "received"
  requestId: string
  commitment: string
  amount: string
  paymentTimestamp: string
  title: string
  message: string
  actionLabel: string
  reasonCode: "REQUEST_NOT_INDEXED" | "PAYMENT_NOT_SYNCED" | "PAYMENT_NOT_READY"
}

type DisclosureReceiptRecord = {
  plaintext?: string
  recordPlaintext?: string
  spent?: boolean
}

function normalizeLeoValue(value: string | null) {
  if (!value) return null

  return value
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/\.(private|public|constant)$/, "")
}

function extractFieldValue(text: string, name: string) {
  const match = text.match(new RegExp(`${name}:\\s*([^,\\n}]+)`))
  return normalizeLeoValue(match?.[1] || null)
}

function parseWalletReceipts(records: DisclosureReceiptRecord[], viewerAddress: string): WalletReceiptSummary[] {
  const byCommitment = new Map<string, WalletReceiptSummary>()

  for (const record of records) {
    if (record.spent) continue

    const plaintext = record.recordPlaintext || record.plaintext || ""
    const role = extractFieldValue(plaintext, "role")
    const owner = extractFieldValue(plaintext, "owner")

    if ((role !== "0u8" && role !== "1u8") || owner !== normalizeLeoValue(viewerAddress)) {
      continue
    }

    const requestId = extractFieldValue(plaintext, "request_id")
    const commitment = extractFieldValue(plaintext, "commitment")
    const counterparty = extractFieldValue(plaintext, "counterparty")
    const amount = extractFieldValue(plaintext, "amount")?.replace("u64", "")
    const timestamp = extractFieldValue(plaintext, "timestamp")?.replace("u64", "")

    if (!requestId || !commitment || !counterparty || !amount || !timestamp) {
      continue
    }

    byCommitment.set(commitment, {
      requestId,
      actorRole: role === "1u8" ? "receiver" : "payer",
      ownerAddress: viewerAddress,
      counterpartyAddress: counterparty,
      commitment,
      paymentTimestamp: timestamp,
      amountMicro: amount,
    })
  }

  return Array.from(byCommitment.values()).sort((a, b) => {
    const left = new Date(Number(a.paymentTimestamp) * 1000).toISOString()
    const right = new Date(Number(b.paymentTimestamp) * 1000).toISOString()
    return right.localeCompare(left)
  })
}

export function useCompliancePayments(viewerAddress?: string | null) {
  const { requestRecords } = useWallet()
  const [payments, setPayments] = useState<CompliancePaymentsResponse>({
    sent: [],
    received: [],
    diagnostics: { sent: [], received: [] },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Failed to load compliance payments"

  const refresh = useCallback(async () => {
    const viewer = viewerAddress?.trim()

    if (!viewer) {
      setPayments({ sent: [], received: [], diagnostics: { sent: [], received: [] } })
      return
    }

    try {
      setLoading(true)
      setError(null)

      const accessPayload = getCachedComplianceAccessPayload(COMPLIANCE_READ_SCOPE, viewer)

      if (!accessPayload) {
        setPayments({ sent: [], received: [], diagnostics: { sent: [], received: [] } })
        return
      }

      const walletRecords = await (
        requestRecords as unknown as (
          program: string,
          includePlaintext?: boolean,
          filter?: "all" | "unspent" | "spent",
        ) => Promise<DisclosureReceiptRecord[]>
      )("kloak_protocol_v10.aleo", true, "unspent")

      const walletReceiptSummaries = parseWalletReceipts(walletRecords || [], viewer)

      const res = await fetch("/api/proof/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...accessPayload,
          walletReceipts: walletReceiptSummaries,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearCachedComplianceAccessPayload(COMPLIANCE_READ_SCOPE, viewer)
          throw new Error("Your wallet confirmation expired or could not be checked. Please unlock your compliance records again.")
        }

        throw new Error(data.error || "We couldn't load your payment history right now.")
      }

      setPayments({
        sent: data.sent || [],
        received: data.received || [],
        diagnostics: {
          sent: data.diagnostics?.sent || [],
          received: data.diagnostics?.received || [],
        },
      })
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [viewerAddress, requestRecords])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    payments,
    loading,
    error,
    refresh,
  }
}
