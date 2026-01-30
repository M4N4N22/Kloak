"use client";

import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { CreateDistributionForm } from "../types";

type Props = {
  formData: CreateDistributionForm;
};

export default function StepSuccess({ formData }: Props) {
  const slug = formData.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const applicationLink = `https://kloak.app/apply/${slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(applicationLink);
    } catch {
      // silent fail – UX fallback could be added later
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 space-y-12 animate-in fade-in zoom-in-95 duration-700">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 bg-[#015FFD]/10 text-[#015FFD] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} />
        </div>

        <h1 className="text-3xl font-medium tracking-tight">
          Distribution Created
        </h1>

        <p className="text-[#666666]">
          Your private distribution is now live. You can share
          the application link with eligible applicants.
        </p>
      </div>

      {/* Application Link */}
      <div className="p-6 border border-[#eeeeee] space-y-4 bg-[#fafafa]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
          Application Link
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={applicationLink}
            className="flex-1 bg-white border border-[#eeeeee]
              px-4 py-2 text-xs font-mono text-[#666666]"
          />

          <button
            onClick={copyLink}
            className="bg-[#111111] text-white
              px-4 py-2 text-xs font-medium
              hover:bg-black transition-colors
              flex items-center gap-2"
          >
            <Copy size={14} />
            Copy
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2
            bg-[#015FFD] text-white px-8 py-3
            text-sm font-medium hover:bg-[#0052db]
            transition-colors"
        >
          View Distributions
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2
            border border-[#eeeeee] text-[#111111]
            px-8 py-3 text-sm font-medium
            hover:bg-[#fafafa] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
