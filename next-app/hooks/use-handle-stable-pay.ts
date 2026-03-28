"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import type { Status } from "./use-handle-pay"

type StableToken = "USDCX" | "USAD"

type StableRecord = {
  record?: string
  plaintext?: string
  recordCiphertext: string
  recordPlaintext?: string
  spent?: boolean
  proofs?: unknown
  merkleProofs?: unknown
  merkleProof?: unknown
  formattedProofs?: unknown
  originalIndex?: number
}

const TOKEN_CONFIG: Record<
  StableToken,
  {
    assetProgram: string
    payFunction: string
  }
> = {
  USDCX: {
    assetProgram: "test_usdcx_stablecoin.aleo",
    payFunction: "pay_request_usdcx",
  },
  USAD: {
    assetProgram: "test_usad_stablecoin.aleo",
    payFunction: "pay_request_usad",
  },
}

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

function extractProofInput(record: StableRecord) {
  const proofCandidate =
    record.formattedProofs ??
    record.proofs ??
    record.merkleProofs ??
    record.merkleProof

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

  return null
}

export function useHandleStablePay(link: any, amount: string) {
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

    try {
      setStatus("scanning")
      setLoading(true)

      const rawRecords = await requestRecords(tokenConfig.assetProgram, true)
      const records = (rawRecords as StableRecord[]).map((record, index) => ({
        ...record,
        originalIndex: index,
      }))
      const unspent = records.filter((record) => !record.spent)

      const requiredAmount = BigInt(Math.floor(Number(amount) * 1_000_000))

      if (unspent.length === 0) {
        setErrorMessage(`No private ${token} records found in this wallet.`)
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

      const proofInput = extractProofInput(selectedRecord)

      if (!proofInput) {
        setErrorMessage(
          `Missing Merkle proof data for ${token} transfer. Refresh your wallet records and try again.`
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

      const resultPromise = executeTransaction({
        program: "kloak_protocol_v6.aleo",
        function: tokenConfig.payFunction,
        inputs: [recordPlaintext, requestIdFormatted, amountFormatted, proofInput],
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
      setTxId(optimisticTxId)
      setStatus("broadcasting")

      let attempts = 0
      const poll = setInterval(async () => {
        attempts++

        try {
          const response = await transactionStatus(optimisticTxId)
          const realTxId = response.transactionId

          if (realTxId && realTxId !== optimisticTxId) {
            setTxId(realTxId)
          }

          const currentStatus = (typeof response === "string" ? response : response.status)?.toLowerCase()

          if (["finalized", "completed", "accepted"].includes(currentStatus)) {
            clearInterval(poll)
            const finalId = realTxId || optimisticTxId

            try {
              const dbResponse = await fetch(`/api/payment-links/${link.id}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  payer: address,
                  amount,
                  token: link.token,
                  txHash: finalId,
                }),
              })

              if (!dbResponse.ok) throw new Error("DB Update Failed")

              setStatus("finalized")
            } catch (error) {
              console.error("Stablecoin payment was successful on-chain, but DB update failed:", error)
              setErrorMessage("Payment confirmed on-chain, but failed to update record. Please contact support.")
              setStatus("error")
            }
          } else if (["failed", "rejected"].includes(currentStatus)) {
            clearInterval(poll)
            setErrorMessage(`Transaction ${currentStatus} on network.`)
            setStatus("error")
          }

          if (attempts > 150) {
            clearInterval(poll)
            setErrorMessage("Network confirmation timeout. Check your wallet for status.")
            setStatus("error")
          }
        } catch (error) {
          console.warn("Stablecoin polling error (waiting for propagation...):", error)
        }
      }, 5000)
    } catch (error: any) {
      const message = error?.message || ""

      if (message.toLowerCase().includes("cancel")) {
        setErrorMessage("Transaction cancelled in wallet.")
      } else {
        setErrorMessage(`Unexpected error during ${link.token} payment.`)
      }

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
