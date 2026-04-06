"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import type { SelectiveDisclosureProof } from "@/hooks/use-selective-disclosure-proofs"

type DisclosureConstraints = {
  minAmount?: number
  maxAmount?: number
  requestId?: string
  timestampFrom?: string
  timestampTo?: string
}

type DisclosureProofType = "existence" | "amount" | "threshold"
type DisclosureActorRole = "payer" | "receiver"
type WalletReceiptSummary = {
  actorRole?: DisclosureActorRole
  ownerAddress: string
  counterpartyAddress: string
  commitment: string
  paymentTimestamp: string
  amountMicro: string
}

type DuplicateProofInfo = {
  proofId: string
  proofType: DisclosureProofType
  actorRole: DisclosureActorRole
  createdAt: string
  disclosureTxHash: string | null
}

type VerifyResponse = {
  valid: boolean
  proofId: string
  paymentTxHash: string
  disclosureTxHash?: string | null
  requestId: string
  ownerAddress: string
  counterpartyAddress: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  proverAddress: string
  commitment: string
  nullifier?: string | null
  revoked: boolean
  verifiedAt: string
  paymentTimestamp?: string | null
  constraints: DisclosureConstraints
  message: string
}

type PreparedDisclosure = {
  paymentId: string
  program: string
  requestId: string
  amountMicro: string
  amountDisplay: string
  ownerAddress: string
  counterpartyAddress: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  exactAmount?: string | null
  thresholdAmount?: string | null
  paymentTimestamp: string
  paymentTxHash: string
  commitment: string | null
  constraints: DisclosureConstraints
  proofFunction: string
}

type DisclosureReceiptRecord = {
  plaintext?: string
  recordPlaintext?: string
  spent?: boolean
}

const MAX_U64 = "18446744073709551615u64"

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

function normalizeTimestampRange(constraints: DisclosureConstraints) {
  const from = constraints.timestampFrom
    ? `${Math.floor(new Date(constraints.timestampFrom).getTime() / 1000)}u64`
    : "0u64"
  const to = constraints.timestampTo
    ? `${Math.floor(new Date(constraints.timestampTo).getTime() / 1000)}u64`
    : MAX_U64

  return [from, to]
}

function buildDisclosureInputs(prepared: PreparedDisclosure, receiptPlaintext: string) {
  if (prepared.proofFunction.endsWith("_amount")) {
    return [receiptPlaintext, `${prepared.amountMicro}u64`]
  }

  if (prepared.proofFunction.endsWith("_threshold")) {
    return [receiptPlaintext, `${prepared.thresholdAmount}u64`]
  }

  if (prepared.proofFunction.endsWith("_timebox")) {
    return [receiptPlaintext, ...normalizeTimestampRange(prepared.constraints)]
  }

  return [receiptPlaintext]
}

function scoreReceiptMatch(
  prepared: PreparedDisclosure,
  roleCode: string,
  plaintext: string,
) {
  let score = 0

  const requestId = extractFieldValue(plaintext, "request_id")
  const role = extractFieldValue(plaintext, "role")
  const owner = extractFieldValue(plaintext, "owner")
  const counterparty = extractFieldValue(plaintext, "counterparty")
  const commitment = extractFieldValue(plaintext, "commitment")

  if (requestId === normalizeLeoValue(prepared.requestId)) score += 1
  if (role === roleCode) score += 1
  if (owner === normalizeLeoValue(prepared.ownerAddress)) score += 1
  if (counterparty === normalizeLeoValue(prepared.counterpartyAddress)) score += 1
  if (prepared.commitment && commitment === normalizeLeoValue(prepared.commitment)) score += 1

  return score
}

export function useSelectiveDisclosure() {
  const { address, connected, executeTransaction, transactionStatus, requestRecords } = useWallet()

  const [busyAction, setBusyAction] = useState<"generate" | "verify" | "revoke" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastVerified, setLastVerified] = useState<VerifyResponse | null>(null)
  const [duplicateProof, setDuplicateProof] = useState<DuplicateProofInfo | null>(null)
  const [availableProofTypes, setAvailableProofTypes] = useState<DisclosureProofType[]>([])

  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback

  const generateProof = async (input: {
    txHash: string
    requestId: string
    actorRole: DisclosureActorRole
    proofType: DisclosureProofType
    constraints?: DisclosureConstraints
    walletReceipt?: WalletReceiptSummary
  }): Promise<SelectiveDisclosureProof> => {
    if (!connected || !address) {
      throw new Error("Connect your wallet to generate a disclosure proof")
    }

    try {
      setBusyAction("generate")
      setError(null)
      setDuplicateProof(null)
      setAvailableProofTypes([])

      const prepareRes = await fetch("/api/proof/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "prepare",
          actorAddress: address,
          txHash: input.txHash,
          requestId: input.requestId,
          actorRole: input.actorRole,
          proofType: input.proofType,
          exactAmount: input.proofType === "amount" ? undefined : undefined,
          thresholdAmount:
            input.proofType === "threshold" && typeof input.constraints?.minAmount === "number"
              ? `${Math.floor(input.constraints.minAmount * 1_000_000)}`
              : undefined,
          constraints: input.constraints,
          walletReceipt: input.walletReceipt,
        }),
      })

      const preparedData = await prepareRes.json()

      if (!prepareRes.ok) {
        if (preparedData.code === "DUPLICATE_PROOF_STATEMENT") {
          setDuplicateProof(preparedData.existingProof || null)
          setAvailableProofTypes(preparedData.availableProofTypes || [])
        }
        throw new Error(preparedData.error || "Failed to prepare proof")
      }

      const prepared = preparedData as PreparedDisclosure
      const roleCode = input.actorRole === "payer" ? "0u8" : "1u8"
      const rawRecords = await (
        requestRecords as unknown as (
          program: string,
          includePlaintext?: boolean,
          filter?: "all" | "unspent" | "spent",
        ) => Promise<DisclosureReceiptRecord[]>
      )("kloak_protocol_v10.aleo", true, "unspent")

      const receiptCandidates = rawRecords
        .filter((record) => !record.spent)
        .map((record) => {
          const plaintext = record.recordPlaintext || record.plaintext || ""
          const requestId = extractFieldValue(plaintext, "request_id")
          const commitment = extractFieldValue(plaintext, "commitment")
          const role = extractFieldValue(plaintext, "role")
          const counterparty = extractFieldValue(plaintext, "counterparty")
          const owner = extractFieldValue(plaintext, "owner")

          const matchesCoreFields =
            requestId === normalizeLeoValue(prepared.requestId) &&
            role === roleCode &&
            owner === normalizeLeoValue(prepared.ownerAddress) &&
            counterparty === normalizeLeoValue(prepared.counterpartyAddress)

          return {
            record,
            plaintext,
            commitment,
            matchesCoreFields,
            score: scoreReceiptMatch(prepared, roleCode, plaintext),
          }
        })
        .filter((candidate) => candidate.matchesCoreFields)
        .sort((a, b) => b.score - a.score)

      const matchingReceipt = receiptCandidates[0]?.record

      const receiptPlaintext = matchingReceipt?.recordPlaintext || matchingReceipt?.plaintext

      if (!receiptPlaintext) {
        throw new Error("No matching disclosure receipt record was found in this wallet")
      }

      const commitment = extractFieldValue(receiptPlaintext, "commitment")
      const paymentTimestamp = extractFieldValue(receiptPlaintext, "timestamp")?.replace("u64", "") || prepared.paymentTimestamp

      if (!commitment) {
        throw new Error("Disclosure receipt is missing commitment data")
      }

      const txResult = await executeTransaction({
        program: prepared.program,
        function: prepared.proofFunction,
        inputs: buildDisclosureInputs(prepared, receiptPlaintext),
        privateFee: false,
      })

      if (!txResult?.transactionId) {
        throw new Error("Disclosure transaction rejected or failed")
      }

      let txId = txResult.transactionId
      let attempts = 0
      let finalized = false

      while (!finalized && attempts < 150) {
        const response = await transactionStatus(txId)
        const realTxId = response.transactionId

        if (realTxId && realTxId !== txId) {
          txId = realTxId
        }

        const currentStatus = (typeof response === "string" ? response : response.status)?.toLowerCase()

        if (["finalized", "completed", "accepted"].includes(currentStatus)) {
          finalized = true
          break
        }

        if (["failed", "rejected"].includes(currentStatus)) {
          throw new Error(`Disclosure transaction ${currentStatus} on network.`)
        }

        await new Promise((resolve) => setTimeout(resolve, 4000))
        attempts++
      }

      if (!finalized) {
        throw new Error("Disclosure transaction confirmation timeout")
      }

      const finalizeRes = await fetch("/api/proof/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "finalize",
          actorAddress: address,
          txHash: input.txHash,
          requestId: input.requestId,
          actorRole: prepared.actorRole,
          proofType: prepared.proofType,
          ownerAddress: prepared.ownerAddress,
          counterpartyAddress: prepared.counterpartyAddress,
          exactAmount: prepared.proofType === "amount" ? prepared.amountMicro : null,
          thresholdAmount: prepared.proofType === "threshold" ? prepared.thresholdAmount : null,
          paymentTimestamp,
          commitment,
          disclosureTxHash: txId,
          constraints: input.constraints,
          walletReceipt: input.walletReceipt,
        }),
      })

      const proof = await finalizeRes.json()

      if (!finalizeRes.ok) {
        if (proof.code === "DUPLICATE_PROOF_STATEMENT") {
          setDuplicateProof(proof.existingProof || null)
          setAvailableProofTypes(proof.availableProofTypes || [])
        }
        throw new Error(proof.error || "Failed to store proof")
      }

      return proof as SelectiveDisclosureProof
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to generate proof"))
      throw err
    } finally {
      setBusyAction(null)
    }
  }

  const verifyProof = async (input: {
    proofId?: string
    verifier?: string
    proof?: unknown
  }) => {
    try {
      setBusyAction("verify")
      setError(null)

      const res = await fetch("/api/proof/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify proof")
      }

      setLastVerified(data)
      return data as VerifyResponse
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to verify proof"))
      throw err
    } finally {
      setBusyAction(null)
    }
  }

  const revokeProof = async (proofId: string, actorAddress: string) => {
    try {
      setBusyAction("revoke")
      setError(null)

      const res = await fetch(`/api/proof/${encodeURIComponent(proofId)}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorAddress }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke proof")
      }

      return data as SelectiveDisclosureProof
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to revoke proof"))
      throw err
    } finally {
      setBusyAction(null)
    }
  }

  return {
    busyAction,
    error,
    lastVerified,
    duplicateProof,
    availableProofTypes,
    generateProof,
    verifyProof,
    revokeProof,
  }
}
