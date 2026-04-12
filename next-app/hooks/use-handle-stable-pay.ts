"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { computePaymentCommitment } from "@/core/zk"

import type { Status } from "./use-handle-pay"

type StableToken = "USDCX" | "USAD"

type StableRecord = {
  ciphertext?: string
  record?: string
  plaintext?: string
  recordCiphertext: string
  recordPlaintext?: string
  spent?: boolean
  proof?: unknown
  proofs?: unknown
  formattedProof?: unknown
  merkleProofs?: unknown
  merkleProof?: unknown
  merkle_proof?: unknown
  merkle_proofs?: unknown
  formattedProofs?: unknown
  originalIndex?: number
}

type DisclosureReceiptRecord = {
  plaintext?: string
  recordPlaintext?: string
  spent?: boolean
}

const TOKEN_CONFIG: Record<
  StableToken,
  {
    assetProgram: string
    payFunction: string
    freezeListProgram: string
  }
> = {
  USDCX: {
    assetProgram: "test_usdcx_stablecoin.aleo",
    payFunction: "pay_request_usdcx",
    freezeListProgram: "test_usdcx_freezelist.aleo",
  },
  USAD: {
    assetProgram: "test_usad_stablecoin.aleo",
    payFunction: "pay_request_usad",
    freezeListProgram: "test_usad_freezelist.aleo",
  },
}

const PROVABLE_API_HOST =
  process.env.NEXT_PUBLIC_PROVABLE_API_HOST ||
  process.env.PROVABLE_API_HOST ||
  "https://api.provable.com/v2"
const STABLECOIN_MERKLE_DEPTH = 16

function parseStableAmount(record: StableRecord) {
  const text = record.recordPlaintext || record.plaintext || ""

  const match =
    text.match(/amount:\s*(\d+)u128/) ||
    text.match(/balance:\s*(\d+)u128/) ||
    text.match(/microcredits:\s*(\d+)u128/)

  if (!match) {
    return BigInt(0)
  }

  return BigInt(match[1])
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getStableRecordIdentity(record: Partial<StableRecord>) {
  return (
    record.recordCiphertext ||
    record.ciphertext ||
    record.record ||
    record.recordPlaintext ||
    record.plaintext ||
    null
  )
}

function mergeStableRecordSources(
  encryptedRecords: StableRecord[],
  plaintextRecords: StableRecord[],
) {
  const merged = new Map<string, StableRecord>()

  encryptedRecords.forEach((record, index) => {
    const key = getStableRecordIdentity(record) || `encrypted-${index}`
    merged.set(key, {
      ...record,
      originalIndex: index,
    })
  })

  plaintextRecords.forEach((record, index) => {
    const key =
      getStableRecordIdentity(record) ||
      getStableRecordIdentity(encryptedRecords[index]) ||
      `plaintext-${index}`

    const existing = merged.get(key)

    merged.set(key, {
      ...record,
      ...existing,
      recordPlaintext: record.recordPlaintext || record.plaintext || existing?.recordPlaintext,
      plaintext: record.plaintext || existing?.plaintext,
      recordCiphertext:
        existing?.recordCiphertext || record.recordCiphertext || record.ciphertext || record.record || "",
      originalIndex: existing?.originalIndex ?? index,
    })
  })

  return Array.from(merged.values())
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === "string" && error.trim()) {
    return error
  }

  if (error && typeof error === "object") {
    const candidate = error as Record<string, unknown>

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message
    }

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error
    }
  }

  return null
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

async function findWalletReceiptCommitment(input: {
  requestRecords: ReturnType<typeof useWallet>["requestRecords"]
  ownerAddress: string
  merchantAddress: string
  requestId: string
  amountMicro: bigint
  timestamp: number
}) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const receipts = await (
      input.requestRecords as unknown as (
        program: string,
        includePlaintext?: boolean,
        filter?: "all" | "unspent" | "spent",
      ) => Promise<DisclosureReceiptRecord[]>
    )("kloak_protocol_v10.aleo", true, "unspent")

    const matchingReceipt = receipts.find((record) => {
      if (record.spent) return false

      const plaintext = record.recordPlaintext || record.plaintext || ""
      const role = extractFieldValue(plaintext, "role")
      const owner = extractFieldValue(plaintext, "owner")
      const counterparty = extractFieldValue(plaintext, "counterparty")
      const requestId = extractFieldValue(plaintext, "request_id")
      const amount = extractFieldValue(plaintext, "amount")?.replace("u64", "")
      const timestamp = extractFieldValue(plaintext, "timestamp")?.replace("u64", "")
      const commitment = extractFieldValue(plaintext, "commitment")

      return Boolean(
        commitment &&
        role === "0u8" &&
        owner === normalizeLeoValue(input.ownerAddress) &&
        counterparty === normalizeLeoValue(input.merchantAddress) &&
        requestId === normalizeLeoValue(input.requestId) &&
        amount === input.amountMicro.toString() &&
        timestamp === String(input.timestamp),
      )
    })

    const commitment = extractFieldValue(
      matchingReceipt?.recordPlaintext || matchingReceipt?.plaintext || "",
      "commitment",
    )

    if (commitment) {
      return commitment
    }

    await sleep(1000)
  }

  return null
}

function formatFieldValue(value: unknown) {
  const raw = String(value)
  return raw.endsWith("field") ? raw : `${raw}field`
}

function formatU32Value(value: unknown) {
  const raw = String(value)
  return raw.endsWith("u32") ? raw : `${raw}u32`
}

function formatMerkleProofStructs(
  proof: Array<{ siblings: unknown[]; leaf_index: unknown }>
) {
  return `[${proof
    .map(
      (entry) =>
        `{ siblings: [${entry.siblings.map((sibling) => formatFieldValue(sibling)).join(", ")}], leaf_index: ${formatU32Value(entry.leaf_index)} }`
    )
    .join(", ")}]`
}

function extractWalletProvidedProofInput(record: StableRecord) {
  const proofCandidates = [
    record.formattedProofs,
    record.formattedProof,
    record.proofs,
    record.proof,
    record.merkleProofs,
    record.merkleProof,
    record.merkle_proofs,
    record.merkle_proof,
  ]

  for (const proofCandidate of proofCandidates) {
    if (typeof proofCandidate === "string" && proofCandidate.trim()) {
      return proofCandidate.trim()
    }

    if (
      Array.isArray(proofCandidate) &&
      proofCandidate.length === 2 &&
      proofCandidate.every(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          "siblings" in entry &&
          "leaf_index" in entry
      )
    ) {
      return formatMerkleProofStructs(
        proofCandidate as Array<{ siblings: unknown[]; leaf_index: unknown }>
      )
    }

    if (proofCandidate && typeof proofCandidate === "object") {
      const nestedCandidate = proofCandidate as Record<string, unknown>
      const nestedProof =
        nestedCandidate.formattedProofs ??
        nestedCandidate.formattedProof ??
        nestedCandidate.proofs ??
        nestedCandidate.proof ??
        nestedCandidate.merkleProofs ??
        nestedCandidate.merkleProof ??
        nestedCandidate.merkle_proofs ??
        nestedCandidate.merkle_proof

      if (typeof nestedProof === "string" && nestedProof.trim()) {
        return nestedProof.trim()
      }

      if (
        Array.isArray(nestedProof) &&
        nestedProof.length === 2 &&
        nestedProof.every(
          (entry) =>
            entry &&
            typeof entry === "object" &&
            "siblings" in entry &&
            "leaf_index" in entry
        )
      ) {
        return formatMerkleProofStructs(
          nestedProof as Array<{ siblings: unknown[]; leaf_index: unknown }>
        )
      }
    }
  }

  return null
}

function parseU32Value(value: string | null) {
  if (!value) {
    return null
  }

  const match = value.trim().match(/^(\d+)u32$/)
  return match ? Number(match[1]) : null
}

function normalizeMappingAddress(value: string | null) {
  if (!value) {
    return null
  }

  const normalized = normalizeLeoValue(value)
  return normalized?.startsWith("aleo1") ? normalized : null
}

async function buildSealanceProofInput(input: {
  walletAddress: string
  freezeListProgram: string
}) {
  const { AleoNetworkClient, SealanceMerkleTree } = await import("@provablehq/sdk")

  const client = new AleoNetworkClient(PROVABLE_API_HOST)

  const lastIndexRaw = await client.getProgramMappingValue(
    input.freezeListProgram,
    "freeze_list_last_index",
    "true",
  )

  const lastIndex = parseU32Value(lastIndexRaw)

  if (lastIndex === null) {
    throw new Error("Could not read the stablecoin compliance index from Aleo.")
  }

  const addresses = (
    await Promise.all(
      Array.from({ length: lastIndex + 1 }, (_, index) =>
        client
          .getProgramMappingValue(input.freezeListProgram, "freeze_list_index", `${index}u32`)
          .then((value) => normalizeMappingAddress(value))
          .catch(() => null),
      ),
    )
  ).filter((value): value is string => Boolean(value))

  if (addresses.length === 0) {
    throw new Error("Could not load the stablecoin compliance tree from Aleo.")
  }

  const sealance = new SealanceMerkleTree()
  const leaves = sealance.generateLeaves(addresses, STABLECOIN_MERKLE_DEPTH)
  const tree = sealance.buildTree(leaves)
  const [leftLeafIndex, rightLeafIndex] = sealance.getLeafIndices(tree, input.walletAddress)
  const proofLeft = sealance.getSiblingPath(tree, leftLeafIndex, STABLECOIN_MERKLE_DEPTH)
  const proofRight = sealance.getSiblingPath(tree, rightLeafIndex, STABLECOIN_MERKLE_DEPTH)

  return sealance.formatMerkleProof([proofLeft, proofRight])
}

type StablePaymentLink = {
  id: string
  requestId: string
  token: "ALEO" | StableToken
  creatorAddress?: string | null
}

type ErrorWithMessage = {
  message?: string
}

export function useHandleStablePay(link: StablePaymentLink, amount: string) {
  const { connected, address, executeTransaction, transactionStatus, requestRecords } = useWallet()

  const [status, setStatus] = useState<Status>("idle")
  const [txId, setTxId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePay = async () => {
    if (!connected || !address || !amount) return

    const token = link.token as StableToken
    const tokenConfig = TOKEN_CONFIG[token]

    if (!tokenConfig) {
      setErrorMessage("Unsupported stablecoin payment token.")
      setStatus("error")
      return
    }

    setErrorMessage(null)
    setTxId(null)

    try {
      setStatus("scanning")
      setLoading(true)

      const [encryptedRecords, plaintextRecords] = await Promise.all([
        requestRecords(tokenConfig.assetProgram, false).catch(() => []),
        requestRecords(tokenConfig.assetProgram, true),
      ])

      const records = mergeStableRecordSources(
        encryptedRecords as StableRecord[],
        plaintextRecords as StableRecord[],
      )

      const unspent = records.filter((record) => !record.spent)

      const requiredAmount = BigInt(Math.floor(Number(amount) * 1_000_000))

      if (unspent.length === 0) {
        setErrorMessage(
          `No private ${token} records were found in this wallet. If you already hold public ${token}, shield it first so it becomes a private record, then retry this payment.`,
        )
        setStatus("error")
        return
      }

      const sorted = [...unspent].sort((a, b) =>
        Number(parseStableAmount(b) - parseStableAmount(a))
      )

      const selectedRecord = sorted[0]
      const selectedBalance = parseStableAmount(selectedRecord)

      if (selectedBalance < requiredAmount) {
        const totalBalance = sorted.reduce(
          (total, record) => total + parseStableAmount(record),
          BigInt(0)
        )

        if (totalBalance < requiredAmount) {
          setErrorMessage(`Insufficient private ${token} balance to complete this payment.`)
        } else {
          setErrorMessage(
            `${token} balance appears fragmented across multiple records. Please consolidate ${token} records first, then retry.`
          )
        }

        setStatus("error")
        return
      }

      const proofInput =
        extractWalletProvidedProofInput(selectedRecord) ||
        (await buildSealanceProofInput({
          walletAddress: address,
          freezeListProgram: tokenConfig.freezeListProgram,
        }))

      if (!proofInput) {
        setErrorMessage(
          `Could not prepare the ${token} compliance proof needed for this private transfer. Please try again in a moment.`
        )
        setStatus("error")
        return
      }

      const recordPlaintext = selectedRecord.recordPlaintext || selectedRecord.plaintext

      if (!recordPlaintext) {
        setErrorMessage(`Missing plaintext record data for ${token} transfer.`)
        setStatus("error")
        return
      }

      setStatus("signing")

      const requestIdFormatted = link.requestId.endsWith("field")
        ? link.requestId
        : `${link.requestId}field`

      const amountFormatted = `${requiredAmount}u128`
      const merchantAddress = link.creatorAddress

      if (!merchantAddress) {
        throw new Error("Payment link is missing merchant address.")
      }

      const { Field } = await import("@provablehq/sdk")
      const receiptSecret = Field.random().toString()
      const receiptTimestamp = Math.floor(Date.now() / 1000)
      const predictedCommitment = await computePaymentCommitment(
        requestIdFormatted,
        requiredAmount.toString(),
        address,
        merchantAddress,
        receiptTimestamp,
        receiptSecret,
      )

      const resultPromise = executeTransaction({
        program: "kloak_protocol_v10.aleo",
        function: tokenConfig.payFunction,
        inputs: [
          recordPlaintext,
          requestIdFormatted,
          merchantAddress,
          amountFormatted,
          proofInput,
          `${receiptTimestamp}u64`,
          receiptSecret,
        ],
        recordIndices: [selectedRecord.originalIndex ?? 0],
        privateFee: false,
      })

      const provingTimeout = setTimeout(() => setStatus("pending"), 2000)
      const result = await resultPromise
      clearTimeout(provingTimeout)

      if (!result?.transactionId) {
        setErrorMessage("Transaction rejected or failed.")
        setStatus("error")
        return
      }

      const optimisticTxId = result.transactionId
      let finalTransactionId = optimisticTxId

      setTxId(optimisticTxId)
      setStatus("broadcasting")

      for (let attempt = 0; attempt < 150; attempt++) {
        try {
          const response = await transactionStatus(optimisticTxId)
          const realTxId = response.transactionId

          if (realTxId) {
            finalTransactionId = realTxId
            setTxId(realTxId)
          }

          const currentStatus = (typeof response === "string" ? response : response.status)?.toLowerCase()

          if (["finalized", "completed", "accepted"].includes(currentStatus)) {
            try {
              const actualReceiptCommitment =
                await findWalletReceiptCommitment({
                  requestRecords,
                  ownerAddress: address,
                  merchantAddress,
                  requestId: requestIdFormatted,
                  amountMicro: requiredAmount,
                  timestamp: receiptTimestamp,
                }) || predictedCommitment

              const dbResponse = await fetch(`/api/payment-links/${link.id}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  merchantAddress,
                  amount,
                  token: link.token,
                  txHash: finalTransactionId,
                  receiptCommitment: actualReceiptCommitment,
                }),
              })

              if (!dbResponse.ok) {
                const errorPayload = await dbResponse
                  .json()
                  .catch(() => ({ error: null }))

                throw new Error(
                  typeof errorPayload?.error === "string" && errorPayload.error.trim()
                    ? errorPayload.error
                    : "Payment confirmed on-chain, but failed to update record.",
                )
              }
            } catch (error) {
              console.error("Stablecoin payment was successful on-chain, but DB update failed:", error)
              setErrorMessage(
                getReadableErrorMessage(error) ||
                  "Payment confirmed on-chain, but failed to update record. Please contact support.",
              )
              setStatus("error")
              return
            }

            setStatus("finalized")
            return
          }

          if (["failed", "rejected"].includes(currentStatus)) {
            setErrorMessage(`Transaction ${currentStatus} on network.`)
            setStatus("error")
            return
          }
        } catch (error) {
          console.warn("Stablecoin polling error (waiting for propagation...):", error)
        }

        await sleep(5000)
      }

      setErrorMessage("Network confirmation timeout. Check your wallet for status.")
      setStatus("error")
    } catch (error: unknown) {
      const message = getReadableErrorMessage(error) || (error as ErrorWithMessage)?.message || ""

      if (message.toLowerCase().includes("cancel")) {
        setErrorMessage("Transaction cancelled in wallet.")
      } else if (message) {
        setErrorMessage(message)
      } else {
        setErrorMessage(`Unexpected error during ${link.token} payment.`)
      }

      console.error(`Stablecoin payment error (${link.token})`, error)
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return {
    handlePay,
    status,
    txId,
    loading,
    errorMessage,
    connected,
  }
}
