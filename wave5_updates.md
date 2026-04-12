# Wave 5 Updates

This document summarizes what changed in the `wave5` branch and why those changes matter.

Wave 5 is where Kloak becomes a more complete Aleo-native system for private payments, selective disclosure, and proof verification. The work in this branch tightens the product around how Aleo actually works, improves the security model across the app, and turns compliance into a serious, usable workflow.

## What Wave 5 focused on

Wave 5 centered on five areas:

1. **Aleo-native payment architecture**
2. **Compliance and selective disclosure**
3. **Portable proofs and chain first verification**
4. **Security hardening across the API layer**
5. **Product maturity across payment flows, docs, pricing, and trust pages**

## 1. Aleo-native payment architecture

The current program is [programs/kloak_protocol/src/main.leo](./programs/kloak_protocol/src/main.leo) and is now defined as:

```leo
program kloak_protocol_v10.aleo
```

This version is built around:

- on-chain payment requests
- on-chain payment commitments
- private payer and receiver receipts
- receipt-backed selective disclosure

That structure is important because it matches Aleo's strengths well. Kloak uses Aleo for what Aleo is best at:

- private settlement
- private records held by the wallet
- public confirmation of executed program logic
- zero-knowledge proof flows built from private state

### Why the app logic changed

Kloak now treats Aleo confirmed transactions the way they should be treated in a privacy-first system.

For private payments, the public chain is the place to verify:

- that a transaction exists
- that the expected Kloak program ran
- that the correct transition executed

The private payment details themselves remain inside the private receipt model, which is exactly the right place for them in an Aleo-native design.

That understanding directly shaped:

- [next-app/lib/payment-chain-validation.ts](./next-app/lib/payment-chain-validation.ts)
- [next-app/lib/aleo-chain-verifier.ts](./next-app/lib/aleo-chain-verifier.ts)

Instead of trying to force transparent-chain assumptions onto Aleo, Kloak now validates against the public transaction shape Aleo intentionally exposes and uses wallet-held receipts as the private witness where deeper proof logic is required.

## 2. Compliance is now a first-class workflow

Wave 5 turned compliance into a core part of the product.

Key files:

- [next-app/lib/selective-disclosure.ts](./next-app/lib/selective-disclosure.ts)
- [next-app/lib/services/selective-disclosure.service.ts](./next-app/lib/services/selective-disclosure.service.ts)
- [next-app/app/api/proof/verify/route.ts](./next-app/app/api/proof/verify/route.ts)
- [next-app/app/api/proof/payments/route.ts](./next-app/app/api/proof/payments/route.ts)

Kloak now supports:

- payer proofs
- receiver proofs
- existence proofs
- exact amount proofs
- threshold proofs
- timebox proofs

These proofs are anchored to private `PaymentRequestReceipt` records from the wallet, not to a loosely trusted off-chain row.

### Why that matters

This is a better fit for Aleo than a backend-first compliance model.

The receipt is the real private witness. The app helps package and manage the proof flow, but the proof itself starts from wallet-held Aleo-native state.

That gives Kloak a stronger foundation for:

- selective disclosure
- proof ownership
- verifier confidence
- future portability

## 3. Portable proofs and chain-first verification

Wave 5 also made proof verification much clearer and stronger.

Relevant files:

- [next-app/lib/selective-disclosure.ts](./next-app/lib/selective-disclosure.ts)
- [next-app/lib/portable-proof-verifier.ts](./next-app/lib/portable-proof-verifier.ts)
- [next-app/lib/aleo-chain-verifier.ts](./next-app/lib/aleo-chain-verifier.ts)
- [next-app/lib/services/selective-disclosure.service.ts](./next-app/lib/services/selective-disclosure.service.ts)

### Portable proof package

Kloak now exports a versioned proof package with a stable structure:

- `kind`
- `version`
- `program`
- `proofId`
- `subject`
- `statement`
- `chain`
- `proofDigest`

The proof package is canonicalized and hashed so it can be checked consistently outside the UI.

### Verification model

Wave 5 gave Kloak a layered verification model:

1. **Package integrity**
   The shared proof package is parsed, canonicalized, and checked against its digest.

2. **Public Aleo chain confirmation**
   Kloak confirms the referenced payment and disclosure transactions on Aleo testnet and checks that the disclosure transition matches the shared proof statement.

3. **Kloak record checks**
   Kloak adds revocation status, proof history, and payment-history context where available.

This model is strong because it uses the public Aleo chain as the primary trust signal for verification, instead of treating Kloak's database as the only authority.

That is a better design for Aleo:

- the chain proves the transaction path
- the wallet holds the private receipt
- the proof package carries the disclosed statement
- Kloak adds lifecycle and product-level context on top

## 4. Receipt recovery for missed payment syncs

Wave 5 also improved one of the most important real-world reliability gaps in a private-payment workflow.

Sometimes the wallet has the real receipt, but the app misses the final post-payment sync because the tab closes early or the user leaves before the success flow completes.

That no longer forces a second payment.

Kloak now supports payment recovery from:

- the wallet-held receipt
- the original transaction hash

Relevant files:

- [next-app/app/api/proof/payments/recover/route.ts](./next-app/app/api/proof/payments/recover/route.ts)
- [next-app/lib/services/selective-disclosure.service.ts](./next-app/lib/services/selective-disclosure.service.ts)
- [next-app/features/compliance/components/payment-selector.tsx](./next-app/features/compliance/components/payment-selector.tsx)

This flow reconstructs the missing payment row so the payment becomes proof-ready again, without asking the user to pay twice.

That is a meaningful usability improvement for a private-payment system because it respects the fact that the wallet receipt is real Aleo state, even if the app missed part of the off-chain sync.

## 5. Security hardening across the app

Wave 5 included broad security improvements across the API layer.

Key references:

- [next-app/lib/creator-access.ts](./next-app/lib/creator-access.ts)
- [next-app/lib/compliance-access.ts](./next-app/lib/compliance-access.ts)

### Signed creator access

Creator-facing routes now use signed creator access instead of trusting a client-supplied address.

That includes protection around:

- dashboard data
- payment links
- payment-link analytics
- bot overview
- webhooks
- creator profile updates

### Signed compliance access

Compliance-sensitive routes use signed compliance access, including proof revocation.

This keeps proof history and proof management tied to the wallet that actually controls the compliance workspace.

### Webhook hardening

Webhook management was tightened so that:

- read and write actions require signed creator access
- webhook secrets are not repeatedly exposed after creation
- the UI shows configured state instead of re-sending decrypted secrets on every read

Implementation:

- [next-app/app/api/webhooks/route.ts](./next-app/app/api/webhooks/route.ts)
- [next-app/app/api/webhooks/[id]/route.ts](./next-app/app/api/webhooks/[id]/route.ts)
- [next-app/lib/services/webhook.service.ts](./next-app/lib/services/webhook.service.ts)

### Payment recording hardening

Payment recording was also strengthened:

- [next-app/app/api/payment-links/[id]/pay/route.ts](./next-app/app/api/payment-links/[id]/pay/route.ts)
- [next-app/lib/payment-chain-validation.ts](./next-app/lib/payment-chain-validation.ts)

Kloak now validates payments in a way that matches Aleo private transactions properly:

- the transaction must exist
- the correct Kloak payment transition must be present
- the transition shape must match the expected private-payment path
- fixed-amount links still enforce the saved amount

This is a more disciplined Aleo-native approach than pretending the server can publicly inspect private payment arguments that are meant to remain private.

## 6. At-rest encryption

Wave 5 added encryption at rest for selected sensitive off-chain fields.

Key files:

- [next-app/lib/at-rest-encryption.ts](./next-app/lib/at-rest-encryption.ts)
- [next-app/lib/services/webhook.service.ts](./next-app/lib/services/webhook.service.ts)
- [next-app/lib/services/selective-disclosure.service.ts](./next-app/lib/services/selective-disclosure.service.ts)

Examples include:

- webhook secrets
- stored proof payloads

This improves the storage posture of the application and reduces the risk of exposing sensitive plaintext through raw database access or backups.

## 7. Program-level improvements

The program itself now reflects several important design decisions:

- Leo v4-compatible syntax and structure
- `kloak_protocol_v10.aleo`
- explicit payer and receiver proof transitions
- timebox proofs in addition to amount and threshold proofs
- refreshed receipt returns from proof transitions instead of one-shot witness consumption

That refreshed-receipt model matters because it lets the same payment support multiple later disclosure flows without the first proof permanently ending the compliance utility of the receipt.

This is a practical and product-aware design choice for Aleo-based proofs.

## 8. Product maturity

Wave 5 also improved the surrounding product significantly.

### Payment Links v2

The payment-link flow now includes:

- templates
- multi-step link creation
- suggested amounts
- success messages
- redirect URLs
- a redesigned pay page

Relevant files:

- [next-app/app/(main)/payment-links/create-link-form.tsx](./next-app/app/(main)/payment-links/create-link-form.tsx)
- [next-app/app/(receipent)/pay/[id]/pay-client.tsx](./next-app/app/(receipent)/pay/[id]/pay-client.tsx)

### Docs, pricing, and trust pages

Wave 5 also added or upgraded:

- privacy page
- terms page
- security page
- support page
- docs workspace
- FAQ
- pricing page

These updates matter because Kloak now explains its privacy model, verification model, and plan structure much more clearly.

## 9. Net result of Wave 5

Wave 5 made Kloak substantially stronger in four ways:

- more Aleo-native in both protocol and app logic
- stronger and more usable compliance workflows
- better verification through portable proof packages and public-chain confirmation
- tighter security across creator, proof, and webhook routes

This is the branch where Kloak becomes a more complete private-payments and selective-disclosure system built around Aleo's actual strengths, rather than a generic payment product with privacy claims layered on top.
