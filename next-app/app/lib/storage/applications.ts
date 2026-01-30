import { ApplicationRecord } from "@/app/lib/verifier/types";

function key(distributionId: string) {
  return `kloak:applications:${distributionId}`;
}

/**
 * Save an application for a distribution
 */
export function saveApplication(
  application: ApplicationRecord
) {
  if (typeof window === "undefined") return;

  const storageKey = key(application.distributionId);

  const existing: ApplicationRecord[] = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );

  localStorage.setItem(
    storageKey,
    JSON.stringify([...existing, application])
  );
}

/**
 * Get all applications for a distribution
 */
export function getApplications(
  distributionId: string
): ApplicationRecord[] {
  if (typeof window === "undefined") return [];

  return JSON.parse(
    localStorage.getItem(key(distributionId)) || "[]"
  );
}
