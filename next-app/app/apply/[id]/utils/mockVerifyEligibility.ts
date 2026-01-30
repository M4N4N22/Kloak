import { EligibilityRule } from "@/app/dashboard/create/types";

type ApplicantContext = {
  contributionCount: number;
  joinedAt: number; // unix timestamp
};

export function mockVerifyEligibility(
  rules: EligibilityRule[],
  applicant: ApplicantContext
): boolean {
  for (const rule of rules) {
    if (rule.type === "contribution_count") {
      if (applicant.contributionCount < rule.min) {
        return false;
      }
    }

    if (rule.type === "joined_before") {
      if (applicant.joinedAt >= rule.timestamp) {
        return false;
      }
    }
  }

  return true;
}
