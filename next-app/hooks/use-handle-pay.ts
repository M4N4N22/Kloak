"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

export type Status =
    | "idle"
    | "scanning"
    | "consolidating"
    | "signing"
    | "pending"      // <--- Added this for ZK proof gen
    | "broadcasting"
    | "finalized"
    | "error";

type AleoRecord = {
    record: string;
    plaintext: string;
    recordCiphertext: string
    recordPlaintext: string
    spent: boolean
    originalIndex?: number
}

export function useHandlePay(link: any, amount: string) {
    const { connected, address, executeTransaction, transactionStatus, requestRecords } = useWallet()

    const [status, setStatus] = useState<Status>("idle")
    const [txId, setTxId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handlePay = async () => {
        if (!connected || !address || !amount) return

        setErrorMessage(null)

        try {
            setStatus("scanning")
            setLoading(true)

            console.log("----- ALEO PAYMENT DEBUG -----")

            const rawRecords = await requestRecords("credits.aleo", true)

            console.log("Raw records:", rawRecords)

            const records = (rawRecords as AleoRecord[]).map((record, index) => ({
                ...record,
                originalIndex: index,
            }))
            const unspent = records.filter((r) => !r.spent)

            console.log("Unspent records count:", unspent.length)

            const requiredMicro = BigInt(Math.floor(Number(amount) * 1_000_000))

            console.log("Required microcredits:", requiredMicro.toString())

            const getBalance = (r: any) => {
                const text = r.recordPlaintext || r.plaintext || ""

                const match = text.match(/microcredits:\s*(\d+)u64/)
                if (!match) {
                    console.warn("Could not parse microcredits from record:", text)
                    return BigInt(0)
                }

                return BigInt(match[1])
            }

            /* log each record */

            unspent.forEach((r, i) => {
                console.log(
                    `Record ${i}:`,
                    getBalance(r).toString(),
                    "microcredits"
                )
            })

            const totalBalance = unspent.reduce(
                (acc, r) => acc + getBalance(r),
                BigInt(0)
            )

            console.log("Total private balance:", totalBalance.toString())

            const sorted = [...unspent].sort((a, b) =>
                Number(getBalance(b) - getBalance(a))
            )

            console.log(
                "Largest record:",
                sorted[0] ? getBalance(sorted[0]).toString() : "none"
            )

            /* insufficient balance check */

            if (sorted.length === 0 || getBalance(sorted[0]) < requiredMicro) {

                console.log("Largest record insufficient")

                const totalAvailable = sorted
                    .slice(0, 2)
                    .reduce((acc, r) => acc + getBalance(r), BigInt(0))

                console.log(
                    "Top 2 records total:",
                    totalAvailable.toString()
                )

                if (totalAvailable < requiredMicro) {

                    console.warn("INSUFFICIENT BALANCE TRIGGERED")

                    console.log("Required:", requiredMicro.toString())
                    console.log("Available (top2):", totalAvailable.toString())
                    console.log("Actual wallet total:", totalBalance.toString())

                    setErrorMessage("Insufficient private balance to complete this payment.")
                    setStatus("error")
                    return
                }

                console.log("Fragmented balance detected → joining records")

                setStatus("consolidating")
                const joinResult = await executeTransaction({
                    program: "credits.aleo",
                    function: "join",
                    inputs: [
                        sorted[0].recordCiphertext,
                        sorted[1].recordCiphertext
                    ],
                    recordIndices: [sorted[0].originalIndex, sorted[1].originalIndex],
                    privateFee: false,
                })

                console.log("Join transaction result:", joinResult)

                if (!joinResult?.transactionId) {
                    setErrorMessage("Record consolidation failed. Please retry.")
                    setStatus("error")
                    return
                }

                setErrorMessage(
                    "Balance fragmented. Joining records. Retry payment in ~30 seconds."
                )

                setStatus("idle")
                return
            }

            console.log(
                "Selected payment record balance:",
                getBalance(sorted[0]).toString()
            )

            console.log("----- END DEBUG -----")
            /* ---------------- SIGNING & PROVING ---------------- */

            setStatus("signing");

            const amountFormatted = `${requiredMicro}u64`;
            const requestIdFormatted = link.requestId.endsWith("field")
                ? link.requestId
                : `${link.requestId}field`;

            const recordPlaintext = sorted[0].recordPlaintext || sorted[0].plaintext;

            // Start the transaction
            const resultPromise = executeTransaction({
                program: "kloak_protocol_v5.aleo",
                function: "pay_request",
                inputs: [recordPlaintext, requestIdFormatted, amountFormatted],
                recordIndices: [sorted[0].originalIndex],
                privateFee: false
            });

            // UX HACK: After ~2 seconds, if the promise is still pending, 
            // it means the user likely clicked "Approve" and the wallet is proving.
            const provingTimeout = setTimeout(() => setStatus("pending"), 2000);

            const result = await resultPromise;
            clearTimeout(provingTimeout); // Clear if it finished super fast

            if (!result?.transactionId) {
                setErrorMessage("Transaction rejected or failed.");
                setStatus("error");
                return;
            }

            const txId = result.transactionId;
            setTxId(txId);

            /* ---------------- BROADCAST ---------------- */
            setStatus("broadcasting");
            // ... rest of your polling logic

            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;

                try {
                    const response = await transactionStatus(txId);
                    const realTxId = response.transactionId;

                    // 2. UPDATE STATE IF IT CHANGED (from shield_... to at1...)
                    if (realTxId && realTxId !== txId) {
                        console.log("Updating to on-chain TxID:", realTxId);
                        setTxId(realTxId);
                    }
                    // DEBUG: See what the network is actually saying
                    console.log(`Polling Attempt ${attempts} - Status:`, response);

                    // Normalize the status to handle different SDK versions
                    const currentStatus = (typeof response === 'string' ? response : response.status)?.toLowerCase();

                    if (currentStatus === "finalized" || currentStatus === "completed" || currentStatus === "accepted") {
                        clearInterval(poll);
                        console.log("Transaction Finalized! Updating DB...");
                        const finalId = realTxId || txId;

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
                            });

                            if (!dbResponse.ok) throw new Error("DB Update Failed");

                            setStatus("finalized");
                        } catch (dbErr) {
                            console.error("Payment was successful on-chain, but DB update failed:", dbErr);
                            setErrorMessage("Payment confirmed on-chain, but failed to update record. Please contact support.");
                            setStatus("error");
                        }
                    } else if (["failed", "rejected"].includes(currentStatus)) {
                        clearInterval(poll);
                        setErrorMessage(`Transaction ${currentStatus} on network.`);
                        setStatus("error");
                    }

                    // Increase timeout for Aleo (can take up to 3 mins on congested testnet)
                    if (attempts > 150) {
                        clearInterval(poll);
                        setErrorMessage("Network confirmation timeout. Check your wallet for status.");
                        setStatus("error");
                    }

                } catch (err) {
                    // Log errors but don't stop the poll (node might just be 404ing while tx propagates)
                    console.warn("Polling error (waiting for propagation...):", err);
                }
            }, 5000); // 5 seconds is safer for rate-limiting

        } catch (err: any) {

            const msg = err?.message || ""

            if (msg.toLowerCase().includes("cancel")) {
                setErrorMessage("Transaction cancelled in wallet.")
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
