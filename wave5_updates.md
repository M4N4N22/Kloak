# Wave 5 Updates

This document summarizes the technical direction of the `wave5` branch.

Wave 5 is the point where Kloak stops being just a private payment-link demo and becomes a more complete Aleo-native payments and compliance system with stronger verification and a much better-defined trust model.

## Summary

Wave 5 focused on five major areas:

1. **Aleo nativeness**
2. **Compliance and selective disclosure**
3. **Chain-first verification**
4. **Security hardening across app routes**
5. **Product maturity across payment links, docs, pricing, and trust UX**

## 1. Aleo nativeness

The protocol and app were tightened around what Aleo actually provides instead of relying on assumptions better suited to transparent chains.

### Program baseline

The current program is [programs/kloak_protocol/src/main.leo](./programs/kloak_protocol/src/main.leo) and is now defined as:

```leo
program kloak_protocol_v10.aleo
```

This version centers on:

- on-chain `payment_requests`
- on-chain `payment_commitments`
- private payer and receiver receipts
- proof generation from wallet-held receipts

### Why this matters

For private payments on Aleo, confirmed transaction payloads expose:

- the transaction exists
- the executed program and function
- the transition shape

but do **not** reliably expose the private payment arguments in plaintext.

That design reality directly shaped the app logic in:

- [next-app/lib/payment-chain-validation.ts](./next-app/lib/payment-chain-validation.ts)
- [next-app/lib/aleo-chain-verifier.ts](./next-app/lib/aleo-chain-verifier.ts)

Wave 5 deliberately moved validation to the boundary of what the SDK actually exposes, rather than pretending the server can publicly inspect private request IDs, merchant addresses, or amounts when those values are ciphertext in confirmed private-payment transitions.

## 2. Compliance as a first-class product surface

Wave 5 introduced compliance as a real product workflow instead of a side capability.

Key implementation files:

- [next-app/lib/selective-disclosure.ts](./next-app/lib/selective-disclosure.ts)
- [next-app/lib/services/selective-disclosure.service.ts](./next-app/lib/services/selective-disclosure.service.ts)
- [next-app/lib/portable-proof-verifier.ts](./next-app/lib/portable-proof-verifier.ts)
- [next-app/app/api/proof/verify/route.ts](./next-app/app/api/proof/verify/route.ts)
- [next-app/app/api/proof/payments/route.ts](./next-app/app/api/proof/payments/route.ts)

### What changed

Kloak now supports:

- payer proofs
- receiver proofs
- existence proofs
- exact amount proofs
- threshold proofs
- timebox proofs

These proofs are anchored to wallet-held `PaymentRequestReceipt` records, not to arbitrary off-chain rows.

### Product implication

The compliance product is now honest about its trust model:

- generation is on-chain through `prove_*` transitions
- exported proof packages are portable artifacts
- verification starts with package integrity and public Aleo chain confirmation
- Kloak records add revocation and history context on top

## 3. Portable proof packages and chain-first verification

Wave 5 introduced a cleaner separation between:

- proof generation
- proof packaging
- public-chain verification
- Kloak-backed verification

### Portable package model

The portable proof package is defined in:

- [next-app/lib/selective-disclosure.ts](./next-app/lib/selective-disclosure.ts)

Current package shape:

- `kind`
- `version`
- `program`
- `proofId`
- `subject`
- `statement`
- `chain`
- `proofDigest`

### Package validation

Package validation was extracted into:

- [next-app/lib/portable-proof-verifier.ts](./next-app/lib/portable-proof-verifier.ts)

This validates:

- supported package format
- supported kind
- supported version
- canonical digest integrity

### Public chain verification

Public Aleo verification is now centralized in:

- [next-app/lib/aleo-chain-verifier.ts](./next-app/lib/aleo-chain-verifier.ts)

That verifier checks:

- payment transaction exists
- payment transaction contains the expected Kloak payment transition
- disclosure transaction exists
- disclosure transaction contains the expected Kloak proof transition
- disclosure function matches the shared proof statement

### Why this is important

Earlier verification paths leaned too heavily on Kloak-managed rows.

Wave 5 moved Kloak toward this layered model:

1. **Package is intact**
2. **Public Aleo chain confirms the referenced transactions**
3. **Kloak adds revocation and history checks**

That makes verification more portable and less dependent on private application state.

## 4. Security hardening

Wave 5 included meaningful security cleanup across the API layer.

Key references:

- [next-app/lib/creator-access.ts](./next-app/lib/creator-access.ts)
- [next-app/lib/compliance-access.ts](./next-app/lib/compliance-access.ts)

### Signed creator access

Creator-scoped routes now rely on signed creator access instead of trusting raw wallet addresses from the client.

That includes hardening work around:

- dashboard routes
- bots overview
- payment links
- payment-link analytics
- webhooks
- creator profile activation

### Signed compliance access

Proof-history and proof-sensitive routes use signed compliance access. This was extended to proof revocation as well, so revocation is no longer driven by a spoofable plain actor address.

### Webhook hardening

Webhook endpoints were tightened so that:

- management requires signed creator access
- secrets are not re-exposed after creation
- reads show configured state rather than decrypted secrets

Implementation:

- [next-app/app/api/webhooks/route.ts](./next-app/app/api/webhooks/route.ts)
- [next-app/app/api/webhooks/[id]/route.ts](./next-app/app/api/webhooks/[id]/route.ts)
- [next-app/lib/services/webhook.service.ts](./next-app/lib/services/webhook.service.ts)

### Payment recording hardening

Payment recording was also tightened:

- [next-app/app/api/payment-links/[id]/pay/route.ts](./next-app/app/api/payment-links/[id]/pay/route.ts)
- [next-app/lib/payment-chain-validation.ts](./next-app/lib/payment-chain-validation.ts)

Important design choice:

The validator now checks only what the SDK truly exposes for confirmed private-payment transitions:

- transaction exists
- program is Kloak
- function matches the link token
- input shape matches the expected private-payment transition
- fixed-amount links still enforce the saved link amount

This avoids impossible or misleading "validation" against plaintext private arguments that the public SDK response does not expose.

## 5. Product and UX updates

Wave 5 also pushed the product surface toward a more production-ready state.

### Payment Links v2

The payment-links flow now includes:

- templates
- multi-step creator flow
- suggested amounts
- success messages
- redirect URLs
- redesigned payer pages

Relevant files:

- [next-app/app/(main)/payment-links/create-link-form.tsx](./next-app/app/(main)/payment-links/create-link-form.tsx)
- [next-app/app/(receipent)/pay/[id]/pay-client.tsx](./next-app/app/(receipent)/pay/[id]/pay-client.tsx)

### Trust surfaces

Wave 5 added actual trust and support surfaces:

- privacy page
- terms page
- security page
- support page
- docs workspace
- FAQ

### Docs and pricing

The docs and pricing surfaces were rebuilt to reflect the real product:

- privacy-first payments
- selective disclosure
- chain-first verification
- free-to-start pricing with Pro centered on automation, integrations, and scale

## 6. At-rest encryption

Wave 5 also added encryption at rest for selected sensitive off-chain fields.

Key implementation:

- [next-app/lib/at-rest-encryption.ts](./next-app/lib/at-rest-encryption.ts)
- [next-app/lib/services/webhook.service.ts](./next-app/lib/services/webhook.service.ts)
- [next-app/lib/services/selective-disclosure.service.ts](./next-app/lib/services/selective-disclosure.service.ts)

Protected examples include:

- webhook secrets
- stored proof payloads

This is not a substitute for proper server trust boundaries, but it improves the blast radius of raw database exposure and backup leakage.

## 7. Program-level changes worth calling out

Compared with earlier waves, the program now reflects several important structural decisions:

- Leo v4-compatible syntax and layout
- `kloak_protocol_v10.aleo`
- receipt refresh behavior in proof transitions instead of one-shot proof consumption
- explicit payer and receiver selective disclosure functions
- timebox proofs in addition to exact amount and threshold proofs

This means the same payment receipt can support multiple later disclosure flows without being permanently consumed by the first proof.

## 8. Known limits and honest boundaries

Wave 5 improved a lot, but a few limits remain important to state clearly.

### Verification is more portable, not fully trustless

Kloak now has a much better chain-first verification model, but proof verification is still not purely reconstructed from chain state alone in every dimension.

### Public chain cannot reveal private arguments

For Aleo private payments, the confirmed transaction shape is still limited. That is why Kloak validates against:

- transaction existence
- program/function shape
- disclosure transition matching

and not against private payment arguments that remain ciphertext.

### Campaign code remains dead/deferred

Campaign-related routes and logic are still treated as dead or deferred code and are not part of the hardened live product path.

## 9. Net result of Wave 5

Wave 5 made Kloak materially stronger in four ways:

- more Aleo-native
- more honest about what is private and what is verifiable
- more secure at the API layer
- more complete as a real product, especially around compliance

It is the branch where Kloak becomes a private-payments-and-proof system with a clearer security model, a clearer verification model, and a product surface that better matches what the protocol can actually guarantee.
