import { NextResponse } from "next/server";
import {
  generateDeterministicSecret,
  computeCommitment,
  computeLeaf,
} from "@/core/zk";
import { buildMerkleTree, generateProof } from "@/core/merkle";

type EligibleUser = {
  address: string;
  payout: string;
};

const demoEligible: EligibleUser[] = [
  { address: "1field", payout: "1000000" },
  { address: "2field", payout: "2000000" },
  { address: "3field", payout: "3000000" },
];

export async function POST(req: Request) {
  const { address } = await req.json();

  console.log("--------------------------------------------------");
  console.log("Incoming claim request for address:", address);

  const index = demoEligible.findIndex(u => u.address === address);

  if (index === -1) {
    console.log("Address not eligible");
    return NextResponse.json(
      { error: "Not eligible" },
      { status: 403 }
    );
  }

  console.log("Eligible index:", index);

  // Build leaves with detailed logs
  const leaves = demoEligible.map((user, i) => {
    const secret = generateDeterministicSecret(user.address);
    const commitment = computeCommitment(secret);
    const leaf = computeLeaf(commitment, user.payout);

    console.log(`User ${i}`);
    console.log("  Address:     ", user.address);
    console.log("  Secret:      ", secret.toString());
    console.log("  Commitment:  ", commitment.toString());
    console.log("  Leaf:        ", leaf.toString());

    return leaf;
  });

  const tree = buildMerkleTree(leaves);
  

  console.log("Merkle Root:", tree.root.toString());

  const proof = generateProof(tree, index);

  console.log("Proof for index", index);
  console.log("  s1:", proof.s1.toString());
  console.log("  s2:", proof.s2.toString());
  console.log("  s3:", proof.s3.toString());
  console.log("  d1:", proof.d1);
  console.log("  d2:", proof.d2);
  console.log("  d3:", proof.d3);
  console.log("--------------------------------------------------");

  return NextResponse.json({
    merkleRoot: tree.root.toString(),
    payout: demoEligible[index].payout,
    proof: {
      s1: proof.s1.toString(),
      s2: proof.s2.toString(),
      s3: proof.s3.toString(),
      d1: proof.d1,
      d2: proof.d2,
      d3: proof.d3,
    },
  });
}