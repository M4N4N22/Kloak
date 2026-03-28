# Kloak — System Context

Kloak is a privacy-first payment link system built on Aleo.

The system uses:
- Aleo program (on-chain logic)
- Supabase/Postgres (off-chain metadata)
- Next.js web app (creation + payment UI)
- Telegram bot (control + notifications)

There is NO embed system currently.
Focus is on:
- payment links
- webhook system
- Telegram coordination

---

# Architecture Overview

[Creator] 
   ↓ (wallet sign)
[Aleo Program] ←→ [Backend (Next.js API)]
   ↓                    ↓
[On-chain state]     [Supabase DB]
                          ↓
                    [Telegram Bot]
                          ↓
                     [Webhook System]

---

# Core Concepts

## 1. Payment Link

A payment link is defined by:

- requestId (field) → PRIMARY LINK between on-chain and off-chain
- creatorAddress (wallet)
- amount
- token
- openAmount (custom amount allowed)
- expiry (off-chain)
- active (on-chain + off-chain)

---

## 2. On-chain (Aleo)

Creation:

- Creator signs transaction:
  create_payment_request(requestId, ...)

This:
- binds merchant = self.caller
- stores request on-chain
- enables validation during payment

Payment:

- User calls:
  pay_request(requestId, amount)

Contract enforces:
- request exists
- request is active
- amount matches (if fixed)

---

## 3. Off-chain (Supabase)

Stores:

- PaymentLink metadata
- analytics (views, payments, volume)
- expiry (NOT enforced on-chain)
- webhook endpoints
- telegram linkage

---

## 4. Request ID (CRITICAL)

requestId is the bridge:

On-chain:
- payment_requests.get(requestId)

Off-chain:
- PaymentLink.requestId

This must ALWAYS stay consistent.

---

# End-to-End Flow

## Step 1 — Creator creates link

1. Creator opens Kloak web app
2. Inputs:
   - title
   - description
   - amount / custom
   - expiry
3. Wallet signs transaction:
   create_payment_request(requestId, ...)

4. Backend stores:
   - requestId
   - metadata
   - creatorAddress

---

## Step 2 — Link is shared

Creator shares:

https://kloak.app/pay/:id

---

## Step 3 — Client opens link

1. Fetch PaymentLink from DB
2. Validate:
   - not expired (off-chain)
   - active (UI check)

---

## Step 4 — Payment

1. Client connects wallet
2. Executes:
   pay_request(requestId, amount)

3. Contract:
   - validates request
   - transfers privately

---

## Step 5 — Backend sync

After payment:

- capture txHash
- map to requestId
- create Payment record
- update:
  - paymentsReceived
  - totalVolume

---

## Step 6 — Side Effects

### Telegram
- notify creator:
  "Payment received"

### Webhook
- send event to registered endpoint

---

# Webhook System (Current Scope)

## Goal

Notify external apps when payment happens.

## Event (minimal)

{
  "type": "payment.success",
  "linkId": "...",
  "txHash": "...",
  "status": "SUCCESS"
}

## Constraints

- No payer identity
- No sensitive data
- Privacy-first design

---

# Design Principles

## 1. Hybrid Model

- On-chain → validation + truth
- Off-chain → UX + analytics + control

## 2. Privacy First

- Never expose payer identity by default
- Minimize data in webhooks

## 3. Link as Primitive

- Link is the product
- Everything builds around it

## 4. Telegram = Control Layer

- inbox
- analytics
- notifications
- reminders (future)

---

# Coding Instructions (IMPORTANT)

When generating code:

- NEVER use emojis
- Use icons where needed (lucide / similar)
- Follow existing UI patterns
- Keep styling consistent with:
  - black / white / #FAFF2A theme
- Prefer modular architecture:
  - features/inbox
  - features/analytics
  - features/webhooks

- Avoid large monolithic files
- Use clear separation:
  - handler
  - utils
  - services

---

# Current Priorities

1. Webhook system
2. Telegram payment notifications
3. Analytics improvements

---

# Out of Scope (for now)

- embed SDK
- iframe checkout
- subscriptions
- API marketplace

---

# Mental Model

Creation = on-chain intent  
Payment = on-chain execution  
Everything else = off-chain orchestration