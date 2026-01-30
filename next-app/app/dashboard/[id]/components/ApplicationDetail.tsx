"use client";

import { Shield, CheckCircle2, Info } from "lucide-react";
import { ApplicationRecord } from "@/app/lib/verifier/types";

/* --------------------------------------------
   Category display labels
--------------------------------------------- */
const CATEGORY_LABELS: Record<string, string> = {
  research: "Core Research",
  infrastructure: "Infrastructure",
  application: "Application Layer",
  education: "Education & Outreach",
};

export function ApplicationDetail({
  application,
  onClose,
  onUpdateStatus,
}: {
  application: ApplicationRecord;
  onClose: () => void;
  onUpdateStatus: (status: ApplicationRecord["status"]) => void;
}) {
  const category = application.metadata.find(
    (m) => m.label === "Category"
  )?.value;

  const links = application.metadata.find(
    (m) => m.label === "Supporting Links"
  )?.value;

  return (
    <div className="border border-[#111111] flex flex-col h-full">
      {/* Header */}
      <div className="p-8 border-b border-[#eeeeee] flex justify-between">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#999999] font-bold">
            Application
          </p>
          <h3 className="text-xl font-medium">
            {application.title}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-[#666666] underline"
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-10 overflow-y-auto">
        {/* Proposal */}
        <section className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-[#999999] font-bold">
            Proposal
          </p>
          <p className="text-sm leading-relaxed">
            {application.content}
          </p>
        </section>

        {/* Metadata */}
        {(category || links) && (
          <section className="grid grid-cols-2 gap-8 border-t border-[#eeeeee] pt-8">
            {category && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#999999] font-bold">
                  Category
                </p>
                <p className="text-sm font-medium">
                  {CATEGORY_LABELS[category] ?? category}
                </p>
              </div>
            )}

            {links && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#999999] font-bold">
                  Supporting Links
                </p>
                <p className="text-sm font-medium break-all">
                  {links}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Eligibility */}
        <section className="bg-[#fafafa] border border-[#eeeeee] p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#015FFD]" />
            <p className="text-sm font-medium">
              Eligibility verified
            </p>
          </div>

          <p className="text-xs text-[#666666]">
            {application.proof.type === "zk"
              ? "The applicant privately proved they met the eligibility criteria using zero-knowledge verification."
              : "Eligibility was verified using a demo verifier for testing purposes."}
          </p>

          <p className="text-xs text-[#777777]">
            No activity details, identity information, or proof data are visible.
          </p>
        </section>
      </div>

      {/* Actions */}
      <div className="p-8 border-t border-[#eeeeee] bg-[#fafafa] flex gap-4 items-center">
        <button
          onClick={() => onUpdateStatus("Reviewed")}
          className="border px-4 py-2 text-xs font-bold"
        >
          Mark Reviewed
        </button>

        <button
          onClick={() => onUpdateStatus("Selected")}
          className="bg-[#015FFD] text-white px-4 py-2 text-xs font-bold inline-flex items-center gap-2"
        >
          <CheckCircle2 size={14} />
          Select
        </button>

        {application.status === "Selected" && (
          <p className="text-[10px] text-[#015FFD] font-bold flex items-center gap-1 ml-auto">
            <Info size={12} />
            Selection visible only to applicant
          </p>
        )}
      </div>
    </div>
  );
}
