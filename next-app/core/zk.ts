/**
 * Single internal variable to hold the SDK and BHP instance
 * initialized lazily to avoid top-level WASM errors.
 */
let sdkCache: any = null;
let bhp256: any = null;

async function initSDK() {
  if (sdkCache && bhp256) return { sdk: sdkCache, bhp: bhp256 };

  const sdk = await import("@provablehq/sdk");
  sdkCache = sdk;
  bhp256 = new sdk.BHP256();

  return { sdk, bhp: bhp256 };
}

/**
 * CORE HELPER: 253-bit Truncation
 * Hydrates the field to ensure prototype methods are attached.
 */
/**
 * CORE HELPER: 253-bit Truncation
 * Hydrates the field safely and handles potential string parsing errors.
 */
async function toLeoBits(field: any): Promise<boolean[]> {
  if (field instanceof Promise) {
    throw new Error("Logic Error: A Promise was passed to toLeoBits instead of a Field object. Ensure you are using 'await' before calling this function.");
  }

  if (!field) throw new Error("Field is undefined in toLeoBits");


  const { sdk } = await initSDK();

  let hydratedField: any;

  // Try to determine if the object has the method, or needs hydration
  if (typeof field.toBitsLe === 'function') {
    hydratedField = field;
  } else if (typeof field.to_bits_le === 'function') {
    hydratedField = field;
  } else {
    // 1. Convert to string and clean it up
    let fieldStr = typeof field === 'string' ? field : field.toString();

    // Check if it's a valid Aleo Field string (ends in 'field')
    // If it's "[object Object]", this is where it failed before
    if (fieldStr === "[object Object]" || !fieldStr || fieldStr.length < 5) {
      console.error("Invalid field detected:", field);
      throw new Error("Cannot hydrate field: Object is not a valid Aleo field representation.");
    }

    // 2. Ensure the string is formatted for the parser
    if (!fieldStr.endsWith("field")) {
      fieldStr = `${fieldStr}field`;
    }

    try {
      hydratedField = sdk.Field.fromString(fieldStr);
    } catch (e) {
      console.error("SDK failed to parse string:", fieldStr);
      throw new Error(`Failed to parse string into Field: ${fieldStr}`);
    }
  }

  const bits = typeof hydratedField.toBitsLe === 'function'
    ? hydratedField.toBitsLe()
    : hydratedField.to_bits_le();

  return bits.slice(0, 253);
}

/**
 * Convert arbitrary string -> Field
 */
export async function stringToField(str: string): Promise<any> {
  const { bhp } = await initSDK();
  const bytes = new TextEncoder().encode(str);
  const bits: boolean[] = [];
  for (const byte of bytes) {
    for (let i = 0; i < 8; i++) {
      bits.push(((byte >> i) & 1) === 1);
    }
  }
  return bhp.hash(bits);
}

/**
 * Matches Leo: BHP256::hash_to_field_raw(a)
 */
export async function computeCommitment(secret: any): Promise<any> {
  const { bhp } = await initSDK();
  
  // Resolve secret in case it was passed as a Promise
  const resolvedSecret = await secret;
  
  const bits = await toLeoBits(resolvedSecret);
  return bhp.hash(bits);
}

/**
 * Matches Leo: BHP256::hash_to_field_raw([a, b])
 */
export async function computeHash2(a: any, b: any): Promise<any> {
  const { bhp } = await initSDK();

  // SECONDARY SAFETY: Resolve a and b in case they were passed as Promises
  const resolvedA = await a;
  const resolvedB = await b;

  const bitsA = await toLeoBits(resolvedA); 
  const bitsB = await toLeoBits(resolvedB); 

  return bhp.hash([
    ...bitsA,
    ...bitsB,
  ]);
}

/**
 * Deterministic Secret
 */
export async function generateDeterministicSecret(address: string, campaignSalt: string): Promise<any> {
  const addressField = await stringToField(address);
  const saltField = await stringToField(campaignSalt);

  return computeHash2(addressField, saltField);
}

/**
 * leaf = hash2(commitment, payout)
 */
export async function computeLeaf(commitment: any, payout: string): Promise<any> {
  const { sdk } = await initSDK();
  // Ensure payout is treated as a clean integer string
  const cleanPayout = Math.floor(Number(payout)).toString();
  const payoutField = sdk.Field.fromString(`${cleanPayout}field`);
  return computeHash2(commitment, payoutField);
}

/**
 * Nullifier Generation
 * ALIGNED WITH LEO: nullifier = hash2(secret, campaign_id)
 */
export async function computeNullifier(secret: any, campaignId: string): Promise<any> {
  const { sdk } = await initSDK();
  // Clean up potential spaces or quotes from the ID
  const cleanId = campaignId.trim().replace(/['"]/g, '');
  const idField = sdk.Field.fromString(cleanId.endsWith("field") ? cleanId : `${cleanId}field`);
  return computeHash2(secret, idField);
}

/**
 * Formats inputs specifically for the `claim_distribution` transition in Leo.
 */
export function formatClaimInputs(params: {
  campaignId: string;
  campaignRoot: string;
  payout: string;
  secret: any; // Field
  proof: {
    s: string[]; // Path siblings [s1...s10]
    d: boolean[]; // Path directions [d1...d10]
  };
}) {
  const inputs = [
    params.campaignId.endsWith("field") ? params.campaignId : `${params.campaignId}field`,
    params.campaignRoot.endsWith("field") ? params.campaignRoot : `${params.campaignRoot}field`,
    `${params.payout}u64`,
    params.secret.toString(),
  ];

  params.proof.s.forEach(sibling => {
    inputs.push(sibling.endsWith("field") ? sibling : `${sibling}field`);
  });

  params.proof.d.forEach(direction => {
    inputs.push(direction.toString());
  });

  return inputs;
}