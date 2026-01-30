"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function SuccessState({ id }: { id: string }) {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full border border-[#eeeeee] p-12 text-center space-y-8 bg-[#fafafa]">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#015FFD]/10 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[#015FFD]" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-medium tracking-tight">
            Application submitted
          </h1>

          <p className="text-sm text-[#666666] leading-relaxed">
            Your application has been recorded successfully.
            Eligibility was verified privately using zero-knowledge
            proofs. You can return later to check the status.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col gap-3">
          <Link
            href={`/status/${id}`}
            className="w-full bg-[#111111] text-white
              py-3 text-xs font-bold uppercase tracking-widest
              hover:bg-black transition-colors text-center"
          >
            View Application Status
          </Link>

          <Link
            href="/"
            className="w-full bg-white border border-[#eeeeee]
              text-[#111111] py-3 text-xs font-bold uppercase
              tracking-widest hover:bg-[#fafafa]
              transition-colors text-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
