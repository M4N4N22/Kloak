import { Field, BHP256 } from "@provablehq/sdk";

/**
 * Single reusable BHP256 instance.
 * Using the standard "AleoBHP256" domain to match Leo's internal defaults.
 */
const bhp256 = new BHP256;

/**
 * IMPORTANT:
 * Changing this creates a new distribution.
 */
const DISTRIBUTION_SALT = "kloak_grant_001";

/**
 * CORE HELPER: 253-bit Truncation
 * Aleo fields have a capacity of 253 bits. 
 * Leo's _raw functions hash exactly these 253 bits.
 */
function toLeoBits(field: Field): boolean[] {
  return field.toBitsLe().slice(0, 253);
}

/**
 * Convert arbitrary string -> Field
 * Used for the salt and wallet mapping.
 */
function stringToField(str: string): Field {
  const bytes = new TextEncoder().encode(str);
  const bits: boolean[] = [];
  for (const byte of bytes) {
    for (let i = 0; i < 8; i++) {
      bits.push(((byte >> i) & 1) === 1);
    }
  }
  // Standard BHP hash of raw string bits
  return bhp256.hash(bits);
}

/**
 * Matches Leo: BHP256::hash_to_field_raw(a)
 */
export function computeCommitment(secret: Field): Field {
  return bhp256.hash(toLeoBits(secret));
}

/**
 * Matches Leo: BHP256::hash_to_field_raw([a, b])
 * Concatenates two 253-bit chunks into one 506-bit input.
 */
export function computeHash2(a: Field, b: Field): Field {
  return bhp256.hash([
    ...toLeoBits(a),
    ...toLeoBits(b),
  ]);
}

/**
 * Deterministic Secret
 * secret = hash2(address_field, salt_field)
 */
export function generateDeterministicSecret(address: string): Field {
  const addressField = stringToField(address);
  const saltField = stringToField(DISTRIBUTION_SALT);

  return computeHash2(addressField, saltField);
}

/**
 * leaf = hash2(commitment, payout)
 */
export function computeLeaf(commitment: Field, payout: string): Field {
  const payoutField = Field.fromString(`${payout}field`);
  return computeHash2(commitment, payoutField);
}

/**
 * nullifier = hash2(secret, merkle_root)
 */
export function computeNullifier(secret: Field, merkleRoot: string): Field {
  const rootField = Field.fromString(merkleRoot.endsWith("field") ? merkleRoot : `${merkleRoot}field`);
  return computeHash2(secret, rootField);
}

/**
 * Convert string -> Field safely
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
    params.merkleRoot.endsWith("field") ? params.merkleRoot : `${params.merkleRoot}field`,
    `${params.payout}u64`,
    params.secret.toString(),
    params.s1.endsWith("field") ? params.s1 : `${params.s1}field`,
    params.s2.endsWith("field") ? params.s2 : `${params.s2}field`,
    params.s3.endsWith("field") ? params.s3 : `${params.s3}field`,
    params.d1.toString(),
    params.d2.toString(),
    params.d3.toString(),
  ];
}