import { CreateDistributionForm } from "@/app/dashboard/create/types";

export type StoredDistribution = {
  id: string;
  createdAt: number;

  creatorAddress: string;
  network: "testnet" | "mainnet";

  signature: string;
  signedMessage: string;

  data: CreateDistributionForm;
};

function key(address: string) {
  return `kloak:distributions:${address}`;
}

/**
 * Save a distribution for a creator wallet
 */
export function saveDistribution(
  distribution: StoredDistribution
) {
  const storageKey = key(distribution.creatorAddress);

  const existing: StoredDistribution[] = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );

  localStorage.setItem(
    storageKey,
    JSON.stringify([...existing, distribution])
  );
}

/**
 * Get all distributions for a wallet
 */
export function getDistributions(
  address: string
): StoredDistribution[] {
  return JSON.parse(
    localStorage.getItem(key(address)) || "[]"
  );
}

/**
 * Get a single distribution by ID (creator-side)
 */
export function getDistributionById(
  address: string,
  id: string
): StoredDistribution | undefined {
  return getDistributions(address).find(
    (d) => d.id === id
  );
}

/**
 * Get a distribution by ID (apply-side, wallet-agnostic)
 */
export function findDistributionById(
  id: string
): StoredDistribution | undefined {
  for (const k of Object.keys(localStorage)) {
    if (!k.startsWith("kloak:distributions:")) continue;

    const list: StoredDistribution[] = JSON.parse(
      localStorage.getItem(k) || "[]"
    );

    const found = list.find((d) => d.id === id);
    if (found) return found;
  }

  return undefined;
}

// Creator-side (dashboard)
export function getDistributionByIdForCreator(
  address: string,
  id: string
): StoredDistribution | undefined {
  const all = getDistributions(address);
  return all.find((d) => d.id === id);
}

// Applicant-side (public read)
export function getPublicDistributionById(
  id: string
): StoredDistribution | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("kloak:distributions");
  if (!raw) return null;

  const all: StoredDistribution[] = JSON.parse(raw);
  return all.find((d) => d.id === id) ?? null;
}

