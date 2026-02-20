"use client";


import { AlertTriangle, ArrowLeft } from "lucide-react";
import { EligibilityRule } from "@/app/dashboard/create/types";
import { renderEligibility } from "@/app/dashboard/create/utils/renderEligibility";

type Props = {
  eligibilityRules: EligibilityRule[];
  onBack: () => void;
  onProceed: () => Promise<void>;
};

export function EligibilityGate({
  eligibilityRules,
  onBack,
  onProceed,
}: Props) {

  return (
    <div className="space-y-6">
      {/* Eligibility summary */}
      <div className="border border-[#eeeeee] bg-[#fafafa] p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999] mb-2">
          Eligibility being verified
        </p>
        <p className="text-sm text-[#111111]">
          {renderEligibility(eligibilityRules)}
        </p>
      </div>

      
    </div>
  );
}
