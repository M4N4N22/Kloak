import { computeHash2, computeCommitment, computeLeaf } from "./zk";

// Depth 10 = 1024 max leaves
const TREE_DEPTH = 10;
const MAX_LEAVES = Math.pow(2, TREE_DEPTH);

/**
 * We initialize this lazily to avoid WASM issues on import
 */
let CACHED_ZERO_LEAF: any = null;

/**
 * Initializes the Zero Leaf and SDK components asynchronously.
 * Call this before buildMerkleTree if calling from a fresh environment.
 */
async function getZeroLeaf() {
  if (CACHED_ZERO_LEAF) return CACHED_ZERO_LEAF;

  const { Field } = await import("@provablehq/sdk");

  const EMPTY_SECRET = Field.fromString("0field");

  const EMPTY_COMMITMENT = await computeCommitment(EMPTY_SECRET);

  CACHED_ZERO_LEAF = await computeLeaf(EMPTY_COMMITMENT, "0");

  return CACHED_ZERO_LEAF;
}

/**
 * Build a Depth-10 Merkle Tree
 * Now async to allow for WASM Field initialization
 */
export async function buildMerkleTree(initialLeaves: any[]) {
  if (initialLeaves.length > MAX_LEAVES) {
    throw new Error(`Too many leaves`);
  }

  const ZERO_LEAF = await getZeroLeaf();

  const levels: any[][] = [];
  let currentLevel: any[] = [...initialLeaves];

  while (currentLevel.length < MAX_LEAVES) {
    currentLevel.push(ZERO_LEAF);
  }
  levels.push(currentLevel);

  // Iteratively hash levels
  for (let d = 0; d < TREE_DEPTH; d++) {
    const nextLevel: any[] = [];
    const processingLevel = levels[d];

    for (let i = 0; i < processingLevel.length; i += 2) {
      // CRITICAL FIX: Must await the hash calculation
      const combinedHash = await computeHash2(processingLevel[i], processingLevel[i + 1]);
      nextLevel.push(combinedHash);
    }
    levels.push(nextLevel);
  }

  return {
    levels,
    root: levels[TREE_DEPTH][0],
  };
}

/**
 * Generate Merkle proof for Depth 10
 */
export function generateProof(
  tree: { levels: any[][] },
  index: number
) {

  const s: string[] = []
  const d: boolean[] = []

  let currentIndex = index

  for (let level = 0; level < TREE_DEPTH; level++) {

    const levelNodes = tree.levels[level]

    const isRight = currentIndex % 2 === 1

    const siblingIndex = isRight
      ? currentIndex - 1
      : currentIndex + 1

    const sibling = levelNodes[siblingIndex]

    if (!sibling) {
      throw new Error(`Missing sibling at level ${level}`)
    }

    s.push(sibling.toString())

    d.push(isRight)

    currentIndex = Math.floor(currentIndex / 2)
  }

  return { s, d }
}