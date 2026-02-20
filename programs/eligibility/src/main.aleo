program kloak_distribution_v1.aleo {

    @noupgrade
    async constructor() {}

    mapping nullifiers: field => bool;

    record Grant {
        owner: address,
        amount: u64,
    }

    async transition claim(
        merkle_root: field,
        payout: u64,
        secret: field,
        s1: field,
        s2: field,
        s3: field,
        d1: bool,
        d2: bool,
        d3: bool
    ) -> (Grant, Future) {

        // 1. Recompute commitment (secret -> field)
        let commitment: field = hash1(secret);

        // 2. Recompute leaf (casting u64 payout to field)
        let leaf: field = hash2(commitment, payout as field);

        // 3. Verify Merkle proof
        let root: field = verify_merkle(leaf, s1, s2, s3, d1, d2, d3);
        assert_eq(root, merkle_root);

        // 4. Derive nullifier to prevent double-claiming
        let nullifier: field = hash2(secret, merkle_root);

        let g: Grant = Grant {
            owner: self.caller,
            amount: payout,
        };

        return (g, finalize_claim(nullifier));
    }

    async function finalize_claim(nullifier: field) {
        let used: bool = nullifiers.contains(nullifier);
        assert(!used);

        nullifiers.set(nullifier, true);
    }

    // --- Helper Functions ---

    inline verify_merkle(
        leaf: field,
        s1: field,
        s2: field,
        s3: field,
        d1: bool,
        d2: bool,
        d3: bool
    ) -> field {
        let left1: field = d1 ? s1 : leaf;
        let right1: field = d1 ? leaf : s1;
        let h1: field = hash2(left1, right1);

        let left2: field = d2 ? s2 : h1;
        let right2: field = d2 ? h1 : s2;
        let h2: field = hash2(left2, right2);

        let left3: field = d3 ? s3 : h2;
        let right3: field = d3 ? h2 : s3;

        return hash2(left3, right3);
    }

    inline hash1(a: field) -> field {
        // Use _raw to ensure metadata bits are not included
        return BHP256::hash_to_field_raw(a);
    }

    inline hash2(a: field, b: field) -> field {
        // Use _raw to match simple bit concatenation in SDK
        return BHP256::hash_to_field_raw([a, b]);
    }

    transition debug_hash(secret: field, payout: u64) -> (field, field) {
        let commitment: field = hash1(secret);
        let leaf: field = hash2(commitment, payout as field);
        return (commitment, leaf);
    }

    transition debug_merkle(
        leaf: field,
        s1: field,
        s2: field,
        s3: field,
        d1: bool,
        d2: bool,
        d3: bool
    ) -> field {
        return verify_merkle(leaf, s1, s2, s3, d1, d2, d3);
    }
}