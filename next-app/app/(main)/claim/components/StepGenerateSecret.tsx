"use client";

import { useState } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";

export default function StepGenerateSecret({
  address,
  onGenerated,
}: {
  address?: string | null;
  onGenerated: (secret: string, commitment: string) => void;
}) {
  const { connected } = useWallet();

  const [secret, setSecret] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [revealSecret, setRevealSecret] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const res = await fetch("/api/zk/derive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();
      setSecret(data.secret);
      setCommitment(data.commitment);
      onGenerated(data.secret, data.commitment);
    } catch (error) {
      console.error("Derivation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const secretReady = Boolean(secret && commitment);

  return (
    <div className="border border-[#eeeeee] bg-white p-8 space-y-8 shadow-sm rounded-sm">
      {/* Header aligned with Claim UI */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold">
            Step 1 — Identity Derivation
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Derive a private claim key from your public wallet address.
          </p>
        </div>
        <span className="text-[9px] bg-black text-white px-2 py-1 rounded uppercase font-bold tracking-tighter">
          Transparency Mode
        </span>
      </div>

      {/* Visual Flow: Address -> Hash -> Secret */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 relative overflow-hidden">
        <div className="text-center z-10">
          <p className="text-[9px] uppercase text-gray-400 font-bold mb-1">Public Address</p>
          <p className="text-[10px] font-mono">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}</p>
        </div>
        
        <div className="flex-1 flex justify-center items-center px-4">
            <div className={`h-px flex-1 ${secretReady ? "bg-[#015FFD]" : "bg-gray-200"}`} />
            <div className={`mx-2 text-[10px] ${secretReady ? "text-[#015FFD]" : "text-gray-300"}`}>
                {loading ? "⟁" : "⏈"}
            </div>
            <div className={`h-px flex-1 ${secretReady ? "bg-[#015FFD]" : "bg-gray-200"}`} />
        </div>

        <div className="text-center z-10">
          <p className="text-[9px] uppercase text-gray-400 font-bold mb-1">Private Secret</p>
          <p className="text-[10px] font-mono">{secretReady ? "••••••••••••" : "Pending"}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleGenerate}
        disabled={!connected || loading || secretReady}
        className={`w-full py-4 text-xs font-bold tracking-widest transition-all ${
          !connected ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
          loading ? "bg-gray-50 text-gray-400 cursor-wait" :
          secretReady ? "bg-green-50 text-green-700 border border-green-200" : 
          "bg-[#015FFD] text-white hover:bg-[#0052db]"
        }`}
      >
        {!connected ? "CONNECT WALLET TO START" : 
         loading ? "DERIVING CRYPTOGRAPHIC KEY..." : 
         secretReady ? "✓ KEY DERIVED SUCCESSFULLY" : "GENERATE CLAIM KEY"}
      </button>

      {/* Output Sections */}
      {secretReady && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Public Commitment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Public Commitment</label>
                <span className="text-[9px] text-[#015FFD] font-mono">BHP256(Secret)</span>
            </div>
            <div className="bg-[#fafafa] border border-gray-100 p-3 text-[10px] font-mono break-all text-gray-600 rounded">
              {commitment}
            </div>
          </div>

          {/* Private Secret - Reveal Toggle Dashboard Style */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-3">
               <div>
                  <p className="text-[10px] font-bold text-gray-900 uppercase">Deterministic Secret</p>
                  <p className="text-[9px] text-gray-400">Never shared with the network.</p>
               </div>
               <button
                  onClick={() => setRevealSecret((prev) => !prev)}
                  className={`text-[10px] px-3 py-1 rounded-full border transition-all ${
                    revealSecret ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  {revealSecret ? "Hide Secret" : "Reveal (Demo Only)"}
                </button>
            </div>

            {revealSecret && (
              <div className="bg-red-50/50 border border-red-100 p-3 rounded font-mono text-[10px] text-red-800 break-all relative">
                <div className="absolute top-2 right-2 text-[8px] font-bold text-red-300 uppercase">Sensitive Data</div>
                {secret}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer / Explanation */}
      <div className="bg-blue-50/50 p-4 rounded text-[11px] text-blue-700 leading-relaxed border border-blue-100">
        <strong>How it works:</strong> We use your wallet address as a seed to create a 
        unique private secret. This secret is used to generate the <strong>nullifier</strong> later, ensuring 
        your identity remains hidden while preventing double-claims.
      </div>
    </div>
  );
}