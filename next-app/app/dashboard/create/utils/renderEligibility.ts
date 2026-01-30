import { EligibilityRule } from "../types";

export function renderEligibility(
  rules: EligibilityRule[]
): string {
  if (rules.length === 0) {
    return "No eligibility requirements.";
  }

  const parts = rules.map((rule) => {
    switch (rule.type) {
      case "contribution_count":
        return `At least ${rule.min} verified ecosystem contribution${
          rule.min > 1 ? "s" : ""
        }`;

      case "joined_before":
        return `Wallet interacted with the ecosystem before ${formatDate(
          rule.timestamp
        )}`;

      default:
        return "";
    }
  });

  return parts.join(" • ");
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}
