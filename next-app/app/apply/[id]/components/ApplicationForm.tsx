"use client";

import { FileText } from "lucide-react";

type Props = {
  title: string;
  description: string;
  category: string;
  links: string;
  eligibilityPreview: string;
  onChange: (
    field: "title" | "description" | "category" | "links",
    value: string
  ) => void;
  onContinue: () => void;
};



export function ApplicationForm({
  title,
  description,
  category,
  eligibilityPreview,
  links,
  onChange,
  onContinue,
}: Props) {
  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    category.trim().length > 0 &&
    links.trim().length > 0;


  return (
    <div className="space-y-12">
      <div className="border border-[#eeeeee] bg-[#fafafa] p-6 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
          Eligibility Criteria
        </p>

        {/* Core rule */}
        <p className="text-sm text-[#111111] font-medium">
          {eligibilityPreview}
        </p>

        {/* Plain-English explanation */}
        <p className="text-xs text-[#666666] leading-relaxed">
          This means you’ve previously taken part in the ecosystem using this wallet
          in a meaningful way.
        </p>

        {/* Examples */}
        <div className="text-sm text-[#666666]">
          <p className="mb-1">Examples of qualifying contributions include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submitting a proposal or application</li>
            <li>Participating in governance (such as voting)</li>
            <li>Completing a previously approved grant or task</li>
            <li>Other verified contributions recognised by the ecosystem</li>
          </ul>
        </div>

        {/* Privacy reassurance */}
        <p className="text-xs text-[#777777]">
          You’ll privately prove this in the next step. No activity details or identity
          are revealed.
        </p>
      </div>


      {/* Proposal fields */}
      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">
            Proposal Title
          </label>
          <input
            type="text"
            required
            placeholder="Short, descriptive title"
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full border border-[#eeeeee] bg-white p-4 text-sm
              focus:border-[#015FFD] focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">
            Proposal Description
          </label>
          <textarea
            required
            rows={8}
            placeholder="Describe your work, approach, and expected impact…"
            value={description}
            onChange={(e) => onChange("description", e.target.value)}
            className="w-full border border-[#eeeeee] bg-white p-4 text-sm
              focus:border-[#015FFD] focus:outline-none transition-colors resize-none"
          />
          <p className="text-[11px] text-[#999999]">
            Focus on the idea and impact. Avoid personal or identifying details.
          </p>
        </div>

        {/* Category + links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => onChange("category", e.target.value)}
              className="w-full border border-[#eeeeee] bg-white p-4 text-sm
                focus:border-[#015FFD] focus:outline-none transition-colors"
            >
              <option value="">Select a category</option>
              <option value="research">Core Research</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="application">Application Layer</option>
              <option value="education">Education & Outreach</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">
              Supporting Links
            </label>
            <input
              type="text"
              placeholder="GitHub, website, whitepaper, etc."
              value={links}
              onChange={(e) => onChange("links", e.target.value)}
              className="w-full border border-[#eeeeee] bg-white p-4 text-sm
    focus:border-[#015FFD] focus:outline-none transition-colors"
            />

          </div>
        </div>
      </div>

      {/* Verification explanation (SECONDARY) */}
      <div className="border border-[#eeeeee] bg-white p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#fafafa] border border-[#eeeeee]">
            <FileText size={16} className="text-[#111111]" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">
            How eligibility is verified
          </h3>
        </div>

        <p className="text-sm text-[#666666] leading-relaxed">
          After submitting your proposal, you’ll privately prove that you meet
          the eligibility criteria using zero-knowledge verification.
          No identities or raw data are revealed.
        </p>
      </div>

      {/* Continue CTA */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!isValid}
          onClick={onContinue}
          className={`w-full py-3 text-sm font-medium transition
            ${isValid
              ? "bg-black text-white hover:opacity-90"
              : "bg-[#dddddd] text-[#777777] cursor-not-allowed"
            }`}
        >
          Continue to eligibility check
        </button>
      </div>
    </div>
  );
}
