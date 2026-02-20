// scripts/demo.ts
import { generateDeterministicSecret, computeCommitment, computeLeaf, } from "../core/zk.js";
import { buildMerkleTree } from "../core/merkle.js";
const demoEligible = [
    { address: "1field", payout: "1000000" },
    { address: "2field", payout: "2000000" },
    { address: "3field", payout: "3000000" },
];
function main() {
    const leaves = demoEligible.map((user, index) => {
        const secret = generateDeterministicSecret(user.address);
        const commitment = computeCommitment(secret);
        const leaf = computeLeaf(commitment, user.payout);
        console.log(`User ${index}`);
        console.log("  Secret:", secret.toString());
        console.log("  Commitment:", commitment.toString());
        console.log("  Leaf:", leaf.toString());
        console.log("");
        return leaf;
    });
    const tree = buildMerkleTree(leaves);
    console.log("Merkle Root:");
    console.log(tree.root.toString());
}
main();
