"use client";

import { useState } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import {
    generateDeterministicSecret,
    computeCommitment,
} from "@/core/zk";

export default function StepGenerateSecret({
  address,
  onGenerated,
}: {
  address?: string | null;
  onGenerated: (secret: string, commitment: string) => void;
}) {
    const {  connected } = useWallet();

    const [secret, setSecret] = useState<any>(null);
    const [commitment, setCommitment] = useState<any>(null);
    const [revealSecret, setRevealSecret] = useState(false);
    const [loading, setLoading] = useState(false);

const handleGenerate = async () => {
  if (!address) return;

  setLoading(true);

  const res = await fetch("/api/zk/derive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  const data = await res.json();

  setSecret(data.secret);
  setCommitment(data.commitment);

  // 🔥 pass upward
  onGenerated(data.secret, data.commitment);

  setLoading(false);
};

    const secretReady = Boolean(secret && commitment);

    return (
        <div className="border border-[#eeeeee] p-10 space-y-6 transition-all">

            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold">
                        Step 1 — Generate Claim Key
                    </h3>

                    <span className="text-[10px] uppercase tracking-wide bg-black text-white px-2 py-1">
                        Demo Mode
                    </span>
                </div>

                <p className="text-[#666666] text-sm leading-relaxed">
                    Your claim key is deterministically derived from your wallet and a
                    fixed distribution salt.
                </p>

                <p className="text-xs text-[#999]">
                    In production, this value is never revealed. It is shown here for
                    judges and demo transparency only.
                </p>
            </div>

            {/* Generate Button */}
            <div>
                <button
                    onClick={handleGenerate}
                    disabled={!connected || loading || secretReady}
                    className="bg-[#015FFD] text-white px-6 py-3 text-sm font-medium hover:bg-[#0052db] transition-colors disabled:opacity-40"
                >
                    {!connected
                        ? "Connect Wallet First"
                        : loading
                            ? "Generating..."
                            : secretReady
                                ? "Key Generated"
                                : "Generate Key"}
                </button>
            </div>

            {/* Output Box */}
            <div className="bg-[#fafafa] border border-[#eeeeee] p-4 text-xs font-mono break-all space-y-4 min-h-[100px]">

                {!connected && (
                    <div className="text-[#999]">
                        Connect wallet to generate claim key
                    </div>
                )}

                {secretReady && commitment && (
                    <>
                        {/* Commitment */}
                        <div>
                            <div className="text-[#015FFD] font-medium mb-1">
                                Commitment (Inserted into Merkle Tree)
                            </div>
                            <div className="bg-white border border-[#eeeeee] p-2">
                                {commitment.toString()}
                            </div>
                        </div>

                        {/* Reveal Toggle */}
                        <div className="pt-3 border-t border-[#e5e5e5]">
                            <button
                                onClick={() => setRevealSecret((prev) => !prev)}
                                className="text-[#015FFD] text-xs underline hover:opacity-70 transition"
                            >
                                {revealSecret ? "Hide Secret" : "Reveal Secret (Demo Only)"}
                            </button>

                            {revealSecret && (
                                <div className="mt-3 bg-white border border-red-300 p-3 text-[11px]">
                                    <div className="text-red-500 font-semibold mb-1">
                                        Sensitive Value — Debug Only
                                    </div>
                                    <div>{secret.toString()}</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
                <div className="text-xs text-[#888]">
                    {secretReady
                        ? "Key derived successfully"
                        : "Awaiting action"}
                </div>

                {secretReady && (
                    <div className="text-xs bg-[#015FFD] text-white px-3 py-1">
                        Ready
                    </div>
                )}
            </div>
        </div>
    );
}