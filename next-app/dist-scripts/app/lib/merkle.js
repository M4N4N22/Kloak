// lib/merkle.ts
import { Field } from "@provablehq/sdk";
import { computeHash2 } from "./zk";
const TREE_DEPTH = 3;
const MAX_LEAVES = 2 ** TREE_DEPTH;
const ZERO_LEAF = Field.fromString("0field");
export function buildMerkleTree(initialLeaves) {
    if (initialLeaves.length > MAX_LEAVES) {
        throw new Error("Too many leaves for depth-3 tree");
    }
    // Pad to 8 leaves
    const leaves = [...initialLeaves];
    while (leaves.length < MAX_LEAVES) {
        leaves.push(ZERO_LEAF);
    }
    // Level 1 (8 → 4)
    const level1 = [];
    for (let i = 0; i < 8; i += 2) {
        level1.push(computeHash2(leaves[i], leaves[i + 1]));
    }
    // Level 2 (4 → 2)
    const level2 = [];
    for (let i = 0; i < 4; i += 2) {
        level2.push(computeHash2(level1[i], level1[i + 1]));
    }
    // Root (2 → 1)
    const root = computeHash2(level2[0], level2[1]);
    return {
        leaves,
        level1,
        level2,
        root,
    };
}
