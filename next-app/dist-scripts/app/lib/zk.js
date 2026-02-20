"use client";
import { Field, BHP256, } from "@provablehq/sdk";
/**
 * Single reusable BHP256 instance
 */
const bhp256 = new BHP256();
/**
 * IMPORTANT:
 * This must be fixed BEFORE building the Merkle tree.
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
 * hash1(a) = BHP256::hash_to_field(a)
 * Matches Leo:
 * inline hash1(a: field) -> field {
 *   return BHP256::hash_to_field(a);
 * }
 */
export function computeCommitment(secret) {
    const bits = fieldToBits(secret);
    return bhp256.hash(bits);
}
/**
 * hash2(a, b) = BHP256::hash_to_field([a, b])
 * Matches Leo exactly.
 */
export function computeHash2(a, b) {
    const bitsA = fieldToBits(a);
    const bitsB = fieldToBits(b);
    return bhp256.hash([...bitsA, ...bitsB]);
}
/**
 * Deterministic Secret (NO CIRCULAR DEPENDENCY)
 *
 * secret = hash2(address_field, salt_field)
 *
 * ✔ No refresh loss
 * ✔ No storage required
 * ✔ Unique per wallet
 * ✔ Unique per distribution (via salt)
 */
export function generateDeterministicSecret(address) {
    const addressField = Field.fromString(address);
    const saltField = Field.fromString(`${DISTRIBUTION_SALT}field`);
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
 * Optional helper for debugging
 * nullifier = hash2(secret, merkle_root)
 * Matches Leo exactly.
 */
export function computeNullifier(secret, merkleRoot) {
    const rootField = Field.fromString(`${merkleRoot}field`);
    return computeHash2(secret, rootField);
}
/**
 * Convert string -> Field safely
 */
export function toField(value) {
    return Field.fromString(`${value}field`);
}
/**
 * Format claim inputs for ProgramManager.execute
 */
export function formatClaimInputs(params) {
    return [
        `${params.merkleRoot}field`,
        `${params.payout}u64`,
        params.secret.toString(),
        `${params.s1}field`,
        `${params.s2}field`,
        `${params.s3}field`,
        params.d1,
        params.d2,
        params.d3,
    ];
}
