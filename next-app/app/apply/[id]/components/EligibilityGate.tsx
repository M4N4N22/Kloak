"use client";

import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
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
  const { connected } = useWallet();

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

      {!connected ? (
        <div className="p-6 border border-[#eeeeee] bg-white space-y-4">
          <div className="flex items-center gap-2 text-sm text-[#666666]">
            <AlertTriangle size={16} />
            Connect your wallet to privately prove eligibility.
          </div>

          <WalletMultiButton />

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs text-[#666666] underline"
          >
            <ArrowLeft size={12} />
            Go back
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={onProceed}
            className="w-full bg-[#015FFD] text-white px-8 py-4
              text-xs font-bold uppercase tracking-widest
              hover:bg-[#004ecb] transition-colors"
          >
            Prove Eligibility & Submit
          </button>

          <button
            onClick={onBack}
            className="w-full text-xs text-[#666666] underline"
          >
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
