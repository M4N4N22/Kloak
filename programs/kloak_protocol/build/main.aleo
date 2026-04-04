import merkle_tree.aleo;
import test_usad_multisig_core.aleo;
import test_usad_freezelist.aleo;
import test_usad_stablecoin.aleo;
import test_usdcx_multisig_core.aleo;
import test_usdcx_freezelist.aleo;
import test_usdcx_stablecoin.aleo;
import credits.aleo;
program kloak_protocol_v8.aleo;

record PaymentReceipt:
    owner as address.private;
    amount as u64.private;
    reference as field.private;

record PaymentRequestReceipt:
    owner as address.private;
    counterparty as address.private;
    role as u8.private;
    payer as address.private;
    merchant as address.private;
    request_id as field.private;
    amount as u64.private;
    timestamp as u64.private;
    secret as field.private;
    commitment as field.private;

struct Campaign:
    creator as address;
    merkle_root as field;
    asset as u8;
    total_budget as u64;
    active as boolean;

struct PaymentRequest:
    merchant as address;
    asset as u8;
    amount as u64;
    open_amount as boolean;
    active as boolean;

mapping nullifiers:
    key as field.public;
    value as boolean.public;

mapping payment_commitments:
    key as field.public;
    value as boolean.public;

mapping campaigns:
    key as field.public;
    value as Campaign.public;

mapping campaign_claimed:
    key as field.public;
    value as u64.public;

mapping payment_requests:
    key as field.public;
    value as PaymentRequest.public;

mapping campaign_pool:
    key as field.public;
    value as u64.public;

mapping campaign_creator:
    key as field.public;
    value as address.public;

function send_private_payment_aleo:
    input r0 as credits.aleo/credits.record;
    input r1 as address.private;
    input r2 as u64.private;
    call credits.aleo/transfer_private r0 r1 r2 into r3 r4;
    cast r1 r2 0field into r5 as PaymentReceipt.record;
    output r3 as credits.aleo/credits.record;
    output r5 as PaymentReceipt.record;

function send_private_payment_usdcx:
    input r0 as test_usdcx_stablecoin.aleo/Token.record;
    input r1 as address.private;
    input r2 as u128.private;
    input r3 as [test_usdcx_stablecoin.aleo/MerkleProof; 2u32].private;
    call test_usdcx_stablecoin.aleo/transfer_private r1 r2 r0 r3 into r4 r5 r6 r7;
    cast r2 into r8 as u64;
    cast r1 r8 0field into r9 as PaymentReceipt.record;
    async send_private_payment_usdcx r7 into r10;
    output r5 as test_usdcx_stablecoin.aleo/Token.record;
    output r6 as test_usdcx_stablecoin.aleo/Token.record;
    output r4 as test_usdcx_stablecoin.aleo/ComplianceRecord.record;
    output r9 as PaymentReceipt.record;
    output r10 as kloak_protocol_v8.aleo/send_private_payment_usdcx.future;

finalize send_private_payment_usdcx:
    input r0 as test_usdcx_stablecoin.aleo/transfer_private.future;
    await r0;

function send_private_payment_usad:
    input r0 as test_usad_stablecoin.aleo/Token.record;
    input r1 as address.private;
    input r2 as u128.private;
    input r3 as [test_usad_stablecoin.aleo/MerkleProof; 2u32].private;
    call test_usad_stablecoin.aleo/transfer_private r1 r2 r0 r3 into r4 r5 r6 r7;
    cast r2 into r8 as u64;
    cast r1 r8 0field into r9 as PaymentReceipt.record;
    async send_private_payment_usad r7 into r10;
    output r5 as test_usad_stablecoin.aleo/Token.record;
    output r6 as test_usad_stablecoin.aleo/Token.record;
    output r4 as test_usad_stablecoin.aleo/ComplianceRecord.record;
    output r9 as PaymentReceipt.record;
    output r10 as kloak_protocol_v8.aleo/send_private_payment_usad.future;

finalize send_private_payment_usad:
    input r0 as test_usad_stablecoin.aleo/transfer_private.future;
    await r0;

function create_payment_request:
    input r0 as field.private;
    input r1 as u8.private;
    input r2 as u64.private;
    input r3 as boolean.private;
    async create_payment_request r1 self.caller r2 r3 r0 into r4;
    output r4 as kloak_protocol_v8.aleo/create_payment_request.future;

finalize create_payment_request:
    input r0 as u8.public;
    input r1 as address.public;
    input r2 as u64.public;
    input r3 as boolean.public;
    input r4 as field.public;
    is.eq r0 0u8 into r5;
    is.eq r0 1u8 into r6;
    or r5 r6 into r7;
    is.eq r0 2u8 into r8;
    or r7 r8 into r9;
    assert.eq r9 true;
    cast r1 r0 r2 r3 true into r10 as PaymentRequest;
    set r10 into payment_requests[r4];

function pay_request_aleo:
    input r0 as credits.aleo/credits.record;
    input r1 as field.private;
    input r2 as address.private;
    input r3 as u64.private;
    input r4 as u64.private;
    input r5 as field.private;
    cast r3 into r6 as field;
    cast r1 r6 into r7 as [field; 2u32];
    hash.bhp256.raw r7 into r8 as field;
    hash.bhp256 self.caller into r9 as field;
    hash.bhp256 r2 into r10 as field;
    cast r9 r10 into r11 as [field; 2u32];
    hash.bhp256.raw r11 into r12 as field;
    cast r4 into r13 as field;
    cast r13 r5 into r14 as [field; 2u32];
    hash.bhp256.raw r14 into r15 as field;
    cast r8 r12 into r16 as [field; 2u32];
    hash.bhp256.raw r16 into r17 as field;
    cast r17 r15 into r18 as [field; 2u32];
    hash.bhp256.raw r18 into r19 as field;
    call credits.aleo/transfer_private r0 r2 r3 into r20 r21;
    cast self.caller r2 0u8 self.caller r2 r1 r3 r4 r5 r19 into r22 as PaymentRequestReceipt.record;
    cast r2 self.caller 1u8 self.caller r2 r1 r3 r4 r5 r19 into r23 as PaymentRequestReceipt.record;
    async pay_request_aleo r1 r2 r3 r19 into r24;
    output r20 as credits.aleo/credits.record;
    output r22 as PaymentRequestReceipt.record;
    output r23 as PaymentRequestReceipt.record;
    output r24 as kloak_protocol_v8.aleo/pay_request_aleo.future;

finalize pay_request_aleo:
    input r0 as field.public;
    input r1 as address.public;
    input r2 as u64.public;
    input r3 as field.public;
    get payment_requests[r0] into r4;
    assert.eq r4.active true;
    assert.eq r4.asset 0u8;
    assert.eq r4.merchant r1;
    not r4.open_amount into r5;
    branch.eq r5 false to end_then_0_0;
    assert.eq r2 r4.amount;
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;
    set true into payment_commitments[r3];

function pay_request_usdcx:
    input r0 as test_usdcx_stablecoin.aleo/Token.record;
    input r1 as field.private;
    input r2 as address.private;
    input r3 as u128.private;
    input r4 as [test_usdcx_stablecoin.aleo/MerkleProof; 2u32].private;
    input r5 as u64.private;
    input r6 as field.private;
    cast r3 into r7 as u64;
    cast r7 into r8 as field;
    cast r1 r8 into r9 as [field; 2u32];
    hash.bhp256.raw r9 into r10 as field;
    hash.bhp256 self.caller into r11 as field;
    hash.bhp256 r2 into r12 as field;
    cast r11 r12 into r13 as [field; 2u32];
    hash.bhp256.raw r13 into r14 as field;
    cast r5 into r15 as field;
    cast r15 r6 into r16 as [field; 2u32];
    hash.bhp256.raw r16 into r17 as field;
    cast r10 r14 into r18 as [field; 2u32];
    hash.bhp256.raw r18 into r19 as field;
    cast r19 r17 into r20 as [field; 2u32];
    hash.bhp256.raw r20 into r21 as field;
    call test_usdcx_stablecoin.aleo/transfer_private r2 r3 r0 r4 into r22 r23 r24 r25;
    cast self.caller r2 0u8 self.caller r2 r1 r7 r5 r6 r21 into r26 as PaymentRequestReceipt.record;
    cast r2 self.caller 1u8 self.caller r2 r1 r7 r5 r6 r21 into r27 as PaymentRequestReceipt.record;
    async pay_request_usdcx r25 r1 r2 r7 r21 into r28;
    output r23 as test_usdcx_stablecoin.aleo/Token.record;
    output r24 as test_usdcx_stablecoin.aleo/Token.record;
    output r22 as test_usdcx_stablecoin.aleo/ComplianceRecord.record;
    output r26 as PaymentRequestReceipt.record;
    output r27 as PaymentRequestReceipt.record;
    output r28 as kloak_protocol_v8.aleo/pay_request_usdcx.future;

finalize pay_request_usdcx:
    input r0 as test_usdcx_stablecoin.aleo/transfer_private.future;
    input r1 as field.public;
    input r2 as address.public;
    input r3 as u64.public;
    input r4 as field.public;
    await r0;
    get payment_requests[r1] into r5;
    assert.eq r5.active true;
    assert.eq r5.asset 1u8;
    assert.eq r5.merchant r2;
    not r5.open_amount into r6;
    branch.eq r6 false to end_then_0_2;
    assert.eq r3 r5.amount;
    branch.eq true true to end_otherwise_0_3;
    position end_then_0_2;
    position end_otherwise_0_3;
    set true into payment_commitments[r4];

function pay_request_usad:
    input r0 as test_usad_stablecoin.aleo/Token.record;
    input r1 as field.private;
    input r2 as address.private;
    input r3 as u128.private;
    input r4 as [test_usad_stablecoin.aleo/MerkleProof; 2u32].private;
    input r5 as u64.private;
    input r6 as field.private;
    cast r3 into r7 as u64;
    cast r7 into r8 as field;
    cast r1 r8 into r9 as [field; 2u32];
    hash.bhp256.raw r9 into r10 as field;
    hash.bhp256 self.caller into r11 as field;
    hash.bhp256 r2 into r12 as field;
    cast r11 r12 into r13 as [field; 2u32];
    hash.bhp256.raw r13 into r14 as field;
    cast r5 into r15 as field;
    cast r15 r6 into r16 as [field; 2u32];
    hash.bhp256.raw r16 into r17 as field;
    cast r10 r14 into r18 as [field; 2u32];
    hash.bhp256.raw r18 into r19 as field;
    cast r19 r17 into r20 as [field; 2u32];
    hash.bhp256.raw r20 into r21 as field;
    call test_usad_stablecoin.aleo/transfer_private r2 r3 r0 r4 into r22 r23 r24 r25;
    cast self.caller r2 0u8 self.caller r2 r1 r7 r5 r6 r21 into r26 as PaymentRequestReceipt.record;
    cast r2 self.caller 1u8 self.caller r2 r1 r7 r5 r6 r21 into r27 as PaymentRequestReceipt.record;
    async pay_request_usad r25 r1 r2 r7 r21 into r28;
    output r23 as test_usad_stablecoin.aleo/Token.record;
    output r24 as test_usad_stablecoin.aleo/Token.record;
    output r22 as test_usad_stablecoin.aleo/ComplianceRecord.record;
    output r26 as PaymentRequestReceipt.record;
    output r27 as PaymentRequestReceipt.record;
    output r28 as kloak_protocol_v8.aleo/pay_request_usad.future;

finalize pay_request_usad:
    input r0 as test_usad_stablecoin.aleo/transfer_private.future;
    input r1 as field.public;
    input r2 as address.public;
    input r3 as u64.public;
    input r4 as field.public;
    await r0;
    get payment_requests[r1] into r5;
    assert.eq r5.active true;
    assert.eq r5.asset 2u8;
    assert.eq r5.merchant r2;
    not r5.open_amount into r6;
    branch.eq r6 false to end_then_0_4;
    assert.eq r3 r5.amount;
    branch.eq true true to end_otherwise_0_5;
    position end_then_0_4;
    position end_otherwise_0_5;
    set true into payment_commitments[r4];

closure assert_valid_receipt_fields:
    input r0 as address;
    input r1 as u8;
    input r2 as address;
    input r3 as address;
    input r4 as field;
    input r5 as u64;
    input r6 as u64;
    input r7 as field;
    input r8 as field;
    input r9 as u8;
    cast r5 into r10 as field;
    cast r4 r10 into r11 as [field; 2u32];
    hash.bhp256.raw r11 into r12 as field;
    hash.bhp256 r2 into r13 as field;
    hash.bhp256 r3 into r14 as field;
    cast r13 r14 into r15 as [field; 2u32];
    hash.bhp256.raw r15 into r16 as field;
    cast r6 into r17 as field;
    cast r17 r7 into r18 as [field; 2u32];
    hash.bhp256.raw r18 into r19 as field;
    cast r12 r16 into r20 as [field; 2u32];
    hash.bhp256.raw r20 into r21 as field;
    cast r21 r19 into r22 as [field; 2u32];
    hash.bhp256.raw r22 into r23 as field;
    assert.eq r0 self.caller;
    assert.eq r1 r9;
    assert.eq r8 r23;
    output r23 as field;

closure proof_nullifier:
    input r0 as field;
    input r1 as u8;
    input r2 as u64;
    input r3 as u64;
    input r4 as u64;
    cast r1 into r5 as field;
    cast r2 into r6 as field;
    cast r3 into r7 as field;
    cast r4 into r8 as field;
    cast r5 r6 into r9 as [field; 2u32];
    hash.bhp256.raw r9 into r10 as field;
    cast r7 r8 into r11 as [field; 2u32];
    hash.bhp256.raw r11 into r12 as field;
    cast r10 r12 into r13 as [field; 2u32];
    hash.bhp256.raw r13 into r14 as field;
    cast r0 r14 into r15 as [field; 2u32];
    hash.bhp256.raw r15 into r16 as field;
    output r16 as field;

function prove_payment_basic:
    input r0 as PaymentRequestReceipt.record;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 0u8 into r1;
    call proof_nullifier r0.secret 0u8 0u64 0u64 0u64 into r2;
    async prove_payment_basic r1 r2 into r3;
    output true as boolean.private;
    output r3 as kloak_protocol_v8.aleo/prove_payment_basic.future;

finalize prove_payment_basic:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

function prove_payment_amount:
    input r0 as PaymentRequestReceipt.record;
    input r1 as u64.private;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 0u8 into r2;
    call proof_nullifier r0.secret 1u8 r1 0u64 0u64 into r3;
    assert.eq r0.amount r1;
    async prove_payment_amount r2 r3 into r4;
    output true as boolean.private;
    output r4 as kloak_protocol_v8.aleo/prove_payment_amount.future;

finalize prove_payment_amount:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

function prove_payment_threshold:
    input r0 as PaymentRequestReceipt.record;
    input r1 as u64.private;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 0u8 into r2;
    call proof_nullifier r0.secret 2u8 r1 0u64 0u64 into r3;
    gte r0.amount r1 into r4;
    assert.eq r4 true;
    async prove_payment_threshold r2 r3 into r5;
    output true as boolean.private;
    output r5 as kloak_protocol_v8.aleo/prove_payment_threshold.future;

finalize prove_payment_threshold:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

function prove_receipt_basic:
    input r0 as PaymentRequestReceipt.record;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 1u8 into r1;
    call proof_nullifier r0.secret 3u8 0u64 0u64 0u64 into r2;
    async prove_receipt_basic r1 r2 into r3;
    output true as boolean.private;
    output r3 as kloak_protocol_v8.aleo/prove_receipt_basic.future;

finalize prove_receipt_basic:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

function prove_receipt_amount:
    input r0 as PaymentRequestReceipt.record;
    input r1 as u64.private;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 1u8 into r2;
    call proof_nullifier r0.secret 4u8 r1 0u64 0u64 into r3;
    assert.eq r0.amount r1;
    async prove_receipt_amount r2 r3 into r4;
    output true as boolean.private;
    output r4 as kloak_protocol_v8.aleo/prove_receipt_amount.future;

finalize prove_receipt_amount:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

function prove_receipt_threshold:
    input r0 as PaymentRequestReceipt.record;
    input r1 as u64.private;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 1u8 into r2;
    call proof_nullifier r0.secret 5u8 r1 0u64 0u64 into r3;
    gte r0.amount r1 into r4;
    assert.eq r4 true;
    async prove_receipt_threshold r2 r3 into r5;
    output true as boolean.private;
    output r5 as kloak_protocol_v8.aleo/prove_receipt_threshold.future;

finalize prove_receipt_threshold:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

function prove_payment_timebox:
    input r0 as PaymentRequestReceipt.record;
    input r1 as u64.private;
    input r2 as u64.private;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 0u8 into r3;
    call proof_nullifier r0.secret 6u8 0u64 r1 r2 into r4;
    gte r0.timestamp r1 into r5;
    assert.eq r5 true;
    lte r0.timestamp r2 into r6;
    assert.eq r6 true;
    async prove_payment_timebox r3 r4 into r7;
    output true as boolean.private;
    output r7 as kloak_protocol_v8.aleo/prove_payment_timebox.future;

finalize prove_payment_timebox:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

function prove_receipt_timebox:
    input r0 as PaymentRequestReceipt.record;
    input r1 as u64.private;
    input r2 as u64.private;
    call assert_valid_receipt_fields r0.owner r0.role r0.payer r0.merchant r0.request_id r0.amount r0.timestamp r0.secret r0.commitment 1u8 into r3;
    call proof_nullifier r0.secret 7u8 0u64 r1 r2 into r4;
    gte r0.timestamp r1 into r5;
    assert.eq r5 true;
    lte r0.timestamp r2 into r6;
    assert.eq r6 true;
    async prove_receipt_timebox r3 r4 into r7;
    output true as boolean.private;
    output r7 as kloak_protocol_v8.aleo/prove_receipt_timebox.future;

finalize prove_receipt_timebox:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use payment_commitments[r0] false into r2;
    assert.eq r2 true;
    get.or_use nullifiers[r1] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r1];

constructor:
    assert.eq edition 0u16;
