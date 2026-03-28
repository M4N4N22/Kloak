import merkle_tree.aleo;
import test_usad_multisig_core.aleo;
import test_usad_freezelist.aleo;
import test_usad_stablecoin.aleo;
import test_usdcx_multisig_core.aleo;
import test_usdcx_freezelist.aleo;
import test_usdcx_stablecoin.aleo;
import credits.aleo;
program kloak_protocol_v6.aleo;

record GrantRecord:
    owner as address.private;
    campaign_id as field.private;
    amount as u64.private;

record PaymentReceipt:
    owner as address.private;
    amount as u64.private;
    reference as field.private;

record PaymentRequestReceipt:
    owner as address.private;
    request_id as field.private;
    amount as u64.private;

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

struct KloakMerkleProof:
    s1 as field;
    s2 as field;
    s3 as field;
    s4 as field;
    s5 as field;
    s6 as field;
    s7 as field;
    s8 as field;
    s9 as field;
    s10 as field;
    d1 as boolean;
    d2 as boolean;
    d3 as boolean;
    d4 as boolean;
    d5 as boolean;
    d6 as boolean;
    d7 as boolean;
    d8 as boolean;
    d9 as boolean;
    d10 as boolean;

mapping nullifiers:
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

function create_campaign:
    input r0 as field.private;
    input r1 as field.private;
    input r2 as u8.private;
    input r3 as u64.private;
    async create_campaign r0 self.caller r1 r2 r3 into r4;
    output r4 as kloak_protocol_v6.aleo/create_campaign.future;

finalize create_campaign:
    input r0 as field.public;
    input r1 as address.public;
    input r2 as field.public;
    input r3 as u8.public;
    input r4 as u64.public;
    cast r1 r2 r3 r4 true into r5 as Campaign;
    set r5 into campaigns[r0];

function deposit_campaign_funds:
    input r0 as field.private;
    input r1 as u64.private;
    call credits.aleo/transfer_public_as_signer kloak_protocol_v6.aleo r1 into r2;
    async deposit_campaign_funds r2 r0 self.caller r1 into r3;
    output r3 as kloak_protocol_v6.aleo/deposit_campaign_funds.future;

finalize deposit_campaign_funds:
    input r0 as credits.aleo/transfer_public_as_signer.future;
    input r1 as field.public;
    input r2 as address.public;
    input r3 as u64.public;
    await r0;
    get campaigns[r1] into r4;
    assert.eq r4.creator r2;
    get.or_use campaign_pool[r1] 0u64 into r5;
    add r5 r3 into r6;
    set r6 into campaign_pool[r1];

function claim_distribution:
    input r0 as field.private;
    input r1 as field.private;
    input r2 as u64.private;
    input r3 as field.private;
    input r4 as KloakMerkleProof.private;
    hash.bhp256.raw r3 into r5 as field;
    cast r2 into r6 as field;
    cast r5 r6 into r7 as [field; 2u32];
    hash.bhp256.raw r7 into r8 as field;
    ternary r4.d1 r4.s1 r8 into r9;
    ternary r4.d1 r8 r4.s1 into r10;
    cast r9 r10 into r11 as [field; 2u32];
    hash.bhp256.raw r11 into r12 as field;
    ternary r4.d2 r4.s2 r12 into r13;
    ternary r4.d2 r12 r4.s2 into r14;
    cast r13 r14 into r15 as [field; 2u32];
    hash.bhp256.raw r15 into r16 as field;
    ternary r4.d3 r4.s3 r16 into r17;
    ternary r4.d3 r16 r4.s3 into r18;
    cast r17 r18 into r19 as [field; 2u32];
    hash.bhp256.raw r19 into r20 as field;
    ternary r4.d4 r4.s4 r20 into r21;
    ternary r4.d4 r20 r4.s4 into r22;
    cast r21 r22 into r23 as [field; 2u32];
    hash.bhp256.raw r23 into r24 as field;
    ternary r4.d5 r4.s5 r24 into r25;
    ternary r4.d5 r24 r4.s5 into r26;
    cast r25 r26 into r27 as [field; 2u32];
    hash.bhp256.raw r27 into r28 as field;
    ternary r4.d6 r4.s6 r28 into r29;
    ternary r4.d6 r28 r4.s6 into r30;
    cast r29 r30 into r31 as [field; 2u32];
    hash.bhp256.raw r31 into r32 as field;
    ternary r4.d7 r4.s7 r32 into r33;
    ternary r4.d7 r32 r4.s7 into r34;
    cast r33 r34 into r35 as [field; 2u32];
    hash.bhp256.raw r35 into r36 as field;
    ternary r4.d8 r4.s8 r36 into r37;
    ternary r4.d8 r36 r4.s8 into r38;
    cast r37 r38 into r39 as [field; 2u32];
    hash.bhp256.raw r39 into r40 as field;
    ternary r4.d9 r4.s9 r40 into r41;
    ternary r4.d9 r40 r4.s9 into r42;
    cast r41 r42 into r43 as [field; 2u32];
    hash.bhp256.raw r43 into r44 as field;
    ternary r4.d10 r4.s10 r44 into r45;
    ternary r4.d10 r44 r4.s10 into r46;
    cast r45 r46 into r47 as [field; 2u32];
    hash.bhp256.raw r47 into r48 as field;
    assert.eq r48 r1;
    cast r3 r0 into r49 as [field; 2u32];
    hash.bhp256.raw r49 into r50 as field;
    call credits.aleo/transfer_public_to_private self.caller r2 into r51 r52;
    cast self.caller r0 r2 into r53 as GrantRecord.record;
    cast self.caller r2 r0 into r54 as PaymentReceipt.record;
    async claim_distribution r52 r50 r0 r2 r1 into r55;
    output r51 as credits.aleo/credits.record;
    output r53 as GrantRecord.record;
    output r54 as PaymentReceipt.record;
    output r55 as kloak_protocol_v6.aleo/claim_distribution.future;

finalize claim_distribution:
    input r0 as credits.aleo/transfer_public_to_private.future;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as u64.public;
    input r4 as field.public;
    await r0;
    contains nullifiers[r1] into r5;
    not r5 into r6;
    assert.eq r6 true;
    get campaigns[r2] into r7;
    assert.eq r7.active true;
    assert.eq r7.merkle_root r4;
    get.or_use campaign_pool[r2] 0u64 into r8;
    gte r8 r3 into r9;
    assert.eq r9 true;
    sub r8 r3 into r10;
    set r10 into campaign_pool[r2];
    get.or_use campaign_claimed[r2] 0u64 into r11;
    add r11 r3 into r12;
    lte r12 r7.total_budget into r13;
    assert.eq r13 true;
    set r12 into campaign_claimed[r2];
    set true into nullifiers[r1];

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
    output r10 as kloak_protocol_v6.aleo/send_private_payment_usdcx.future;

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
    output r10 as kloak_protocol_v6.aleo/send_private_payment_usad.future;

finalize send_private_payment_usad:
    input r0 as test_usad_stablecoin.aleo/transfer_private.future;
    await r0;

function create_payment_request:
    input r0 as field.private;
    input r1 as u8.private;
    input r2 as u64.private;
    input r3 as boolean.private;
    async create_payment_request r0 self.caller r1 r2 r3 into r4;
    output r4 as kloak_protocol_v6.aleo/create_payment_request.future;

finalize create_payment_request:
    input r0 as field.public;
    input r1 as address.public;
    input r2 as u8.public;
    input r3 as u64.public;
    input r4 as boolean.public;
    is.eq r2 0u8 into r5;
    is.eq r2 1u8 into r6;
    or r5 r6 into r7;
    is.eq r2 2u8 into r8;
    or r7 r8 into r9;
    assert.eq r9 true;
    cast r1 r2 r3 r4 true into r10 as PaymentRequest;
    set r10 into payment_requests[r0];

function pay_request_aleo:
    input r0 as credits.aleo/credits.record;
    input r1 as field.private;
    input r2 as u64.private;
    call credits.aleo/transfer_private r0 self.caller r2 into r3 r4;
    cast self.caller r1 r2 into r5 as PaymentRequestReceipt.record;
    async pay_request_aleo r1 r2 into r6;
    output r3 as credits.aleo/credits.record;
    output r5 as PaymentRequestReceipt.record;
    output r6 as kloak_protocol_v6.aleo/pay_request_aleo.future;

finalize pay_request_aleo:
    input r0 as field.public;
    input r1 as u64.public;
    get payment_requests[r0] into r2;
    assert.eq r2.active true;
    assert.eq r2.asset 0u8;
    not r2.open_amount into r3;
    branch.eq r3 false to end_then_0_0;
    assert.eq r1 r2.amount;
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;

function pay_request_usdcx:
    input r0 as test_usdcx_stablecoin.aleo/Token.record;
    input r1 as field.private;
    input r2 as u128.private;
    input r3 as [test_usdcx_stablecoin.aleo/MerkleProof; 2u32].private;
    call test_usdcx_stablecoin.aleo/transfer_private self.caller r2 r0 r3 into r4 r5 r6 r7;
    cast r2 into r8 as u64;
    cast self.caller r1 r8 into r9 as PaymentRequestReceipt.record;
    cast r2 into r10 as u64;
    async pay_request_usdcx r1 r10 r7 into r11;
    output r5 as test_usdcx_stablecoin.aleo/Token.record;
    output r6 as test_usdcx_stablecoin.aleo/Token.record;
    output r4 as test_usdcx_stablecoin.aleo/ComplianceRecord.record;
    output r9 as PaymentRequestReceipt.record;
    output r11 as kloak_protocol_v6.aleo/pay_request_usdcx.future;

finalize pay_request_usdcx:
    input r0 as field.public;
    input r1 as u64.public;
    input r2 as test_usdcx_stablecoin.aleo/transfer_private.future;
    await r2;
    get payment_requests[r0] into r3;
    assert.eq r3.active true;
    assert.eq r3.asset 1u8;
    not r3.open_amount into r4;
    branch.eq r4 false to end_then_0_2;
    assert.eq r1 r3.amount;
    branch.eq true true to end_otherwise_0_3;
    position end_then_0_2;
    position end_otherwise_0_3;

function pay_request_usad:
    input r0 as test_usad_stablecoin.aleo/Token.record;
    input r1 as field.private;
    input r2 as u128.private;
    input r3 as [test_usad_stablecoin.aleo/MerkleProof; 2u32].private;
    call test_usad_stablecoin.aleo/transfer_private self.caller r2 r0 r3 into r4 r5 r6 r7;
    cast r2 into r8 as u64;
    cast self.caller r1 r8 into r9 as PaymentRequestReceipt.record;
    cast r2 into r10 as u64;
    async pay_request_usad r1 r10 r7 into r11;
    output r5 as test_usad_stablecoin.aleo/Token.record;
    output r6 as test_usad_stablecoin.aleo/Token.record;
    output r4 as test_usad_stablecoin.aleo/ComplianceRecord.record;
    output r9 as PaymentRequestReceipt.record;
    output r11 as kloak_protocol_v6.aleo/pay_request_usad.future;

finalize pay_request_usad:
    input r0 as field.public;
    input r1 as u64.public;
    input r2 as test_usad_stablecoin.aleo/transfer_private.future;
    await r2;
    get payment_requests[r0] into r3;
    assert.eq r3.active true;
    assert.eq r3.asset 2u8;
    not r3.open_amount into r4;
    branch.eq r4 false to end_then_0_4;
    assert.eq r1 r3.amount;
    branch.eq true true to end_otherwise_0_5;
    position end_then_0_4;
    position end_otherwise_0_5;

function prove_payment:
    input r0 as field.private;
    hash.bhp256.raw r0 into r1 as field;
    output r1 as field.private;

function test_merkle_alignment:
    input r0 as field.private;
    input r1 as u64.private;
    input r2 as KloakMerkleProof.private;
    hash.bhp256.raw r0 into r3 as field;
    cast r1 into r4 as field;
    cast r3 r4 into r5 as [field; 2u32];
    hash.bhp256.raw r5 into r6 as field;
    ternary r2.d1 r2.s1 r6 into r7;
    ternary r2.d1 r6 r2.s1 into r8;
    cast r7 r8 into r9 as [field; 2u32];
    hash.bhp256.raw r9 into r10 as field;
    ternary r2.d2 r2.s2 r10 into r11;
    ternary r2.d2 r10 r2.s2 into r12;
    cast r11 r12 into r13 as [field; 2u32];
    hash.bhp256.raw r13 into r14 as field;
    ternary r2.d3 r2.s3 r14 into r15;
    ternary r2.d3 r14 r2.s3 into r16;
    cast r15 r16 into r17 as [field; 2u32];
    hash.bhp256.raw r17 into r18 as field;
    ternary r2.d4 r2.s4 r18 into r19;
    ternary r2.d4 r18 r2.s4 into r20;
    cast r19 r20 into r21 as [field; 2u32];
    hash.bhp256.raw r21 into r22 as field;
    ternary r2.d5 r2.s5 r22 into r23;
    ternary r2.d5 r22 r2.s5 into r24;
    cast r23 r24 into r25 as [field; 2u32];
    hash.bhp256.raw r25 into r26 as field;
    ternary r2.d6 r2.s6 r26 into r27;
    ternary r2.d6 r26 r2.s6 into r28;
    cast r27 r28 into r29 as [field; 2u32];
    hash.bhp256.raw r29 into r30 as field;
    ternary r2.d7 r2.s7 r30 into r31;
    ternary r2.d7 r30 r2.s7 into r32;
    cast r31 r32 into r33 as [field; 2u32];
    hash.bhp256.raw r33 into r34 as field;
    ternary r2.d8 r2.s8 r34 into r35;
    ternary r2.d8 r34 r2.s8 into r36;
    cast r35 r36 into r37 as [field; 2u32];
    hash.bhp256.raw r37 into r38 as field;
    ternary r2.d9 r2.s9 r38 into r39;
    ternary r2.d9 r38 r2.s9 into r40;
    cast r39 r40 into r41 as [field; 2u32];
    hash.bhp256.raw r41 into r42 as field;
    ternary r2.d10 r2.s10 r42 into r43;
    ternary r2.d10 r42 r2.s10 into r44;
    cast r43 r44 into r45 as [field; 2u32];
    hash.bhp256.raw r45 into r46 as field;
    output r46 as field.private;

constructor:
    assert.eq edition 0u16;
