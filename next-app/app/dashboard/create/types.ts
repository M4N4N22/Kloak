// ─────────────────────────────────────────────
// Wizard step type
// ─────────────────────────────────────────────
export type Step = 1 | 2 | 3 | "success";

// ─────────────────────────────────────────────
// Eligibility DSL
// ─────────────────────────────────────────────
export type ContributionRule = {
  type: "contribution_count";
  min: number;
};

export type JoinedBeforeRule = {
  type: "joined_before";
  timestamp: number; // unix seconds
};

export type EligibilityRule =
  | ContributionRule
  | JoinedBeforeRule;

// ─────────────────────────────────────────────
// Main form state
// ─────────────────────────────────────────────
export type CreateDistributionForm = {
  name: string;
  description: string;
  deadline: string;

  // Eligibility (v2)
  eligibilityRules: EligibilityRule[];
  eligibilityPreview: string; // derived, NOT authoritative
};
