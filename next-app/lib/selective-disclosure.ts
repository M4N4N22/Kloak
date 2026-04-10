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
  ownerAddress: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  commitment: string
  constraints: DisclosureConstraints
  proverAddress: string
  // Legacy optional fields kept for backward compatibility when reading older proofs.
  counterpartyAddress?: string | null
  paymentTimestamp?: string | null
  amount?: string | null
  nullifier?: string | null
}

export type DisclosureStatement = {
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  constraints: DisclosureConstraints
}

export type PortableDisclosureProofV1 = {
  kind: "kloak.selective-disclosure-proof"
  version: 1
  program: string
  proofId: string
  subject: {
    ownerAddress: string
    proverAddress?: string | null
  }
  statement: DisclosureStatement
  chain: {
    paymentTxHash: string
    disclosureTxHash?: string | null
    requestId: string
    commitment: string
  }
  proofDigest: string
}

export type PortableDisclosureVerificationGuide = {
  primaryTrustSignal: "public-chain"
  secondaryTrustSignals: Array<"kloak-record" | "revocation-status" | "payment-history">
  checks: Array<{
    id:
      | "package-integrity"
      | "payment-transaction"
      | "disclosure-transaction"
      | "disclosure-match"
      | "kloak-record"
      | "revocation-status"
      | "payment-history"
    label: string
    source: "package" | "public-chain" | "kloak"
  }>
  note: string
}

export type LegacySharedDisclosureProof = {
  proofId: string
  paymentTxHash: string
  disclosureTxHash?: string | null
  requestId: string
  ownerAddress: string
  commitment: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  constraints: DisclosureConstraints
  proofDigest: string
  program?: string
  proverAddress?: string | null
}

export type SharedDisclosureProof = PortableDisclosureProofV1

export const KLOAK_PROGRAM = "kloak_protocol_v10.aleo"
export const PORTABLE_DISCLOSURE_PROOF_KIND = "kloak.selective-disclosure-proof"
export const PORTABLE_DISCLOSURE_PROOF_VERSION = 1 as const

export function getDisclosureProofFunctionName(
  actorRole: DisclosureActorRole,
  proofType: DisclosureProofType,
  hasTimebox: boolean,
) {
  if (hasTimebox) {
    return actorRole === "payer" ? "prove_payment_timebox" : "prove_receipt_timebox"
  }

  if (actorRole === "payer") {
    if (proofType === "amount") return "prove_payment_amount"
    if (proofType === "threshold") return "prove_payment_threshold"
    return "prove_payment_basic"
  }

  if (proofType === "amount") return "prove_receipt_amount"
  if (proofType === "threshold") return "prove_receipt_threshold"
  return "prove_receipt_basic"
}

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
    ownerAddress: payload.ownerAddress,
    actorRole: payload.actorRole,
    proofType: payload.proofType,
    disclosedAmount: payload.disclosedAmount || null,
    thresholdAmount: payload.thresholdAmount || null,
    commitment: payload.commitment,
    constraints: normalizeDisclosureConstraints(payload.constraints),
    proverAddress: payload.proverAddress,
    counterpartyAddress: payload.counterpartyAddress || null,
    paymentTimestamp: payload.paymentTimestamp || null,
    amount: payload.amount || null,
    nullifier: payload.nullifier || null,
  })
}

export function canonicalizeDisclosureStatement(statement: DisclosureStatement) {
  return JSON.stringify({
    actorRole: statement.actorRole,
    proofType: statement.proofType,
    disclosedAmount: statement.disclosedAmount || null,
    thresholdAmount: statement.thresholdAmount || null,
    constraints: normalizeDisclosureConstraints(statement.constraints),
  })
}

export function buildSharedDisclosureProof(payload: {
  program: string
  proofId: string
  paymentTxHash: string
  disclosureTxHash?: string | null
  requestId: string
  ownerAddress: string
  proverAddress?: string | null
  commitment: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  disclosedAmount?: string | null
  thresholdAmount?: string | null
  constraints: DisclosureConstraints
}): SharedDisclosureProof {
  const portableProof = {
    kind: PORTABLE_DISCLOSURE_PROOF_KIND,
    version: PORTABLE_DISCLOSURE_PROOF_VERSION,
    program: payload.program,
    proofId: payload.proofId,
    subject: {
      ownerAddress: payload.ownerAddress,
      proverAddress: payload.proverAddress || null,
    },
    statement: {
      actorRole: payload.actorRole,
      proofType: payload.proofType,
      disclosedAmount: payload.disclosedAmount || null,
      thresholdAmount: payload.thresholdAmount || null,
      constraints: normalizeDisclosureConstraints(payload.constraints),
    },
    chain: {
      paymentTxHash: payload.paymentTxHash,
      disclosureTxHash: payload.disclosureTxHash || null,
      requestId: payload.requestId,
      commitment: payload.commitment,
    },
  } satisfies Omit<PortableDisclosureProofV1, "proofDigest">

  return {
    ...portableProof,
    proofDigest: computeDisclosureDigest(canonicalizePortableDisclosureProof(portableProof)),
  }
}

export function buildPortableDisclosureVerificationGuide(): PortableDisclosureVerificationGuide {
  return {
    primaryTrustSignal: "public-chain",
    secondaryTrustSignals: ["kloak-record", "revocation-status", "payment-history"],
    checks: [
      { id: "package-integrity", label: "Proof package was intact", source: "package" },
      { id: "payment-transaction", label: "Payment transaction was found on Aleo", source: "public-chain" },
      { id: "disclosure-transaction", label: "Proof transaction was found on Aleo", source: "public-chain" },
      { id: "disclosure-match", label: "Proof transaction matched the shared statement", source: "public-chain" },
      { id: "kloak-record", label: "Kloak found the proof record", source: "kloak" },
      { id: "revocation-status", label: "Kloak checked revocation status", source: "kloak" },
      { id: "payment-history", label: "Kloak re-checked payment history", source: "kloak" },
    ],
    note:
      "Kloak verifies the shared package first, then tries to confirm the proof from public Aleo transactions. Kloak record checks add revocation and history status on top when available.",
  }
}

export function canonicalizePortableDisclosureProof(
  payload: Omit<PortableDisclosureProofV1, "proofDigest">,
) {
  return JSON.stringify({
    kind: payload.kind,
    version: payload.version,
    program: payload.program,
    proofId: payload.proofId,
    subject: {
      ownerAddress: payload.subject.ownerAddress,
      proverAddress: payload.subject.proverAddress || null,
    },
    statement: {
      actorRole: payload.statement.actorRole,
      proofType: payload.statement.proofType,
      disclosedAmount: payload.statement.disclosedAmount || null,
      thresholdAmount: payload.statement.thresholdAmount || null,
      constraints: normalizeDisclosureConstraints(payload.statement.constraints),
    },
    chain: {
      paymentTxHash: payload.chain.paymentTxHash,
      disclosureTxHash: payload.chain.disclosureTxHash || null,
      requestId: payload.chain.requestId,
      commitment: payload.chain.commitment,
    },
  })
}

export function parsePortableDisclosureProof(input: unknown): PortableDisclosureProofV1 | null {
  if (!input || typeof input !== "object") {
    return null
  }

  const value = input as Record<string, unknown>

  if (
    value.kind === PORTABLE_DISCLOSURE_PROOF_KIND &&
    value.version === PORTABLE_DISCLOSURE_PROOF_VERSION &&
    typeof value.program === "string" &&
    typeof value.proofId === "string" &&
    value.subject &&
    typeof value.subject === "object" &&
    value.statement &&
    typeof value.statement === "object" &&
    value.chain &&
    typeof value.chain === "object" &&
    typeof value.proofDigest === "string"
  ) {
    const subject = value.subject as Record<string, unknown>
    const statement = value.statement as Record<string, unknown>
    const chain = value.chain as Record<string, unknown>

    if (
      typeof subject.ownerAddress === "string" &&
      typeof chain.paymentTxHash === "string" &&
      typeof chain.requestId === "string" &&
      typeof chain.commitment === "string" &&
      (statement.actorRole === "payer" || statement.actorRole === "receiver") &&
      (statement.proofType === "existence" || statement.proofType === "amount" || statement.proofType === "threshold")
    ) {
      return {
        kind: PORTABLE_DISCLOSURE_PROOF_KIND,
        version: PORTABLE_DISCLOSURE_PROOF_VERSION,
        program: value.program,
        proofId: value.proofId,
        subject: {
          ownerAddress: subject.ownerAddress,
          proverAddress:
            typeof subject.proverAddress === "string" || subject.proverAddress === null
              ? (subject.proverAddress as string | null)
              : null,
        },
        statement: {
          actorRole: statement.actorRole,
          proofType: statement.proofType,
          disclosedAmount:
            typeof statement.disclosedAmount === "string" || statement.disclosedAmount === null
              ? (statement.disclosedAmount as string | null)
              : null,
          thresholdAmount:
            typeof statement.thresholdAmount === "string" || statement.thresholdAmount === null
              ? (statement.thresholdAmount as string | null)
              : null,
          constraints:
            statement.constraints && typeof statement.constraints === "object"
              ? normalizeDisclosureConstraints(statement.constraints as DisclosureConstraints)
              : {},
        },
        chain: {
          paymentTxHash: chain.paymentTxHash,
          disclosureTxHash:
            typeof chain.disclosureTxHash === "string" || chain.disclosureTxHash === null
              ? (chain.disclosureTxHash as string | null)
              : null,
          requestId: chain.requestId,
          commitment: chain.commitment,
        },
        proofDigest: value.proofDigest,
      }
    }
  }

  if (
    typeof value.proofId === "string" &&
    typeof value.paymentTxHash === "string" &&
    typeof value.requestId === "string" &&
    typeof value.ownerAddress === "string" &&
    typeof value.commitment === "string" &&
    typeof value.proofDigest === "string"
  ) {
    const actorRole = value.actorRole === "receiver" ? "receiver" : "payer"
    const proofType =
      value.proofType === "amount" || value.proofType === "threshold" ? value.proofType : "existence"

    return buildSharedDisclosureProof({
      program: typeof value.program === "string" ? value.program : KLOAK_PROGRAM,
      proofId: value.proofId,
      paymentTxHash: value.paymentTxHash,
      disclosureTxHash:
        typeof value.disclosureTxHash === "string" || value.disclosureTxHash === null
          ? (value.disclosureTxHash as string | null)
          : null,
      requestId: value.requestId,
      ownerAddress: value.ownerAddress,
      proverAddress:
        typeof value.proverAddress === "string" || value.proverAddress === null
          ? (value.proverAddress as string | null)
          : null,
      commitment: value.commitment,
      actorRole,
      proofType,
      disclosedAmount:
        typeof value.disclosedAmount === "string" || value.disclosedAmount === null
          ? (value.disclosedAmount as string | null)
          : null,
      thresholdAmount:
        typeof value.thresholdAmount === "string" || value.thresholdAmount === null
          ? (value.thresholdAmount as string | null)
          : null,
      constraints:
        value.constraints && typeof value.constraints === "object"
          ? normalizeDisclosureConstraints(value.constraints as DisclosureConstraints)
          : {},
    })
  }

  return null
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
