import { EligibilityRule } from "@/app/dashboard/create/types";

export type Distribution = {
  id: string;
  name: string;
  description: string;
  eligibilityRules: EligibilityRule[];
  eligibilityPreview: string;
  creatorAddress: string;
};

export type ApplyDistribution = {
  id: string;
  name: string;
  description: string;
  eligibilityRules: EligibilityRule[];
};

export type FlowState =
  | "form"
  | "gate"
  | "verifying"
  | "success"
  | "error";

