import credits.aleo;
import test_usdcx_stablecoin.aleo;
import test_usad_stablecoin.aleo;
program kloak_protocol_v10.aleo {

    @noupgrade
    constructor() {}

    // --------------------------------------
    // MAPPINGS
    // --------------------------------------

    mapping payment_commitments: field => bool;

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
        active: bool,
    }

    struct PaymentRequest {
        merchant: address,
        asset: u8,
        amount: u64,
        open_amount: bool,
        active: bool,
    }

    record PaymentReceipt {
        owner: address,
        amount: u64,
        reference: field,
    }

    record PaymentRequestReceipt {
        owner: address,
        counterparty: address,
        role: u8,
        payer: address,
        merchant: address,
        request_id: field,
        amount: u64,
        timestamp: u64,
        secret: field,
        commitment: field,
    }

    // --------------------------------------
    // PRIVATE PAYMENT
    // --------------------------------------

    fn send_private_payment_aleo(
        credits: credits.aleo::credits,
        recipient: address,
        amount: u64,
    ) -> (credits.aleo::credits, PaymentReceipt) {
        let (change, sent) = credits.aleo::transfer_private(credits, recipient, amount);

        let receipt: PaymentReceipt = PaymentReceipt {
            owner: recipient,
            amount: amount,
            reference: 0field,
        };

        return (change, receipt);
    }

    fn send_private_payment_usdcx(
        pay_record: test_usdcx_stablecoin.aleo::Token,
        recipient: address,
        amount: u128,
        proofs: [test_usdcx_stablecoin.aleo::MerkleProof; 2],
    ) -> (
        test_usdcx_stablecoin.aleo::Token,
        test_usdcx_stablecoin.aleo::Token,
        test_usdcx_stablecoin.aleo::ComplianceRecord,
        PaymentReceipt,
        Final,
    ) {
        let (compliance, out1, out2, f) = test_usdcx_stablecoin.aleo::transfer_private(
            recipient,
            amount,
            pay_record,
            proofs,
        );

        let receipt: PaymentReceipt = PaymentReceipt {
            owner: recipient,
            amount: amount as u64,
            reference: 0field,
        };

        return (
            out1,
            out2,
            compliance,
            receipt,
            final {
                f.run();
            },
        );
    }

    fn send_private_payment_usad(
        pay_record: test_usad_stablecoin.aleo::Token,
        recipient: address,
        amount: u128,
        proofs: [test_usad_stablecoin.aleo::MerkleProof; 2],
    ) -> (
        test_usad_stablecoin.aleo::Token,
        test_usad_stablecoin.aleo::Token,
        test_usad_stablecoin.aleo::ComplianceRecord,
        PaymentReceipt,
        Final,
    ) {
        let (compliance, out1, out2, f) = test_usad_stablecoin.aleo::transfer_private(
            recipient,
            amount,
            pay_record,
            proofs,
        );

        let receipt: PaymentReceipt = PaymentReceipt {
            owner: recipient,
            amount: amount as u64,
            reference: 0field,
        };

        return (
            out1,
            out2,
            compliance,
            receipt,
            final {
                f.run();
            },
        );
    }

    // --------------------------------------
    // PAYMENT REQUESTS
    // --------------------------------------

    fn create_payment_request(
        request_id: field,
        asset: u8,
        amount: u64,
        open_amount: bool,
    ) -> Final {
        let merchant: address = self.caller;

        return final {
            assert_valid_asset(asset);

            let req: PaymentRequest = PaymentRequest {
                merchant: merchant,
                asset: asset,
                amount: amount,
                open_amount: open_amount,
                active: true,
            };

            payment_requests.set(request_id, req);
        };
    }

    // --------------------------------------
    // PAY REQUEST (ALEO)
    // --------------------------------------

    fn pay_request_aleo(
        credits: credits.aleo::credits,
        request_id: field,
        merchant: address,
        amount: u64,
        timestamp: u64,
        secret: field,
    ) -> (credits.aleo::credits, PaymentRequestReceipt, PaymentRequestReceipt, Final) {
        let payer: address = self.caller;
        let commitment: field = payment_commitment(request_id, amount, payer, merchant, timestamp, secret);
        let (change, sent) = credits.aleo::transfer_private(credits, merchant, amount);

        let payer_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: payer,
            counterparty: merchant,
            role: 0u8,
            payer: payer,
            merchant: merchant,
            request_id: request_id,
            amount: amount,
            timestamp: timestamp,
            secret: secret,
            commitment: commitment,
        };

        let merchant_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: merchant,
            counterparty: payer,
            role: 1u8,
            payer: payer,
            merchant: merchant,
            request_id: request_id,
            amount: amount,
            timestamp: timestamp,
            secret: secret,
            commitment: commitment,
        };

        return (
            change,
            payer_receipt,
            merchant_receipt,
            final {
                let req: PaymentRequest = payment_requests.get(request_id);

                assert(req.active);
                assert_eq(req.asset, 0u8);
                assert_eq(req.merchant, merchant);

                if !req.open_amount {
                    assert_eq(amount, req.amount);
                }

                payment_commitments.set(commitment, true);
            },
        );
    }

    // --------------------------------------
    // PAY REQUEST (USDCx)
    // --------------------------------------

    fn pay_request_usdcx(
        pay_record: test_usdcx_stablecoin.aleo::Token,
        request_id: field,
        merchant: address,
        amount: u128,
        proofs: [test_usdcx_stablecoin.aleo::MerkleProof; 2],
        timestamp: u64,
        secret: field,
    ) -> (
        test_usdcx_stablecoin.aleo::Token,
        test_usdcx_stablecoin.aleo::Token,
        test_usdcx_stablecoin.aleo::ComplianceRecord,
        PaymentRequestReceipt,
        PaymentRequestReceipt,
        Final,
    ) {
        let amount_u64: u64 = amount as u64;
        let payer: address = self.caller;
        let commitment: field = payment_commitment(request_id, amount_u64, payer, merchant, timestamp, secret);
        let (compliance, out1, out2, f) = test_usdcx_stablecoin.aleo::transfer_private(
            merchant,
            amount,
            pay_record,
            proofs,
        );

        let payer_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: payer,
            counterparty: merchant,
            role: 0u8,
            payer: payer,
            merchant: merchant,
            request_id: request_id,
            amount: amount_u64,
            timestamp: timestamp,
            secret: secret,
            commitment: commitment,
        };

        let merchant_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: merchant,
            counterparty: payer,
            role: 1u8,
            payer: payer,
            merchant: merchant,
            request_id: request_id,
            amount: amount_u64,
            timestamp: timestamp,
            secret: secret,
            commitment: commitment,
        };

        return (
            out1,
            out2,
            compliance,
            payer_receipt,
            merchant_receipt,
            final {
                f.run();

                let req: PaymentRequest = payment_requests.get(request_id);

                assert(req.active);
                assert_eq(req.asset, 1u8);
                assert_eq(req.merchant, merchant);

                if !req.open_amount {
                    assert_eq(amount_u64, req.amount);
                }

                payment_commitments.set(commitment, true);
            },
        );
    }

    // --------------------------------------
    // PAY REQUEST (USAD)
    // --------------------------------------

    fn pay_request_usad(
        pay_record: test_usad_stablecoin.aleo::Token,
        request_id: field,
        merchant: address,
        amount: u128,
        proofs: [test_usad_stablecoin.aleo::MerkleProof; 2],
        timestamp: u64,
        secret: field,
    ) -> (
        test_usad_stablecoin.aleo::Token,
        test_usad_stablecoin.aleo::Token,
        test_usad_stablecoin.aleo::ComplianceRecord,
        PaymentRequestReceipt,
        PaymentRequestReceipt,
        Final,
    ) {
        let amount_u64: u64 = amount as u64;
        let payer: address = self.caller;
        let commitment: field = payment_commitment(request_id, amount_u64, payer, merchant, timestamp, secret);
        let (compliance, out1, out2, f) = test_usad_stablecoin.aleo::transfer_private(
            merchant,
            amount,
            pay_record,
            proofs,
        );

        let payer_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: payer,
            counterparty: merchant,
            role: 0u8,
            payer: payer,
            merchant: merchant,
            request_id: request_id,
            amount: amount_u64,
            timestamp: timestamp,
            secret: secret,
            commitment: commitment,
        };

        let merchant_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: merchant,
            counterparty: payer,
            role: 1u8,
            payer: payer,
            merchant: merchant,
            request_id: request_id,
            amount: amount_u64,
            timestamp: timestamp,
            secret: secret,
            commitment: commitment,
        };

        return (
            out1,
            out2,
            compliance,
            payer_receipt,
            merchant_receipt,
            final {
                f.run();

                let req: PaymentRequest = payment_requests.get(request_id);

                assert(req.active);
                assert_eq(req.asset, 2u8);
                assert_eq(req.merchant, merchant);

                if !req.open_amount {
                    assert_eq(amount_u64, req.amount);
                }

                payment_commitments.set(commitment, true);
            },
        );
    }

    // --------------------------------------
    // SELECTIVE DISCLOSURE
    // --------------------------------------

    fn prove_payment_basic(
        receipt: PaymentRequestReceipt,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            0u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }

    fn prove_payment_amount(
        receipt: PaymentRequestReceipt,
        amount: u64,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            0u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        assert_eq(receipt.amount, amount);

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }

    fn prove_payment_threshold(
        receipt: PaymentRequestReceipt,
        minimum_amount: u64,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            0u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        assert(receipt.amount >= minimum_amount);

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }

    fn prove_receipt_basic(
        receipt: PaymentRequestReceipt,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            1u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }

    fn prove_receipt_amount(
        receipt: PaymentRequestReceipt,
        amount: u64,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            1u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        assert_eq(receipt.amount, amount);

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }

    fn prove_receipt_threshold(
        receipt: PaymentRequestReceipt,
        minimum_amount: u64,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            1u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        assert(receipt.amount >= minimum_amount);

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }

    fn prove_payment_timebox(
        receipt: PaymentRequestReceipt,
        timestamp_from: u64,
        timestamp_to: u64,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            0u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        assert(receipt.timestamp >= timestamp_from);
        assert(receipt.timestamp <= timestamp_to);

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }

    fn prove_receipt_timebox(
        receipt: PaymentRequestReceipt,
        timestamp_from: u64,
        timestamp_to: u64,
    ) -> (PaymentRequestReceipt, bool, Final) {
        let commitment: field = assert_valid_receipt_fields(
            receipt.owner,
            receipt.role,
            receipt.payer,
            receipt.merchant,
            receipt.request_id,
            receipt.amount,
            receipt.timestamp,
            receipt.secret,
            receipt.commitment,
            1u8,
        );
        let refreshed_receipt: PaymentRequestReceipt = PaymentRequestReceipt {
            owner: receipt.owner,
            counterparty: receipt.counterparty,
            role: receipt.role,
            payer: receipt.payer,
            merchant: receipt.merchant,
            request_id: receipt.request_id,
            amount: receipt.amount,
            timestamp: receipt.timestamp,
            secret: receipt.secret,
            commitment: receipt.commitment,
        };

        assert(receipt.timestamp >= timestamp_from);
        assert(receipt.timestamp <= timestamp_to);

        return (
            refreshed_receipt,
            true,
            final {
                assert(payment_commitments.get_or_use(commitment, false));
            },
        );
    }
}

fn assert_valid_asset(asset: u8) {
    assert(asset == 0u8 || asset == 1u8 || asset == 2u8);
}

fn payment_commitment(
    request_id: field,
    amount: u64,
    payer: address,
    merchant: address,
    timestamp: u64,
    secret: field,
) -> field {
    let amount_field: field = amount as field;
    let request_amount_hash: field = hash2(request_id, amount_field);
    let payer_field: field = BHP256::hash_to_field(payer);
    let merchant_field: field = BHP256::hash_to_field(merchant);
    let actors_hash: field = hash2(payer_field, merchant_field);
    let context_hash: field = hash2(timestamp as field, secret);

    return hash2(hash2(request_amount_hash, actors_hash), context_hash);
}

fn assert_valid_receipt_fields(
    owner: address,
    role: u8,
    payer: address,
    merchant: address,
    request_id: field,
    amount: u64,
    timestamp: u64,
    secret: field,
    commitment: field,
    expected_role: u8,
) -> field {
    let expected_commitment: field = payment_commitment(
        request_id,
        amount,
        payer,
        merchant,
        timestamp,
        secret,
    );

    assert_eq(owner, self.caller);
    assert_eq(role, expected_role);
    assert_eq(commitment, expected_commitment);

    return expected_commitment;
}

fn hash1(a: field) -> field {
    return BHP256::hash_to_field_raw(a);
}

fn hash2(a: field, b: field) -> field {
    return BHP256::hash_to_field_raw([a, b]);
}
