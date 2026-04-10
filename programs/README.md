# Kloak Protocol v10

This directory documents the current Aleo program used by Kloak.

The live source is [programs/kloak_protocol/src/main.leo](./kloak_protocol/src/main.leo), currently defined as:

```leo
program kloak_protocol_v10.aleo
```

This README replaces the old `v6` notes and reflects the current Leo v4-compatible program structure and proof model.

## Overview

Kloak Protocol v10 is an Aleo-native private payment request and selective disclosure program.

It supports:

- private ALEO payments
- private USDCx and USAD payments
- on-chain payment requests
- wallet-held payer and receiver receipts
- selective disclosure proofs for compliance workflows

The program does **not** try to make every payment fact public. Instead, it:

1. stores public request metadata needed for payment routing
2. settles funds privately
3. binds the payment to a commitment
4. mints private receipts that can later generate proofs

## Imports and external dependencies

The current program imports:

- `credits.aleo`
- `test_usdcx_stablecoin.aleo`
- `test_usad_stablecoin.aleo`

These imports are visible at the top of [main.leo](./kloak_protocol/src/main.leo).

## Current mappings

The main mappings are:

- `payment_requests: field => PaymentRequest`
- `payment_commitments: field => bool`

The file also still includes paused campaign-related mappings:

- `campaigns`
- `campaign_claimed`
- `campaign_pool`
- `campaign_creator`

Those campaign paths are currently not part of the active product path.

## Core structs and records

### `PaymentRequest`

Stored in `payment_requests`, this represents the public payment request envelope:

- `merchant`
- `asset`
- `amount`
- `open_amount`
- `active`

### `PaymentReceipt`

A smaller private receipt used by helper transfer functions.

### `PaymentRequestReceipt`

This is the important one for Kloak's compliance flow.

It contains:

- `owner`
- `counterparty`
- `role`
- `payer`
- `merchant`
- `request_id`
- `amount`
- `timestamp`
- `secret`
- `commitment`

This record is the private witness later used to generate selective disclosure proofs.

## Payment flow

### 1. Create request

Transition:

- `create_payment_request`

Inputs:

- `request_id`
- `asset`
- `amount`
- `open_amount`

Behavior:

- validates the asset
- binds the request to `self.caller` as merchant
- stores the request in `payment_requests`

### 2. Pay request privately

Transitions:

- `pay_request_aleo`
- `pay_request_usdcx`
- `pay_request_usad`

All three variants follow the same broad model:

1. derive the payer as `self.caller`
2. compute a commitment using request, amount, payer, merchant, timestamp, and secret
3. transfer value privately
4. mint a payer receipt
5. mint a merchant receipt
6. assert the request matches the chosen asset and merchant
7. enforce fixed amount when `open_amount == false`
8. store the resulting commitment in `payment_commitments`

## Commitment model

Commitments are derived by `payment_commitment(...)` in [main.leo](./kloak_protocol/src/main.leo).

The commitment combines:

- `request_id`
- `amount`
- `payer`
- `merchant`
- `timestamp`
- `secret`

through BHP256-based hashing.

This gives the program an on-chain anchor for later proof generation without exposing every underlying payment fact publicly.

## Selective disclosure model

Selective disclosure is implemented through these transitions:

### Payer-side

- `prove_payment_basic`
- `prove_payment_amount`
- `prove_payment_threshold`
- `prove_payment_timebox`

### Receiver-side

- `prove_receipt_basic`
- `prove_receipt_amount`
- `prove_receipt_threshold`
- `prove_receipt_timebox`

### Shared validation path

All of these transitions rely on:

- `assert_valid_receipt_fields(...)`

That helper checks:

- `owner == self.caller`
- role matches the expected proof side
- stored receipt commitment matches the recomputed commitment

Each proof transition then applies the proof-specific assertion:

- existence only
- exact amount equality
- threshold comparison
- timestamp range comparison

Finally, the transition checks that the commitment exists in `payment_commitments`.

## Important design change: refreshed receipts

The current proof transitions return a refreshed `PaymentRequestReceipt` rather than consuming the proof path permanently.

That matters because it allows:

- multiple later proofs from the same payment
- different disclosure modes for the same receipt
- a more practical compliance workflow

This is an important difference from one-shot proof patterns that permanently burn the witness after first use.

## What verification means at the program level

There is no separate `verify_proof` transition in the program.

Instead:

1. a receipt owner generates a disclosure transaction by calling one of the `prove_*` transitions
2. the Aleo program validates the receipt and commitment relationship
3. the app later packages and verifies that proof using:
   - the disclosure transaction
   - the payment transaction
   - the exported proof package

So the Leo program handles **proof generation and validity assertions**, while the application handles **portable proof packaging and verifier UX**.

## Leo v4 notes

This program README now reflects the current Leo v4-era codebase and structure, including:

- current `program ... {}` layout
- current `record`, `struct`, `mapping`, and `Final` usage
- current transition naming
- current import style and typed return signatures

Build with:

```bash
cd programs/kloak_protocol
leo build
```

If you are working locally from the repo root:

```bash
cd programs/kloak_protocol
leo build
```

## Security and product boundaries

### What the program guarantees

- asset type validation
- merchant binding on requests
- fixed-amount enforcement when required
- private transfer flow
- commitment anchoring
- receipt-based proof generation

### What the program does not try to do

- fully public verification of private payment arguments in plaintext
- full application-level policy management
- webhook, notification, or dashboard logic
- complete off-chain compliance lifecycle management

Those responsibilities live in the Next.js application layer.

## Relevant application references

If you are tracing the end-to-end flow from program to app, the most useful files are:

- [../next-app/lib/selective-disclosure.ts](../next-app/lib/selective-disclosure.ts)
- [../next-app/lib/services/selective-disclosure.service.ts](../next-app/lib/services/selective-disclosure.service.ts)
- [../next-app/lib/portable-proof-verifier.ts](../next-app/lib/portable-proof-verifier.ts)
- [../next-app/lib/aleo-chain-verifier.ts](../next-app/lib/aleo-chain-verifier.ts)
- [../next-app/lib/payment-chain-validation.ts](../next-app/lib/payment-chain-validation.ts)

## Status

Kloak Protocol v10 is the current program baseline for:

- private payment requests
- private settlement
- selective disclosure
- compliance-oriented proof flows

Campaign-related code remains present in the source tree, but it is not the active product path at this time.
