"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { computePaymentCommitment } from "@/core/zk"

export type Status =
    | "idle"
    | "scanning"
    | "consolidating"
    | "signing"
    | "pending"
    | "broadcasting"
    | "finalized"
    | "error"

type PaymentLinkShape = {
    id: string
    requestId: string
    token: "ALEO" | "USDCX" | "USAD"
    creatorAddress?: string | null
}

type ErrorWithMessage = {
    message?: string
}

type AleoRecord = {
    plaintext?: string
    recordPlaintext?: string
    spent?: boolean
}

const FINAL_STATUSES = ["finalized", "completed", "accepted"] as const
const FAILED_STATUSES = ["failed", "rejected"] as const
const POLL_INTERVAL_MS = 1000
const MAX_POLL_ATTEMPTS = 180

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseMicrocredits(record: AleoRecord) {
    const text = record.recordPlaintext || record.plaintext || ""
    const match = text.match(/microcredits:\s*(\d+)u64/)
    return match ? BigInt(match[1]) : BigInt(0)
}

export function useHandlePay(link: PaymentLinkShape, amount: string) {
    const { connected, address, executeTransaction, transactionStatus, requestRecords } = useWallet()

    const [status, setStatus] = useState<Status>("idle")
    const [txId, setTxId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handlePay = async () => {
        if (!connected || !address || !amount) return

        setErrorMessage(null)
        setTxId(null)
        setLoading(true)

        try {
            const requiredMicro = BigInt(Math.floor(Number(amount) * 1_000_000))
            const requestIdFormatted = link.requestId.endsWith("field")
                ? link.requestId
                : `${link.requestId}field`
            const amountFormatted = `${requiredMicro}u64`
            const merchantAddress = link.creatorAddress

            if (!merchantAddress) {
                throw new Error("Payment link is missing merchant address.")
            }

            const { Field } = await import("@provablehq/sdk")
            const receiptSecret = Field.random().toString()
            const receiptTimestamp = Math.floor(Date.now() / 1000)
            const commitment = await computePaymentCommitment(
                requestIdFormatted,
                requiredMicro.toString(),
                address,
                merchantAddress,
                receiptTimestamp,
                receiptSecret,
            )

            setStatus("scanning")

            const records = await (
                requestRecords as unknown as (
                    program: string,
                    includePlaintext?: boolean,
                    filter?: "all" | "unspent" | "spent",
                ) => Promise<AleoRecord[]>
            )("credits.aleo", true, "unspent")

            const selectedRecord = records
                .filter((record) => !record.spent)
                .sort((a, b) => Number(parseMicrocredits(b) - parseMicrocredits(a)))
                .find((record) => parseMicrocredits(record) >= requiredMicro)

            const recordPlaintext = selectedRecord?.recordPlaintext || selectedRecord?.plaintext

            if (!recordPlaintext) {
                setErrorMessage("No private ALEO record with enough balance was found in this wallet.")
                setStatus("error")
                return
            }

            setStatus("signing")

            const resultPromise = executeTransaction({
                program: "kloak_protocol_v8.aleo",
                function: "pay_request_aleo",
                inputs: [
                    recordPlaintext,
                    requestIdFormatted,
                    merchantAddress,
                    amountFormatted,
                    `${receiptTimestamp}u64`,
                    receiptSecret,
                ],
                fee: 100000, // Transaction fee in microcredits
                privateFee: false, // Whether the fee is private
            })

            const provingTimeout = setTimeout(() => setStatus("pending"), 2000)
            let result

            try {
                result = await resultPromise
            } finally {
                clearTimeout(provingTimeout)
            }

            if (!result?.transactionId) {
                setErrorMessage("Transaction rejected or failed.")
                setStatus("error")
                return
            }

            const tempTransactionId = result.transactionId
            let finalTransactionId = tempTransactionId

            setTxId(tempTransactionId)
            setStatus("broadcasting")

            for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
                try {
                    const statusResponse = await transactionStatus(tempTransactionId)
                    const currentStatus = statusResponse.status?.toLowerCase()

                    if (statusResponse.transactionId) {
                        finalTransactionId = statusResponse.transactionId
                        setTxId(statusResponse.transactionId)
                    }

                    if (FINAL_STATUSES.includes(currentStatus as (typeof FINAL_STATUSES)[number])) {
                        try {
                            const dbResponse = await fetch(`/api/payment-links/${link.id}/pay`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    payer: address,
                                    payerAddress: address,
                                    merchantAddress,
                                    amount,
                                    token: link.token,
                                    txHash: finalTransactionId,
                                    receiptCommitment: commitment,
                                    receiptOwner: address,
                                }),
                            })

                            if (!dbResponse.ok) {
                                throw new Error("Payment confirmed on-chain, but failed to update record.")
                            }
                        } catch (error) {
                            console.error("Payment was successful on-chain, but DB update failed:", error)
                            setErrorMessage("Payment confirmed on-chain, but failed to update record. Please contact support.")
                            setStatus("error")
                            return
                        }

                        setStatus("finalized")
                        return
                    }

                    if (FAILED_STATUSES.includes(currentStatus as (typeof FAILED_STATUSES)[number])) {
                        setErrorMessage(`Transaction ${currentStatus} on network.`)
                        setStatus("error")
                        return
                    }
                } catch (error) {
                    console.warn("Polling error (waiting for propagation...):", error)
                }

                await sleep(POLL_INTERVAL_MS)
            }

            setErrorMessage("Network confirmation timeout. Check your wallet for status.")
            setStatus("error")
        } catch (error: unknown) {
            const message = (error as ErrorWithMessage)?.message || ""

            if (message.toLowerCase().includes("cancel")) {
                setErrorMessage("Transaction cancelled in wallet.")
            } else if (message) {
                setErrorMessage(message)
            } else {
                setErrorMessage("Unexpected error during payment.")
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
