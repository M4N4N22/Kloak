Here is the updated **README.md**. I have overhauled it to reflect the specific **Merkle-tree-based distribution** architecture, the **deterministic secret derivation**, and the **real-time transaction polling** logic we implemented.

---

# Kloak Distribution

A privacy-preserving asset distribution system built on the Aleo blockchain. Kloak allows organizations to distribute grants or tokens using **Zero-Knowledge Merkle Inclusion Proofs**, ensuring that users can claim their assets without ever revealing their identity or wallet address to the public ledger.

**[Watch Technical Demo](https://youtu.be/NLh_GkFCUuE)**

## (Core) Innovation: The Privacy Loop

Unlike standard airdrops where a list of eligible addresses is public, Kloak uses a three-stage "Shielded Claim" protocol:

1. **Identity Link**: Derive a private claim key from a public wallet.
2. **Commitment**: The system uses a Merkle Tree of *hashes*, not addresses.
3. **Nullification**: A ZK-proof proves you are in the tree and generates a unique "nullifier" to prevent double-claiming, without revealing which leaf you belong to.

---

## Architecture Overview

### 1. Aleo Program (`kloak_distribution_v1.aleo`)

The on-chain arbiter. It doesn't store addresses; it stores a **Merkle Root** and a mapping of **spent nullifiers**.

* **`claim`**: The primary transition. It verifies a BHP256 Merkle proof and ensures the nullifier hasn't been used.
* **`nullifiers` mapping**: A persistent on-chain state that prevents double-spending while maintaining 100% anonymity.

### 2. Next.js Protocol Interface

A guided, step-by-step dashboard designed for high-stakes execution.

* **Deterministic Derivation**: Uses `BHP256` to create a private secret from the user's signature.
* **Local Proving**: Proofs are generated locally in the browser using the Aleo SDK/Shield Wallet, ensuring "Secret" inputs never touch a server.
* **On-Chain Polling**: A robust synchronization layer that tracks transactions from "Broadcast" to "Finalized" status.

---

## Smart Contract Logic

### Merkle Verification Snippet

```leo
program kloak_distribution_v1.aleo {
    // Stores used nullifiers to prevent double-claiming
    mapping nullifiers: field => bool;

    async transition claim(
        merkle_root: field,
        payout: u64,
        secret: field,
        s1: field, s2: field, s3: field, // Merkle Siblings
        d1: bool, d2: bool, d3: bool    // Merkle Directions
    ) -> (Grant, Future) {
        // 1. Recompute private commitment
        let commitment: field = BHP256::hash_to_field(secret);
        
        // 2. Recompute leaf (Commitment + Payout)
        let leaf: field = BHP256::hash_to_field([commitment, payout as field]);

        // 3. Verify Merkle Path against Public Root
        let root: field = verify_merkle(leaf, s1, s2, s3, d1, d2, d3);
        assert_eq(root, merkle_root);

        // 4. Generate unique Nullifier (Secret + Root)
        let nullifier: field = BHP256::hash_to_field([secret, merkle_root]);

        return (Grant { owner: self.caller, amount: payout }, finalize_claim(nullifier));
    }
}

```

---

## Technical Stack

* **ZK-Logic**: Leo (Aleo's ZK-DSL)
* **Frontend**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS + Framer Motion (Protocol Steppers)
* **Wallet Interaction**: `@provablehq/aleo-wallet-adaptor`
* **Cryptography**: BHP256 Hashing for Merkle Trees

---

## The Protocol Flow

### Step 1: Identity Derivation

The user connects their **Shield Wallet**. The app derives a deterministic secret. This acts as the user's "Private Key" for the distribution.

### Step 2: Proof Generation

The client fetches a Merkle Proof (siblings/directions) from the Kloak API. The user’s browser then generates a ZK-SNARK proof that they know a secret which, when hashed, exists at a specific leaf in the Merkle Tree.

### Step 3: On-Chain Finalization

The proof is broadcast to the Aleo Network. The UI enters a **Polling State**, querying the node until the transaction status shifts from `Accepted` to `Finalized`.

---

## Setup & Installation

### Prerequisites

* [Leo Compiler](https://www.google.com/search?q=https://developer.aleo.org/leo/)
* [Shield Wallet Extension](https://www.google.com/search?q=https://www.shieldwallet.io/)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Build the Aleo Program
cd programs/kloak_distribution
leo build

# 3. Run the Development Server
npm run dev

```

### Configuration

Update your `.env.local` with your deployment details:

```env
NEXT_PUBLIC_PROGRAM_ID=kloak_distribution_v1.aleo
NEXT_PUBLIC_NETWORK=testnet

```

---

## Security & Privacy Guarantees

* **Zero-Knowledge**: The Aleo miner sees a valid proof but **cannot** see which user claimed which grant.
* **Sybil Resistance**: Each secret can only generate one valid nullifier per Merkle Root.
* **Non-Custodial**: Kloak never holds user funds or private keys. The derivation happens entirely client-side.

---

## Roadmap

* [x] BHP256 Merkle Proof Implementation
* [x] Deterministic Secret Derivation UI
* [x] Real-time Transaction Status Polling
* [ ] Multi-sig Distribution Creation Dashboard
* [ ] Support for dynamic Merkle Tree updates (Sub-trees)

## License

MIT - Created for the Aleo Ecosystem.
