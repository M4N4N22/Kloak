function key(address) {
    return `kloak:distributions:${address}`;
}
/**
 * Save a distribution for a creator wallet
 */
export function saveDistribution(distribution) {
    const storageKey = key(distribution.creatorAddress);
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    localStorage.setItem(storageKey, JSON.stringify([...existing, distribution]));
}
/**
 * Get all distributions for a wallet
 */
export function getDistributions(address) {
    return JSON.parse(localStorage.getItem(key(address)) || "[]");
}
/**
 * Get a single distribution by ID (creator-side)
 */
export function getDistributionById(address, id) {
    return getDistributions(address).find((d) => d.id === id);
}
/**
 * Get a distribution by ID (apply-side, wallet-agnostic)
 */
export function findDistributionById(id) {
    for (const k of Object.keys(localStorage)) {
        if (!k.startsWith("kloak:distributions:"))
            continue;
        const list = JSON.parse(localStorage.getItem(k) || "[]");
        const found = list.find((d) => d.id === id);
        if (found)
            return found;
    }
    return undefined;
}
// Creator-side (dashboard)
export function getDistributionByIdForCreator(address, id) {
    const all = getDistributions(address);
    return all.find((d) => d.id === id);
}
// Applicant-side (public read)
export function getPublicDistributionById(id) {
    if (typeof window === "undefined")
        return null;
    const raw = localStorage.getItem("kloak:distributions");
    if (!raw)
        return null;
    const all = JSON.parse(raw);
    return all.find((d) => d.id === id) ?? null;
}
