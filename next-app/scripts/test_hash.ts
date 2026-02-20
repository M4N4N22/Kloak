import { Field, BHP256 } from "@provablehq/sdk";

const bhp256 = new BHP256();

/**
 * Leo-Compatible Bit Truncation
 * Leo's BHP256::hash_to_field([a, b]) concatenates the 253-bit 
 * representations of the fields.
 */
function toLeoBits(field: Field): boolean[] {
  // We slice at 253 to remove the padding bits
  return field.toBitsLe().slice(0, 253);
}

export function verifySync(secretStr: string, payoutU64: number) {
  const secret = Field.fromString(secretStr);
  const payoutField = Field.fromString(`${payoutU64}field`);

  // Compute Hash1 (Commitment)
  const commitment = bhp256.hash(toLeoBits(secret));
  
  // Compute Hash2 (Leaf)
  const leaf = bhp256.hash([
    ...toLeoBits(commitment),
    ...toLeoBits(payoutField)
  ]);

  console.log("--- SDK Verification Results ---");
  console.log("Secret:    ", secret.toString());
  console.log("Commitment:", commitment.toString());
  console.log("Leaf:      ", leaf.toString());
}

// Run test with dummy data
verifySync("12345field", 1000);