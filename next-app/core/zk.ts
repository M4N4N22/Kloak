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

async function toLeoBits(field: any): Promise<boolean[]> {
  if (field instanceof Promise) {
    throw new Error("Logic Error: A Promise was passed to toLeoBits instead of a Field object. Ensure you are using 'await' before calling this function.");
  }

  if (!field) throw new Error("Field is undefined in toLeoBits");

  const { sdk } = await initSDK();

  let hydratedField: any;

  if (typeof field.toBitsLe === 'function') {
    hydratedField = field;
  } else if (typeof field.to_bits_le === 'function') {
    hydratedField = field;
  } else {
    let fieldStr = typeof field === 'string' ? field : field.toString();

    if (fieldStr === "[object Object]" || !fieldStr || fieldStr.length < 5) {
      console.error("Invalid field detected:", field);
      throw new Error("Cannot hydrate field: Object is not a valid Aleo field representation.");
    }

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

async function addressToLeoBits(address: string): Promise<boolean[]> {
  const { sdk } = await initSDK();
  const normalized = address.trim();
  const addressObj = sdk.Address.from_string(normalized);
  const bits = addressObj.toBitsLe();
  return bits.slice(0, 253);
}

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

export async function computeCommitment(secret: any): Promise<any> {
  const { bhp } = await initSDK();
  const resolvedSecret = await secret;
  const bits = await toLeoBits(resolvedSecret);
  return bhp.hash(bits);
}

export async function computeHash2(a: any, b: any): Promise<any> {
  const { bhp } = await initSDK();
  const resolvedA = await a;
  const resolvedB = await b;

  const bitsA = await toLeoBits(resolvedA);
  const bitsB = await toLeoBits(resolvedB);

  return bhp.hash([
    ...bitsA,
    ...bitsB,
  ]);
}

export async function generateDeterministicSecret(address: string, campaignSalt: string): Promise<any> {
  const addressField = await stringToField(address);
  const saltField = await stringToField(campaignSalt);

  return computeHash2(addressField, saltField);
}

export async function computeLeaf(commitment: any, payout: string): Promise<any> {
  const { sdk } = await initSDK();
  const cleanPayout = Math.floor(Number(payout)).toString();
  const payoutField = sdk.Field.fromString(`${cleanPayout}field`);
  return computeHash2(commitment, payoutField);
}

export async function computeNullifier(secret: any, campaignId: string): Promise<any> {
  const { sdk } = await initSDK();
  const cleanId = campaignId.trim().replace(/["']/g, '');
  const idField = sdk.Field.fromString(cleanId.endsWith("field") ? cleanId : `${cleanId}field`);
  return computeHash2(secret, idField);
}

export async function computePaymentCommitment(
  requestId: string,
  amountMicro: string,
  payer: string,
  merchant: string,
  timestamp: string | number,
  secret: string,
): Promise<string> {
  const { sdk, bhp } = await initSDK();
  const requestField = sdk.Field.fromString(requestId.endsWith("field") ? requestId : `${requestId}field`);
  const amountField = sdk.Field.fromString(`${String(amountMicro).replace(/u64$|u128$|field$/g, "")}field`);
  const requestAmountHash = await computeHash2(requestField, amountField);
  const payerField = bhp.hash(await addressToLeoBits(payer));
  const merchantField = bhp.hash(await addressToLeoBits(merchant));
  const actorsHash = await computeHash2(payerField, merchantField);
  const contextHash = await computeHash2(
    sdk.Field.fromString(`${String(timestamp).replace(/u64$|u128$|field$/g, "")}field`),
    sdk.Field.fromString(secret.endsWith("field") ? secret : `${secret}field`)
  );
  const requestActorsHash = await computeHash2(requestAmountHash, actorsHash);
  const commitment = await computeHash2(requestActorsHash, contextHash);
  return commitment.toString();
}

export async function computePaymentNullifier(secret: string, proofType: number, amountBound = 0, timestampFrom = 0, timestampTo = 0): Promise<string> {
  const { sdk } = await initSDK();
  const publicStatementHash = await computeHash2(
    await computeHash2(
      sdk.Field.fromString(`${String(proofType).replace(/u64$|u128$|field$/g, "")}field`),
      sdk.Field.fromString(`${String(amountBound).replace(/u64$|u128$|field$/g, "")}field`),
    ),
    await computeHash2(
      sdk.Field.fromString(`${String(timestampFrom).replace(/u64$|u128$|field$/g, "")}field`),
      sdk.Field.fromString(`${String(timestampTo).replace(/u64$|u128$|field$/g, "")}field`),
    ),
  );
  return computeHash2(
    sdk.Field.fromString(secret.endsWith("field") ? secret : `${secret}field`),
    publicStatementHash,
  ).then((value) => value.toString());
}

export function formatClaimInputs(params: {
  campaignId: string;
  campaignRoot: string;
  payout: string;
  secret: any;
  proof: {
    s: string[];
    d: boolean[];
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
