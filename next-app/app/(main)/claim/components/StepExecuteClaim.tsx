"use client";

import { useState } from "react";
import {
    ProgramManager,
    AleoKeyProvider,
    Account
} from "@provablehq/sdk";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { generateDeterministicSecret } from "@/core/zk";

const DEMO_ADDRESS = "1field";

// Replace with your actual deployed program ID
const PROGRAM_ID =
    "kloak_distribution.aleo";

export default function StepExecuteClaim({
    address,
    secret,
    commitment,
}: {
    address?: string | null;
    secret: string | null;
    commitment: string | null;
}) {
    const {
        wallet,
        executeTransaction,
        transactionStatus,
        connected,
        network
    } = useWallet();
    console.log("Wallet network:", network);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<any | null>(null);
    const [showIneligibleModal, setShowIneligibleModal] = useState(false);
    const [useDemoMode, setUseDemoMode] = useState(false);

    const effectiveAddress = useDemoMode ? DEMO_ADDRESS : address;
    const effectiveSecret = useDemoMode
        ? generateDeterministicSecret(DEMO_ADDRESS).toString()
        : secret;

    const handleClaim = async () => {
        if (!connected) {
            console.error(" Wallet not connected");
            return;
        }

        if (!effectiveAddress || !effectiveSecret) {
            console.error(" Missing address or secret");
            return;
        }

        try {
            setLoading(true);
            setLogs(null);

            console.log("Starting claim execution...");
            console.log("Using address:", effectiveAddress);

            //  Fetch Merkle proof
            const res = await fetch("/api/claim-proof", {
                method: "POST",
                body: JSON.stringify({ address: effectiveAddress }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.status === 403) {
                setShowIneligibleModal(true);
                return;
            }

            const proofData = await res.json();
            if (!res.ok) throw new Error(proofData.error);

            console.log(" Proof data received:", proofData);

            const ensureField = (value: string) =>
                value.endsWith("field") ? value : `${value}field`;

            const ensureU64 = (value: string | number) => {
                const str = value.toString();
                return str.endsWith("u64") ? str : `${str}u64`;
            };

            const inputs: string[] = [
                ensureField(proofData.merkleRoot),
                ensureU64(proofData.payout),
                ensureField(effectiveSecret),
                ensureField(proofData.proof.s1),
                ensureField(proofData.proof.s2),
                ensureField(proofData.proof.s3),
                proofData.proof.d1 ? "true" : "false",
                proofData.proof.d2 ? "true" : "false",
                proofData.proof.d3 ? "true" : "false",
            ];

            console.log(" Inputs:", inputs);

            //  Execute via wallet context
            console.log(" Requesting wallet execution...");

            console.log("FRONTEND DEBUG ------------------");
            console.log("Address:", effectiveAddress);
            console.log("Secret (frontend):", effectiveSecret);
            console.log("Root received:", proofData.merkleRoot);
            console.log("Siblings:", proofData.proof);
            console.log("Inputs sent:", inputs);
            console.log("---------------------------------");

            const result = await executeTransaction({
                program: PROGRAM_ID,      // ✔ correct key
                function: "claim",        // ✔ correct key
                inputs,

                privateFee: false,
            });
            if (!result?.transactionId) {
                throw new Error("Transaction rejected or failed");
            }

            console.log("", result.transactionId);

            //  Optional status check
            const status = await transactionStatus(result.transactionId);

            console.log(" Transaction status:", status);

            setLogs({
                mode: useDemoMode
                    ? "Demo Eligible Mode"
                    : "Real Wallet Mode",
                address: effectiveAddress,
                transactionId: result.transactionId,
                status,
            });

        } catch (err: any) {
            console.error(" Execution error:", err);
            setLogs({
                error: err.message,
                stack: err.stack,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-[#eeeeee] p-10 space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold">
                Step 3 — Execute Confidential Claim
            </h3>

            <div className="text-xs text-[#666]">
                {!useDemoMode
                    ? "Using connected wallet address"
                    : "Using demo eligible address (1field)"}
            </div>

            <button
                onClick={handleClaim}
                disabled={loading}
                className="bg-[#111111] text-white px-8 py-4 text-sm font-medium hover:bg-black transition-colors"
            >
                {loading
                    ? "Generating ZK Proof & Broadcasting..."
                    : "Submit Claim"}
            </button>

            {logs && (
                <div className="bg-black text-green-400 text-xs p-4 overflow-auto">
                    <pre>{JSON.stringify(logs, null, 2)}</pre>
                </div>
            )}

            {/* Ineligible Modal */}
            {showIneligibleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-8 max-w-md space-y-6 text-center">
                        <h4 className="font-bold text-lg">
                            Wallet Not Eligible
                        </h4>

                        <p className="text-sm text-[#666]">
                            Your connected wallet is not part of the
                            predefined Merkle distribution.
                        </p>

                        <p className="text-xs text-[#999]">
                            For demo purposes, switch to a precomputed
                            eligible address.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() =>
                                    setShowIneligibleModal(false)
                                }
                                className="px-4 py-2 border"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    setUseDemoMode(true);
                                    setShowIneligibleModal(false);
                                }}
                                className="px-4 py-2 bg-[#015FFD] text-white"
                            >
                                Use Demo Address (1field)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}