"use client";

import { Shield } from "lucide-react";

export function PrivacyNotice() {
  return (
    <div className="bg-[#f0f7ff] border border-[#015FFD]/20 p-6 mb-12 flex gap-4">
      <Shield
        className="text-[#015FFD] shrink-0"
        size={20}
      />

      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#015FFD]">
          Privacy Notice
        </h3>

        <p className="text-sm text-[#111111] leading-relaxed">
          Your application is submitted privately. Your identity,
          wallet address, and personal data are never exposed to
          the issuer or the public.
        </p>
      </div>
    </div>
  );
}
