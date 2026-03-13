import credits.aleo;

program kloak_protocol_v5.aleo {

    @noupgrade
    async constructor() {}

    // --------------------------------------
    // MAPPINGS
    // --------------------------------------

    mapping nullifiers: field => bool;

    mapping campaigns: field => Campaign;

    mapping campaign_claimed: field => u64;

    mapping payment_requests: field => PaymentRequest;

    mapping campaign_pool: field => u64;

    mapping campaign_creator: field => address;

    // --------------------------------------
    // STRUCTS
    // --------------------------------------

    struct Campaign {
        creator: address,
        merkle_root: field,
        asset: u8,
        total_budget: u64,
        active: bool
    }

    struct PaymentRequest {
        merchant: address,
        asset: u8,
        amount: u64,
        open_amount: bool,
        active: bool
    }

    struct KloakMerkleProof {
    s1: field,
    s2: field,
    s3: field,
    s4: field,
    s5: field,
    s6: field,
    s7: field,
    s8: field,
    s9: field,
    s10: field,

    d1: bool,
    d2: bool,
    d3: bool,
    d4: bool,
    d5: bool,
    d6: bool,
    d7: bool,
    d8: bool,
    d9: bool,
    d10: bool
}

    // --------------------------------------
    // RECORD TYPES
    // --------------------------------------

    record GrantRecord {
        owner: address,
        campaign_id: field,
        amount: u64
    }

    record PaymentReceipt {
        owner: address,
        amount: u64,
        reference: field
    }

    record PaymentRequestReceipt {
        owner: address,
        request_id: field,
        amount: u64
    }

    // --------------------------------------
// CAMPAIGN CREATION
// --------------------------------------

async transition create_campaign(
    campaign_id: field,
    merkle_root: field,
    asset: u8,
    total_budget: u64
) -> Future {

    let creator: address = self.caller;

    return finalize_create_campaign(
        campaign_id,
        creator,
        merkle_root,
        asset,
        total_budget
    );
}

async function finalize_create_campaign(
    campaign_id: field,
    creator: address,
    merkle_root: field,
    asset: u8,
    total_budget: u64
) {

    let campaign: Campaign = Campaign {
        creator: creator,
        merkle_root: merkle_root,
        asset: asset,
        total_budget: total_budget,
        active: true
    };

    campaigns.set(campaign_id, campaign);
}

////////////////////////////////////////////////////////
// DEPOSIT CAMPAIGN FUNDS
////////////////////////////////////////////////////////

async transition deposit_campaign_funds(
    campaign_id: field,
    amount: u64
) -> Future {

    // transfer from creator PUBLIC → program PUBLIC
    let f: Future = credits.aleo/transfer_public_as_signer(self.address, amount);

    return finalize_deposit(f, campaign_id, self.caller, amount);
}

async function finalize_deposit(
    f: Future,
    campaign_id: field,
    caller: address,
    amount: u64
) {

    f.await();

    let campaign: Campaign = campaigns.get(campaign_id);
    assert_eq(campaign.creator, caller);

    let pool: u64 = campaign_pool.get_or_use(campaign_id, 0u64);
    campaign_pool.set(campaign_id, pool + amount);
}

////////////////////////////////////////////////////////
// CLAIM DISTRIBUTION (PUBLIC ESCROW → PRIVATE PAYOUT)
////////////////////////////////////////////////////////

async transition claim_distribution(

    campaign_id: field,
    campaign_root: field,
    payout: u64,
    secret: field,
    proof: KloakMerkleProof

) -> (credits.aleo/credits, GrantRecord, PaymentReceipt, Future) {

    // --------------------------------------
    // 1. commitment
    // --------------------------------------

    let commitment: field = hash1(secret);

    // --------------------------------------
    // 2. leaf
    // --------------------------------------

    let leaf: field = hash2(commitment, payout as field);

    // --------------------------------------
    // 3. verify merkle proof
    // --------------------------------------

    let root: field = verify_merkle(
        leaf,
        proof.s1, proof.s2, proof.s3, proof.s4, proof.s5,
        proof.s6, proof.s7, proof.s8, proof.s9, proof.s10,
        proof.d1, proof.d2, proof.d3, proof.d4, proof.d5,
        proof.d6, proof.d7, proof.d8, proof.d9, proof.d10
    );

    assert_eq(root, campaign_root);

    // --------------------------------------
    // 4. compute nullifier
    // --------------------------------------

    let nullifier: field = hash2(secret, campaign_id);

    // --------------------------------------
    // 5. transfer PUBLIC → PRIVATE
    // --------------------------------------

    let (reward_record, payout_future) =
        credits.aleo/transfer_public_to_private(self.caller, payout);

    // --------------------------------------
    // 6. grant record
    // --------------------------------------

    let grant: GrantRecord = GrantRecord {
        owner: self.caller,
        campaign_id: campaign_id,
        amount: payout
    };

    // --------------------------------------
    // 7. receipt
    // --------------------------------------

    let receipt: PaymentReceipt = PaymentReceipt {
        owner: self.caller,
        amount: payout,
        reference: campaign_id
    };

    return (
        reward_record,
        grant,
        receipt,
        finalize_claim(
            payout_future,
            nullifier,
            campaign_id,
            payout,
            campaign_root
        )
    );
}

////////////////////////////////////////////////////////
// FINALIZE CLAIM
////////////////////////////////////////////////////////

async function finalize_claim(
    payout_future: Future,
    nullifier: field,
    campaign_id: field,
    payout: u64,
    campaign_root: field
) {

    payout_future.await();

    // prevent double claim
    let used: bool = nullifiers.contains(nullifier);
    assert(!used);

    let campaign: Campaign = campaigns.get(campaign_id);

    assert(campaign.active);
    assert_eq(campaign.merkle_root, campaign_root);

    // pool check
    let pool: u64 = campaign_pool.get_or_use(campaign_id, 0u64);
    assert(pool >= payout);

    campaign_pool.set(campaign_id, pool - payout);

    // claimed stats
    let claimed: u64 = campaign_claimed.get_or_use(campaign_id, 0u64);
    assert(claimed + payout <= campaign.total_budget);

    campaign_claimed.set(campaign_id, claimed + payout);

    nullifiers.set(nullifier, true);
}
    /// --------------------------------------
// PRIVATE PAYMENT
// --------------------------------------

transition send_private_payment(
    credits: credits.aleo/credits,
    recipient: address,
    amount: u64
) -> (credits.aleo/credits, PaymentReceipt) {

    let (change, sent) =
        credits.aleo/transfer_private(credits, recipient, amount);

    let receipt: PaymentReceipt = PaymentReceipt {
        owner: recipient,
        amount: amount,
        reference: 0field
    };

    return (change, receipt);
}


// --------------------------------------
// PAYMENT REQUESTS
// --------------------------------------

async transition create_payment_request(
    request_id: field,
    asset: u8,
    amount: u64,
    open_amount: bool
) -> Future {

    let merchant: address = self.caller;

    return finalize_create_payment_request(
        request_id,
        merchant,
        asset,
        amount,
        open_amount
    );
}


async function finalize_create_payment_request(
    request_id: field,
    merchant: address,
    asset: u8,
    amount: u64,
    open_amount: bool
) {

    let req: PaymentRequest = PaymentRequest {
        merchant: merchant,
        asset: asset,
        amount: amount,
        open_amount: open_amount,
        active: true
    };

    payment_requests.set(request_id, req);
}


// --------------------------------------
// PAY REQUEST
// --------------------------------------

async transition pay_request(
    credits: credits.aleo/credits,
    request_id: field,
    amount: u64
) -> (credits.aleo/credits, PaymentRequestReceipt, Future) {

    // Transfer immediately
    let (change, sent) =
        credits.aleo/transfer_private(credits, self.caller, amount);

    let receipt: PaymentRequestReceipt = PaymentRequestReceipt {
        owner: self.caller,
        request_id: request_id,
        amount: amount
    };

    return (
        change,
        receipt,
        finalize_pay_request(request_id, amount)
    );
}


// --------------------------------------
// FINALIZE PAYMENT
// --------------------------------------

async function finalize_pay_request(
    request_id: field,
    amount: u64
) {

    let req: PaymentRequest = payment_requests.get(request_id);

    assert(req.active);

    if !req.open_amount {
        assert_eq(amount, req.amount);
    }

}

    // --------------------------------------
    // SELECTIVE DISCLOSURE
    // --------------------------------------

    transition prove_payment(
        receipt_secret: field
    ) -> field {

        return hash1(receipt_secret);
    }

    // --------------------------------------
    // MERKLE VERIFICATION (DEPTH 10)
    // --------------------------------------

    // Add this to your program for testing
transition test_merkle_alignment(
    secret: field,
    payout: u64,
    proof: KloakMerkleProof
) -> field {
    // 1. Replicate leaf creation logic
    let commitment: field = hash1(secret);
    let leaf: field = hash2(commitment, payout as field);

    // 2. Call the inline function using struct members
    return verify_merkle(
        leaf, 
        proof.s1, proof.s2, proof.s3, proof.s4, proof.s5, 
        proof.s6, proof.s7, proof.s8, proof.s9, proof.s10,
        proof.d1, proof.d2, proof.d3, proof.d4, proof.d5,
        proof.d6, proof.d7, proof.d8, proof.d9, proof.d10
    );
}

    inline verify_merkle(
        leaf: field,

        s1: field, s2: field, s3: field, s4: field, s5: field,
        s6: field, s7: field, s8: field, s9: field, s10: field,

        d1: bool, d2: bool, d3: bool, d4: bool, d5: bool,
        d6: bool, d7: bool, d8: bool, d9: bool, d10: bool

    ) -> field {

        let h1: field = hash_step(leaf, s1, d1);
        let h2: field = hash_step(h1, s2, d2);
        let h3: field = hash_step(h2, s3, d3);
        let h4: field = hash_step(h3, s4, d4);
        let h5: field = hash_step(h4, s5, d5);
        let h6: field = hash_step(h5, s6, d6);
        let h7: field = hash_step(h6, s7, d7);
        let h8: field = hash_step(h7, s8, d8);
        let h9: field = hash_step(h8, s9, d9);
        let h10: field = hash_step(h9, s10, d10);

        return h10;
    }

    inline hash_step(a: field, b: field, dir: bool) -> field {

        let left: field = dir ? b : a;
        let right: field = dir ? a : b;

        return hash2(left, right);
    }

    inline hash1(a: field) -> field {
        return BHP256::hash_to_field_raw(a);
    }

    inline hash2(a: field, b: field) -> field {
        return BHP256::hash_to_field_raw([a,b]);
    }
}