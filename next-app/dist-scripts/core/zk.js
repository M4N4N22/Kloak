import { Field, BHP256 } from "@provablehq/sdk";
/**
 * Single reusable BHP256 instance
 */
const bhp256 = new BHP256();
/**
 * IMPORTANT:
 * Changing this creates a new distribution.
 */
const DISTRIBUTION_SALT = "kloak_grant_001";
/**
 * Convert Field -> little endian bit array
 */
function fieldToBits(field) {
    return field.toBitsLe();
}
/**
 * Convert bytes -> little endian bit array
 */
function bytesToBits(bytes) {
    const bits = [];
    for (const byte of bytes) {
        for (let i = 0; i < 8; i++) {
            bits.push(((byte >> i) & 1) === 1);
        }
    }
    return bits;
}
/**
 * Convert arbitrary string -> Field
 * Safe for wallet addresses or salts.
 *
 * string → bytes → bits → BHP256 → Field
 */
function stringToField(str) {
    const bytes = new TextEncoder().encode(str);
    return bhp256.hash(bytesToBits(bytes));
}
/**
 * hash1(a) = BHP256::hash_to_field(a)
 * Matches Leo:
 *
 * inline hash1(a: field) -> field {
 *   return BHP256::hash_to_field(a);
 * }
 */
export function computeCommitment(secret) {
    return bhp256.hash([secret]);
}
/**
 * hash2(a, b) = BHP256::hash_to_field([a, b])
 * Matches Leo exactly.
 */
export function computeHash2(a, b) {
    return bhp256.hash([a, b]);
}
/**
 * Deterministic Secret
 *
 * secret = hash2(address_field, salt_field)
 *
 * ✔ No storage required
 * ✔ Deterministic
 * ✔ Unique per wallet
 * ✔ Unique per distribution
 */
export function generateDeterministicSecret(address) {
    const addressField = stringToField(address);
    const saltField = stringToField(DISTRIBUTION_SALT);
    return computeHash2(addressField, saltField);
}
/**
 * leaf = hash2(commitment, payout)
 * Matches Leo:
 * leaf = hash2(hash1(secret), payout as field)
 */
export function computeLeaf(commitment, payout) {
    const payoutField = Field.fromString(`${payout}field`);
    return computeHash2(commitment, payoutField);
}
/**
 * nullifier = hash2(secret, merkle_root)
 * Matches Leo exactly.
 */
export function computeNullifier(secret, merkleRoot) {
    const rootField = stringToField(merkleRoot);
    return computeHash2(secret, rootField);
}
/**
 * Convert string -> Field safely
 * (exposed helper if needed elsewhere)
 */
export function toField(value) {
    return stringToField(value);
}
/**
 * Format claim inputs for ProgramManager.execute
 */
export function formatClaimInputs(params) {
    return [
        stringToField(params.merkleRoot).toString(),
        `${params.payout}u64`,
        params.secret.toString(),
        stringToField(params.s1).toString(),
        stringToField(params.s2).toString(),
        stringToField(params.s3).toString(),
        params.d1,
        params.d2,
        params.d3,
    ];
}
