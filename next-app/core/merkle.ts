// lib/merkle.ts

import { Field } from "@provablehq/sdk";
import { computeHash2 } from "./zk";

const TREE_DEPTH = 3;
const MAX_LEAVES = 2 ** TREE_DEPTH;
const ZERO_LEAF = Field.fromString("0field");

export function buildMerkleTree(initialLeaves: Field[]) {
  if (initialLeaves.length > MAX_LEAVES) {
    throw new Error("Too many leaves for depth-3 tree");
  }

  // Pad to 8 leaves
  const leaves: Field[] = [...initialLeaves];
  while (leaves.length < MAX_LEAVES) {
    leaves.push(ZERO_LEAF);
  }

  // Level 1 (8 → 4)
  const level1: Field[] = [];
  for (let i = 0; i < 8; i += 2) {
    level1.push(computeHash2(leaves[i], leaves[i + 1]));
  }

  // Level 2 (4 → 2)
  const level2: Field[] = [];
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

/**
 * Generate Merkle proof for a given leaf index (0–7)
 */
export function generateProof(
  tree: ReturnType<typeof buildMerkleTree>,
  index: number
) {
  const { leaves, level1, level2 } = tree;

  if (index < 0 || index > 7) {
    throw new Error("Invalid leaf index");
  }

  // --- Level 1 ---
  const isRight1 = index % 2 === 1;
  const siblingIndex1 = isRight1 ? index - 1 : index + 1;

  const s1 = leaves[siblingIndex1];
  const d1 = isRight1;

  // --- Level 2 ---
  const parentIndex = Math.floor(index / 2);
  const isRight2 = parentIndex % 2 === 1;
  const siblingIndex2 = isRight2 ? parentIndex - 1 : parentIndex + 1;

  const s2 = level1[siblingIndex2];
  const d2 = isRight2;

  // --- Level 3 ---
  const parentIndex2 = Math.floor(parentIndex / 2);
  const isRight3 = parentIndex2 % 2 === 1;
  const siblingIndex3 = isRight3 ? parentIndex2 - 1 : parentIndex2 + 1;

  const s3 = level2[siblingIndex3];
  const d3 = isRight3;

  return { s1, s2, s3, d1, d2, d3 };
}