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
function fieldToBits(field: Field): boolean[] {
  return field.toBitsLe();
}

/**
 * Convert bytes -> little endian bit array
 */
function bytesToBits(bytes: Uint8Array): boolean[] {
  const bits: boolean[] = [];

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
function stringToField(str: string): Field {
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
function fieldToCanonicalBits(field: Field): boolean[] {
  return bytesToBits(field.toBytesLe());
}

export function computeCommitment(secret: Field): Field {
  return bhp256.hash(fieldToCanonicalBits(secret));
}

export function computeHash2(a: Field, b: Field): Field {
  return bhp256.hash([
    ...fieldToCanonicalBits(a),
    ...fieldToCanonicalBits(b),
  ]);
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
export function generateDeterministicSecret(
  address: string
): Field {
  const addressField = stringToField(address);
  const saltField = stringToField(DISTRIBUTION_SALT);

  return computeHash2(addressField, saltField);
}

/**
 * leaf = hash2(commitment, payout)
 * Matches Leo:
 * leaf = hash2(hash1(secret), payout as field)
 */
export function computeLeaf(
  commitment: Field,
  payout: string
): Field {
  const payoutField = Field.fromString(`${payout}field`);
  return computeHash2(commitment, payoutField);
}

/**
 * nullifier = hash2(secret, merkle_root)
 * Matches Leo exactly.
 */
export function computeNullifier(
  secret: Field,
  merkleRoot: string
): Field {
const rootField = Field.fromString(merkleRoot);
  return computeHash2(secret, rootField);
}

/**
 * Convert string -> Field safely
 * (exposed helper if needed elsewhere)
 */
export function toField(value: string): Field {
  return stringToField(value);
}

/**
 * Format claim inputs for ProgramManager.execute
 */
export function formatClaimInputs(params: {
  merkleRoot: string;
  payout: string;
  secret: Field;
  s1: string;
  s2: string;
  s3: string;
  d1: boolean;
  d2: boolean;
  d3: boolean;
}) {
  return [
    params.merkleRoot,                 // already "Xfield"
    `${params.payout}u64`,
    params.secret.toString(),          // "Xfield"
    params.s1,                         // already field string
    params.s2,
    params.s3,
    params.d1,
    params.d2,
    params.d3,
  ];
}