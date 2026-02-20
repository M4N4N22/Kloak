function key(distributionId) {
    return `kloak:applications:${distributionId}`;
}
/**
 * Save an application for a distribution
 */
export function saveApplication(application) {
    if (typeof window === "undefined")
        return;
    const storageKey = key(application.distributionId);
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    localStorage.setItem(storageKey, JSON.stringify([...existing, application]));
}
/**
 * Get all applications for a distribution
 */
export function getApplications(distributionId) {
    if (typeof window === "undefined")
        return [];
    return JSON.parse(localStorage.getItem(key(distributionId)) || "[]");
}
