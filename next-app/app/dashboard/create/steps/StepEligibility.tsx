"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  CreateDistributionForm,
  EligibilityRule,
} from "../types";
import { renderEligibility } from "../utils/renderEligibility";

type Props = {
  formData: CreateDistributionForm;
  setFormData: React.Dispatch<React.SetStateAction<CreateDistributionForm>>;
  onNext: () => void;
  onBack: () => void;
};

export default function StepEligibility({
  formData,
  setFormData,
  onNext,
  onBack,
}: Props) {
  const [minContributions, setMinContributions] = useState<number>(0);
  const [joinedBefore, setJoinedBefore] = useState<string>("");

  // Build rules deterministically
  useEffect(() => {
    const rules: EligibilityRule[] = [];

    if (minContributions > 0) {
      rules.push({
        type: "contribution_count",
        min: minContributions,
      });
    }

    if (joinedBefore) {
      rules.push({
        type: "joined_before",
        timestamp: Math.floor(
          new Date(joinedBefore).getTime() / 1000
        ),
      });
    }

    setFormData((prev) => ({
      ...prev,
      eligibilityRules: rules,
      eligibilityPreview: renderEligibility(rules),
    }));
  }, [minContributions, joinedBefore, setFormData]);

  const isValid = formData.eligibilityRules.length > 0;

  return (
    <div className="space-y-8">
      {/* Info */}
      <div className="p-6 bg-[#fafafa] border border-[#eeeeee] space-y-2">
        <p className="text-sm text-[#666666]">
          Applicants prove eligibility privately using zero-knowledge proofs.
          No identities or raw data are revealed.
        </p>
      </div>

      {/* Rule Builder */}
      <div className="space-y-6">
        {/* Contribution Rule */}
        <div className="border border-[#eeeeee] p-4 space-y-3">
          <p className="text-sm font-medium">
            Minimum verified contributions
          </p>

          <input
            type="number"
            min={0}
            value={minContributions}
            onChange={(e) => setMinContributions(+e.target.value)}
            className="w-32 bg-[#fafafa] border px-3 py-2 text-sm"
          />
        </div>

        {/* Joined Before Rule */}
        <div className="border border-[#eeeeee] p-4 space-y-3">
          <p className="text-sm font-medium">Joined before</p>

          <input
            type="date"
            value={joinedBefore}
            onChange={(e) => setJoinedBefore(e.target.value)}
            className="bg-[#fafafa] border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="border border-[#eeeeee] p-4 bg-[#fafafa]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999] mb-2">
          Eligibility Preview
        </p>
        <p className="text-sm text-[#666666]">
          {formData.eligibilityPreview || "No rules defined yet."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="border border-[#eeeeee] px-8 py-3 text-sm"
        >
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!isValid}
          className="bg-[#015FFD] text-white px-8 py-3 text-sm disabled:opacity-50"
        >
          Review Distribution
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
