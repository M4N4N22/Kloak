"use client";

import { Loader2 } from "lucide-react";

export function VerifyingState() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <Loader2
          className="w-12 h-12 text-[#015FFD] animate-spin mx-auto"
        />

        <div className="space-y-2">
          <h2 className="text-xl font-medium tracking-tight">
            Verifying eligibility privately…
          </h2>

          <p className="text-sm text-[#666666]">
            Generating a zero-knowledge proof locally to verify
            eligibility. No identity, wallet address, or personal
            data is shared.
          </p>
        </div>
      </div>
    </div>
  );
}
