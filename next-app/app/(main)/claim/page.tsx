"use client";

import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { useState } from "react";

import WalletSection from "./components/WalletSection";
import StepGenerateSecret from "./components/StepGenerateSecret";
import StepExecuteClaim from "./components/StepExecuteClaim";

export default function ClaimFlow() {
  const { address, connected } = useWallet();

  const [secret, setSecret] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);

  // Determine current active step for the progress indicator
  const currentStep = !connected ? 1 : !secret ? 2 : 3;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Sidebar: Progress Tracker */}
        <div className="lg:col-span-4 space-y-8">
          <div className="sticky top-12">
            <h1 className="text-2xl font-bold tracking-tight text-black mb-2">
              Kloak Distribution
            </h1>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">
              Complete the three-stage protocol to claim your grant using 
              Zero-Knowledge Merkle inclusion proofs.
            </p>

            <nav className="space-y-6">
              {[
                { n: 1, label: "Identity Link", desc: "Connect Aleo Wallet", done: connected },
                { n: 2, label: "Key Derivation", desc: "Generate Private Secret", done: !!secret },
                { n: 3, label: "Protocol Execution", desc: "Broadcast ZK Proof", done: false },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === s.n ? "bg-[#015FFD] text-white ring-4 ring-blue-50" : 
                      s.done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {s.done ? "✓" : s.n}
                    </div>
                    {s.n !== 3 && <div className={`w-2px h-10 my-1 ${s.done ? "bg-green-200" : "bg-gray-100"}`} />}
                  </div>
                  <div className="pt-1">
                    <p className={`text-xs font-bold uppercase tracking-widest ${currentStep === s.n ? "text-black" : "text-gray-400"}`}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 italic">Proving Note:</p>
                <p className="text-[11px] text-gray-600 leading-normal">
                    The ZK-proof is generated locally in your browser. Your secret never leaves your device.
                </p>
            </div>
          </div>
        </div>

        {/* Right Content: The Interactive Steps */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Step 1: Wallet */}
          <section className={`transition-all duration-500 ${currentStep !== 1 ? "opacity-50 grayscale-[0.5] scale-[0.98]" : "opacity-100"}`}>
            <WalletSection />
          </section>

          {/* Step 2: Secret Generation */}
          <section className={`transition-all duration-500 ${
            currentStep < 2 ? "opacity-30 pointer-events-none translate-y-4" : 
            currentStep > 2 ? "opacity-50 grayscale-[0.5] scale-[0.98]" : "opacity-100"
          }`}>
            <StepGenerateSecret
              address={address}
              onGenerated={(s, c) => {
                setSecret(s);
                setCommitment(c);
              }}
            />
          </section>

          {/* Step 3: Execution */}
          <section className={`transition-all duration-500 ${
            currentStep < 3 ? "opacity-30 pointer-events-none translate-y-4" : "opacity-100"
          }`}>
            <StepExecuteClaim
              address={address}
              secret={secret}
              commitment={commitment}
            />
          </section>

          {/* Visual Aid for Judges */}
          <div className="pt-8 border-t border-gray-100">
             <div className="grid grid-cols-2 gap-8 text-[11px]">
                <div className="space-y-2">
                    <p className="font-bold text-black uppercase">Merkle Inclusion</p>
                    <p className="text-gray-500">We verify your commitment exists in a pre-defined tree without revealing which leaf belongs to you.</p>
                </div>
                <div className="space-y-2">
                    <p className="font-bold text-black uppercase">Nullifier Strategy</p>
                    <p className="text-gray-500">A unique hash is published on-chain to prevent double-claiming while preserving total anonymity.</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}