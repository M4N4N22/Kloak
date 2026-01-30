import { Distribution } from "../types";

export function loadDistributionById(
  distributionId: string
): Distribution | null {
  // search across all wallets (for apply side)
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith("kloak:distributions:")) continue;

    const list = JSON.parse(localStorage.getItem(key) || "[]");

    const found = list.find(
      (d: any) => d.id === distributionId
    );

    if (found) {
      return {
        id: found.id,
        name: found.data.name,
        description: found.data.description,
        eligibilityRules: found.data.eligibilityRules,
        eligibilityPreview: found.data.eligibilityPreview,
        creatorAddress: found.creatorAddress,
      };
    }
  }

  return null;
}
