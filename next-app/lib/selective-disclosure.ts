import { createHash, randomUUID } from "crypto"

export type DisclosureConstraints = {
  minAmount?: number
  maxAmount?: number
  requestId?: string
  timestampFrom?: string
  timestampTo?: string
}

export type DisclosureProofType = "existence" | "amount" | "threshold"

export type DisclosureActorRole = "payer" | "receiver"

export type StoredDisclosurePayload = {
  proofId: string
  program: string
  paymentTxHash: string
  disclosureTxHash?: string | null
  requestId: string
  amount: string
  ownerAddress: string
  counterpartyAddress: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  paymentTimestamp?: string | null
  commitment: string
  nullifier?: string | null
  constraints: DisclosureConstraints
  proverAddress: string
}

export const KLOAK_PROGRAM = "kloak_protocol_v8.aleo"

export function normalizeDisclosureConstraints(input: DisclosureConstraints = {}): DisclosureConstraints {
  const normalized: DisclosureConstraints = {}

  if (typeof input.minAmount === "number" && Number.isFinite(input.minAmount)) {
    normalized.minAmount = input.minAmount
  }

  if (typeof input.maxAmount === "number" && Number.isFinite(input.maxAmount)) {
    normalized.maxAmount = input.maxAmount
  }

  if (typeof input.requestId === "string" && input.requestId.trim()) {
    normalized.requestId = input.requestId.trim()
  }

  if (typeof input.timestampFrom === "string" && input.timestampFrom.trim()) {
    normalized.timestampFrom = new Date(input.timestampFrom).toISOString()
  }

  if (typeof input.timestampTo === "string" && input.timestampTo.trim()) {
    normalized.timestampTo = new Date(input.timestampTo).toISOString()
  }

  return normalized
}

export function createDisclosureProofId() {
  return `sdp_${randomUUID()}`
}

export function computeDisclosureDigest(input: string) {
  return createHash("sha256").update(input).digest("hex")
}

export function canonicalizeDisclosureProof(payload: StoredDisclosurePayload) {
  return JSON.stringify({
    proofId: payload.proofId,
    program: payload.program,
    paymentTxHash: payload.paymentTxHash,
    disclosureTxHash: payload.disclosureTxHash || null,
    requestId: payload.requestId,
    amount: payload.amount,
    ownerAddress: payload.ownerAddress,
    counterpartyAddress: payload.counterpartyAddress,
    actorRole: payload.actorRole,
    proofType: payload.proofType,
    disclosedAmount: payload.disclosedAmount || null,
    thresholdAmount: payload.thresholdAmount || null,
    paymentTimestamp: payload.paymentTimestamp || null,
    commitment: payload.commitment,
    nullifier: payload.nullifier || null,
    constraints: normalizeDisclosureConstraints(payload.constraints),
    proverAddress: payload.proverAddress,
  })
}

export function evaluateDisclosureConstraints(
  amount: number,
  createdAt: Date,
  requestId: string,
  constraints: DisclosureConstraints,
) {
  const normalized = normalizeDisclosureConstraints(constraints)

  if (typeof normalized.minAmount === "number" && amount < normalized.minAmount) {
    return {
      ok: false,
      reason: "Payment amount is below the minimum bound",
    }
  }

  if (typeof normalized.maxAmount === "number" && amount > normalized.maxAmount) {
    return {
      ok: false,
      reason: "Payment amount is above the maximum bound",
    }
  }

  if (normalized.requestId && requestId !== normalized.requestId) {
    return {
      ok: false,
      reason: "Payment does not belong to the requested payment request",
    }
  }

  if (normalized.timestampFrom) {
    const from = new Date(normalized.timestampFrom)
    if (createdAt < from) {
      return {
        ok: false,
        reason: "Payment timestamp is earlier than the allowed range",
      }
    }
  }

  if (normalized.timestampTo) {
    const to = new Date(normalized.timestampTo)
    if (createdAt > to) {
      return {
        ok: false,
        reason: "Payment timestamp is later than the allowed range",
      }
    }
  }

  return { ok: true as const }
}
