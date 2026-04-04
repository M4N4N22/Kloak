import credits.aleo;
import kloak_protocol_v8.aleo;

program test_kloak_protocol.aleo {
    @noupgrade
    constructor() {}

    @test
    fn payment_request_lifecycle_aleo() -> Final {
        let request_id: field = 101field;
        let merchant: address = self.caller;
        let amount: u64 = 25_000u64;
        let timestamp: u64 = 1_710_000_000u64;
        let secret: field = 999field;

        let create_result: Final = kloak_protocol_v8.aleo::create_payment_request(
            request_id,
            0u8,
            amount,
            false,
        );

        let (credits_record, credits_future): (credits.aleo::credits, Final) =
            credits.aleo::transfer_public_to_private(self.caller, 60_000u64);

        let (payment_record, change_record): (credits.aleo::credits, credits.aleo::credits) =
            credits.aleo::split(credits_record, 35_000u64);

        let (change_after_payment, payer_receipt, merchant_receipt, payment_final): (
            credits.aleo::credits,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            Final,
        ) = kloak_protocol_v8.aleo::pay_request_aleo(payment_record, request_id, merchant, amount, timestamp, secret);

        assert_eq(payer_receipt.request_id, request_id);
        assert_eq(payer_receipt.amount, amount);
        assert_eq(payer_receipt.owner, self.caller);
        assert_eq(payer_receipt.role, 0u8);
        assert_eq(merchant_receipt.owner, merchant);
        assert_eq(merchant_receipt.role, 1u8);

        let (verified, disclose_final): (bool, Final) =
            kloak_protocol_v8.aleo::prove_payment_basic(payer_receipt);

        assert(verified);

        let recomputed_commitment: field = payment_commitment(request_id, amount, self.caller, merchant, timestamp, secret);
        assert_eq(payer_receipt.commitment, recomputed_commitment);

        let joined: credits.aleo::credits = credits.aleo::join(change_after_payment, change_record);
        assert_eq(joined.owner, self.caller);

        return final {
            create_result.run();
            credits_future.run();
            payment_final.run();
            disclose_final.run();
        };
    }

    @test
    @should_fail
    fn reject_wrong_amount() -> Final {
        let request_id: field = 202field;
        let merchant: address = self.caller;
        let timestamp: u64 = 1_710_000_001u64;
        let secret: field = 1001field;

        let create_result: Final = kloak_protocol_v8.aleo::create_payment_request(
            request_id,
            0u8,
            25_000u64,
            false,
        );

        let (credits_record, credits_future): (credits.aleo::credits, Final) =
            credits.aleo::transfer_public_to_private(self.caller, 60_000u64);

        let (payment_record, change_record): (credits.aleo::credits, credits.aleo::credits) =
            credits.aleo::split(credits_record, 35_000u64);

        let (change_after_payment, payer_receipt, merchant_receipt, payment_final): (
            credits.aleo::credits,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            Final,
        ) = kloak_protocol_v8.aleo::pay_request_aleo(payment_record, request_id, merchant, 24_999u64, timestamp, secret);

        return final {
            create_result.run();
            credits_future.run();
            payment_final.run();
        };
    }

    @test
    @should_fail
    fn reject_wrong_merchant() -> Final {
        let request_id: field = 303field;
        let real_merchant: address = self.caller;
        let wrong_merchant: address = aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc;
        let timestamp: u64 = 1_710_000_002u64;
        let secret: field = 1002field;

        let create_result: Final = kloak_protocol_v8.aleo::create_payment_request(
            request_id,
            0u8,
            25_000u64,
            false,
        );

        let (credits_record, credits_future): (credits.aleo::credits, Final) =
            credits.aleo::transfer_public_to_private(self.caller, 60_000u64);

        let (payment_record, change_record): (credits.aleo::credits, credits.aleo::credits) =
            credits.aleo::split(credits_record, 35_000u64);

        assert(real_merchant != wrong_merchant);

        let (change_after_payment, payer_receipt, merchant_receipt, payment_final): (
            credits.aleo::credits,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            Final,
        ) = kloak_protocol_v8.aleo::pay_request_aleo(payment_record, request_id, wrong_merchant, 25_000u64, timestamp, secret);

        return final {
            create_result.run();
            credits_future.run();
            payment_final.run();
        };
    }

    @test
    @should_fail
    fn reject_second_proof() -> Final {
        let request_id: field = 404field;
        let merchant: address = self.caller;
        let amount: u64 = 25_000u64;
        let timestamp: u64 = 1_710_000_003u64;
        let secret: field = 1003field;

        let create_result: Final = kloak_protocol_v8.aleo::create_payment_request(
            request_id,
            0u8,
            amount,
            false,
        );

        let (credits_record, credits_future): (credits.aleo::credits, Final) =
            credits.aleo::transfer_public_to_private(self.caller, 60_000u64);

        let (payment_record, change_record): (credits.aleo::credits, credits.aleo::credits) =
            credits.aleo::split(credits_record, 35_000u64);

        let (change_after_payment, payer_receipt, merchant_receipt, payment_final): (
            credits.aleo::credits,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            kloak_protocol_v8.aleo::PaymentRequestReceipt,
            Final,
        ) = kloak_protocol_v8.aleo::pay_request_aleo(payment_record, request_id, merchant, amount, timestamp, secret);

        let (verified_one, disclose_final_one): (bool, Final) =
            kloak_protocol_v8.aleo::prove_payment_basic(payer_receipt);

        assert(verified_one);
        assert_eq(payer_receipt.commitment, payment_commitment(request_id, amount, self.caller, merchant, timestamp, secret));

        let (verified_two, disclose_final_two): (bool, Final) =
            kloak_protocol_v8.aleo::prove_payment_basic(payer_receipt);

        return final {
            create_result.run();
            credits_future.run();
            payment_final.run();
            disclose_final_one.run();
            disclose_final_two.run();
        };
    }
}

fn payment_commitment(request_id: field, amount: u64, payer: address, merchant: address, timestamp: u64, secret: field) -> field {
    let amount_field: field = amount as field;
    let request_amount_hash: field = hash2(request_id, amount_field);
    let payer_field: field = BHP256::hash_to_field(payer);
    let merchant_field: field = BHP256::hash_to_field(merchant);
    let actors_hash: field = hash2(payer_field, merchant_field);
    let context_hash: field = hash2(timestamp as field, secret);

    return hash2(hash2(request_amount_hash, actors_hash), context_hash);
}

fn hash2(a: field, b: field) -> field {
    return BHP256::hash_to_field_raw([a, b]);
}
