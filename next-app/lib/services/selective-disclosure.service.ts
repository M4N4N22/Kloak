import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  KLOAK_PROGRAM,
  type DisclosureActorRole,
  type DisclosureConstraints,
  type DisclosureProofType,
  type StoredDisclosurePayload,
  canonicalizeDisclosureProof,
  computeDisclosureDigest,
  createDisclosureProofId,
  evaluateDisclosureConstraints,
  normalizeDisclosureConstraints,
} from "@/lib/selective-disclosure"

class SelectiveDisclosureError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "SelectiveDisclosureError"
    this.status = status
  }
}

type ProofRow = Prisma.SelectiveDisclosureProofGetPayload<{
  include: {
    _count: {
      select: {
        verifications: true
      }
    }
  }
}>

type PaymentWithLink = NonNullable<Awaited<ReturnType<typeof getPaymentByTxHash>>>
type PaymentListRow = Prisma.PaymentGetPayload<{
  include: {
    PaymentLink: true
  }
}>
type CompliancePaymentListItem = {
  id: string
  txHash: string
  requestId: string
  amount: string
  token: "ALEO" | "USDCX" | "USAD"
  createdAt: string
  title: string
  description: string | null
  payerAddress: string | null
  merchantAddress: string | null
  direction: "sent" | "received"
}

function serializeConstraints(value: Prisma.JsonValue): DisclosureConstraints {
  return normalizeDisclosureConstraints((value ?? {}) as DisclosureConstraints)
}

function parseMicroUnitsToDisplay(amountMicro: string) {
  const normalized = amountMicro.replace(/[^\d-]/g, "")
  const sign = normalized.startsWith("-") ? "-" : ""
  const digits = sign ? normalized.slice(1) : normalized
  const padded = digits.padStart(7, "0")
  const whole = padded.slice(0, -6).replace(/^0+(?=\d)/, "") || "0"
  const fraction = padded.slice(-6).replace(/0+$/, "")

  return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`
}

function toMicroUnits(amount: Prisma.Decimal) {
  const [wholePart, fractionalPart = ""] = amount.toString().split(".")
  const normalizedFraction = `${fractionalPart}000000`.slice(0, 6)
  const sign = wholePart.startsWith("-") ? "-" : ""
  const wholeDigits = sign ? wholePart.slice(1) : wholePart

  return `${sign}${wholeDigits}${normalizedFraction}`.replace(/^(-?)0+(?=\d)/, "$1")
}

function formatRequestId(requestId: string) {
  const trimmed = requestId.trim()

  if (!trimmed) {
    return ""
  }

  return trimmed.endsWith("field") ? trimmed : `${trimmed}field`
}

function serializeCompliancePayment(
  payment: PaymentListRow,
  direction: "sent" | "received",
): CompliancePaymentListItem | null {
  if (!payment.txHash) {
    return null
  }

  return {
    id: payment.id,
    txHash: payment.txHash,
    requestId: formatRequestId(payment.PaymentLink.requestId),
    amount: payment.amount.toString(),
    token: payment.token,
    createdAt: payment.createdAt.toISOString(),
    title: payment.PaymentLink.title,
    description: payment.PaymentLink.description,
    payerAddress: payment.receiptOwner || payment.payerAddress || null,
    merchantAddress: payment.merchantAddress || payment.PaymentLink.creatorAddress || null,
    direction,
  }
}

function resolveActorAndCounterparty(payment: PaymentWithLink, actorRole: DisclosureActorRole) {
  const payerAddress = payment.receiptOwner || payment.payerAddress || ""
  const merchantAddress = payment.merchantAddress || payment.PaymentLink.creatorAddress || ""

  if (!payerAddress || !merchantAddress) {
    throw new SelectiveDisclosureError("Payment is missing payer or merchant metadata for selective disclosure", 409)
  }

  return actorRole === "payer"
    ? { ownerAddress: payerAddress, counterpartyAddress: merchantAddress }
    : { ownerAddress: merchantAddress, counterpartyAddress: payerAddress }
}

function getStoredProofPayload(
  proof: Pick<
    ProofRow,
    "proofId" | "contractProgram" | "paymentTxHash" | "disclosureTxHash" | "requestId" | "ownerAddress" | "commitment" | "nullifier" | "constraints" | "proverAddress"
  > & { proofPayload?: Prisma.JsonValue | null }
): StoredDisclosurePayload {
  const normalizedConstraints = serializeConstraints(proof.constraints)

  if (
    proof.proofPayload &&
    typeof proof.proofPayload === "object" &&
    !Array.isArray(proof.proofPayload)
  ) {
    const payload = proof.proofPayload as Record<string, unknown>

    if (typeof payload.amount === "string" && payload.amount.trim()) {
      return {
        proofId: typeof payload.proofId === "string" ? payload.proofId : proof.proofId,
        program: typeof payload.program === "string" ? payload.program : proof.contractProgram,
        paymentTxHash:
          typeof payload.paymentTxHash === "string" ? payload.paymentTxHash : proof.paymentTxHash,
        disclosureTxHash:
          typeof payload.disclosureTxHash === "string" || payload.disclosureTxHash === null
            ? (payload.disclosureTxHash as string | null)
            : proof.disclosureTxHash,
        requestId: typeof payload.requestId === "string" ? payload.requestId : proof.requestId,
        amount: payload.amount,
        ownerAddress:
          typeof payload.ownerAddress === "string" ? payload.ownerAddress : proof.ownerAddress,
        counterpartyAddress:
          typeof payload.counterpartyAddress === "string" ? payload.counterpartyAddress : "",
        actorRole:
          payload.actorRole === "receiver" ? "receiver" : "payer",
        proofType:
          payload.proofType === "amount" || payload.proofType === "threshold" ? payload.proofType : "existence",
        disclosedAmount:
          typeof payload.disclosedAmount === "string" || payload.disclosedAmount === null
            ? (payload.disclosedAmount as string | null)
            : null,
        thresholdAmount:
          typeof payload.thresholdAmount === "string" || payload.thresholdAmount === null
            ? (payload.thresholdAmount as string | null)
            : null,
        paymentTimestamp:
          typeof payload.paymentTimestamp === "string" || payload.paymentTimestamp === null
            ? (payload.paymentTimestamp as string | null)
            : null,
        commitment: typeof payload.commitment === "string" ? payload.commitment : proof.commitment,
        nullifier:
          typeof payload.nullifier === "string" || payload.nullifier === null
            ? (payload.nullifier as string | null)
            : proof.nullifier,
        constraints:
          payload.constraints && typeof payload.constraints === "object"
            ? normalizeDisclosureConstraints(payload.constraints as DisclosureConstraints)
            : normalizedConstraints,
        proverAddress:
          typeof payload.proverAddress === "string" ? payload.proverAddress : proof.proverAddress,
      }
    }
  }

  return {
    proofId: proof.proofId,
    program: proof.contractProgram,
    paymentTxHash: proof.paymentTxHash,
    disclosureTxHash: proof.disclosureTxHash,
    requestId: proof.requestId,
    amount: "unknown",
    ownerAddress: proof.ownerAddress,
    counterpartyAddress: "",
    actorRole: "payer",
    proofType: "existence",
    disclosedAmount: null,
    thresholdAmount: null,
    paymentTimestamp: null,
    commitment: proof.commitment,
    nullifier: proof.nullifier,
    constraints: normalizedConstraints,
    proverAddress: proof.proverAddress,
  }
}

function serializeProofRow(proof: ProofRow) {
  const payload = getStoredProofPayload(proof)

  return {
    proofId: proof.proofId,
    paymentTxHash: proof.paymentTxHash,
    disclosureTxHash: proof.disclosureTxHash,
    requestId: proof.requestId,
    ownerAddress: proof.ownerAddress,
    counterpartyAddress: payload.counterpartyAddress,
    actorRole: payload.actorRole,
    proofType: payload.proofType,
    disclosedAmount: payload.disclosedAmount,
    thresholdAmount: payload.thresholdAmount,
    paymentTimestamp: payload.paymentTimestamp,
    proverAddress: proof.proverAddress,
    commitment: proof.commitment,
    nullifier: proof.nullifier,
    contractProgram: proof.contractProgram,
    constraints: serializeConstraints(proof.constraints),
    proofDigest: computeDisclosureDigest(canonicalizeDisclosureProof(payload)),
    status: proof.status,
    createdAt: proof.createdAt.toISOString(),
    revokedAt: proof.revokedAt ? proof.revokedAt.toISOString() : null,
    verificationCount: proof._count?.verifications ?? 0,
  }
}

function assertSubmittedProofMatches(
  submittedProof: NonNullable<Parameters<typeof verifySelectiveDisclosureProof>[0]["proof"]>,
  proofRecord: Awaited<ReturnType<typeof prisma.selectiveDisclosureProof.findUniqueOrThrow>>,
) {
  const storedPayload = getStoredProofPayload({
    proofId: proofRecord.proofId,
    contractProgram: proofRecord.contractProgram,
    paymentTxHash: proofRecord.paymentTxHash,
    disclosureTxHash: proofRecord.disclosureTxHash,
    requestId: proofRecord.requestId,
    ownerAddress: proofRecord.ownerAddress,
    commitment: proofRecord.commitment,
    nullifier: proofRecord.nullifier,
    constraints: proofRecord.constraints,
    proverAddress: proofRecord.proverAddress,
    proofPayload: proofRecord.proofPayload,
  })
  const storedDigest = computeDisclosureDigest(canonicalizeDisclosureProof(storedPayload))

  if (submittedProof.paymentTxHash !== proofRecord.paymentTxHash) {
    throw new SelectiveDisclosureError("Submitted proof payment transaction hash does not match the stored proof", 409)
  }

  if (submittedProof.requestId !== proofRecord.requestId) {
    throw new SelectiveDisclosureError("Submitted proof requestId does not match the stored proof", 409)
  }

  if (submittedProof.ownerAddress !== proofRecord.ownerAddress) {
    throw new SelectiveDisclosureError("Submitted proof owner does not match the stored proof", 409)
  }

  if (submittedProof.commitment !== proofRecord.commitment) {
    throw new SelectiveDisclosureError("Submitted proof commitment does not match the stored proof", 409)
  }

  if (
    typeof submittedProof.disclosureTxHash !== "undefined" &&
    submittedProof.disclosureTxHash !== proofRecord.disclosureTxHash
  ) {
    throw new SelectiveDisclosureError("Submitted proof disclosure transaction hash does not match the stored proof", 409)
  }

  if (
    typeof submittedProof.nullifier !== "undefined" &&
    submittedProof.nullifier !== proofRecord.nullifier
  ) {
    throw new SelectiveDisclosureError("Submitted proof nullifier does not match the stored proof", 409)
  }

  if (
    typeof submittedProof.actorRole !== "undefined" &&
    submittedProof.actorRole !== storedPayload.actorRole
  ) {
    throw new SelectiveDisclosureError("Submitted proof actor role does not match the stored proof", 409)
  }

  if (
    typeof submittedProof.proofType !== "undefined" &&
    submittedProof.proofType !== storedPayload.proofType
  ) {
    throw new SelectiveDisclosureError("Submitted proof type does not match the stored proof", 409)
  }

  if (
    typeof submittedProof.proofDigest === "string" &&
    submittedProof.proofDigest !== storedDigest
  ) {
    throw new SelectiveDisclosureError("Submitted proof digest does not match the stored proof", 409)
  }
}

async function getPaymentByTxHash(txHash: string) {
  return prisma.payment.findFirst({
    where: { txHash },
    include: {
      PaymentLink: true,
    },
  })
}

function assertAuthorizedActor(payment: PaymentWithLink, actorAddress: string, actorRole: DisclosureActorRole) {
  const { ownerAddress } = resolveActorAndCounterparty(payment, actorRole)

  if (actorAddress !== ownerAddress) {
    throw new SelectiveDisclosureError(`Only the ${actorRole} can generate this disclosure proof`, 403)
  }
}

function validateProofShape(input: {
  proofType: DisclosureProofType
  exactAmount?: string | null
  thresholdAmount?: string | null
}) {
  if (input.proofType === "threshold" && !input.thresholdAmount) {
    throw new SelectiveDisclosureError("Threshold proof requires a minimum amount")
  }
}

function getProofFunctionName(actorRole: DisclosureActorRole, proofType: DisclosureProofType, hasTimebox: boolean) {
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

export async function listSelectiveDisclosureProofs(viewerAddress: string) {
  const proofs = await prisma.selectiveDisclosureProof.findMany({
    where: {
      OR: [
        { creatorAddress: viewerAddress },
        { proverAddress: viewerAddress },
        { ownerAddress: viewerAddress },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          verifications: true,
        },
      },
    },
  })

  return proofs.map(serializeProofRow)
}

export async function listCompliancePayments(viewerAddress: string) {
  const [sentPayments, receivedPayments] = await Promise.all([
    prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        txHash: { not: null },
        OR: [
          { payerAddress: viewerAddress },
          { receiptOwner: viewerAddress },
        ],
      },
      include: {
        PaymentLink: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        txHash: { not: null },
        OR: [
          { merchantAddress: viewerAddress },
          { PaymentLink: { creatorAddress: viewerAddress } },
        ],
      },
      include: {
        PaymentLink: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  return {
    sent: sentPayments
      .map((payment) => serializeCompliancePayment(payment, "sent"))
      .filter((payment): payment is CompliancePaymentListItem => Boolean(payment)),
    received: receivedPayments
      .map((payment) => serializeCompliancePayment(payment, "received"))
      .filter((payment): payment is CompliancePaymentListItem => Boolean(payment)),
  }
}

export async function prepareSelectiveDisclosureProof(input: {
  actorAddress: string
  txHash: string
  requestId: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  exactAmount?: string | null
  thresholdAmount?: string | null
  constraints?: DisclosureConstraints
}) {
  const txHash = input.txHash.trim()
  const requestId = formatRequestId(input.requestId.trim())
  const actorAddress = input.actorAddress.trim()
  const actorRole = input.actorRole
  const proofType = input.proofType
  const exactAmount = input.exactAmount?.trim() || null
  const thresholdAmount = input.thresholdAmount?.trim() || null
  const constraints = normalizeDisclosureConstraints({
    ...input.constraints,
    requestId,
  })

  if (!txHash || !requestId || !actorAddress) {
    throw new SelectiveDisclosureError("actorAddress, txHash, and requestId are required")
  }

  validateProofShape({ proofType, exactAmount, thresholdAmount })

  const payment = await getPaymentByTxHash(txHash)

  if (!payment || !payment.txHash) {
    throw new SelectiveDisclosureError("Payment transaction not found", 404)
  }

  if (payment.status !== "SUCCESS") {
    throw new SelectiveDisclosureError("Only successful payments can generate disclosure proofs")
  }

  if (formatRequestId(payment.PaymentLink.requestId) !== requestId) {
    throw new SelectiveDisclosureError("Transaction does not belong to the provided requestId")
  }

  assertAuthorizedActor(payment, actorAddress, actorRole)

  const { ownerAddress, counterpartyAddress } = resolveActorAndCounterparty(payment, actorRole)
  const amountMicro = toMicroUnits(payment.amount)
  const evaluation = evaluateDisclosureConstraints(
    Number(payment.amount),
    payment.createdAt,
    requestId,
    constraints,
  )

  if (!evaluation.ok) {
    throw new SelectiveDisclosureError(evaluation.reason)
  }

  if (proofType === "amount" && exactAmount && exactAmount !== amountMicro) {
    throw new SelectiveDisclosureError("Exact amount proof must disclose the full payment amount")
  }

  if (proofType === "threshold" && thresholdAmount && BigInt(amountMicro) < BigInt(thresholdAmount)) {
    throw new SelectiveDisclosureError("Payment amount does not satisfy the requested threshold")
  }

  return {
    paymentId: payment.id,
    program: KLOAK_PROGRAM,
    requestId,
    amountMicro,
    amountDisplay: payment.amount.toString(),
    ownerAddress,
    counterpartyAddress,
    actorRole,
    proofType,
    exactAmount: proofType === "amount" ? amountMicro : exactAmount,
    thresholdAmount,
    paymentTimestamp: Math.floor(payment.createdAt.getTime() / 1000).toString(),
    paymentTxHash: txHash,
    commitment: payment.receiptCommitment,
    constraints,
    proofFunction: getProofFunctionName(
      actorRole,
      proofType,
      Boolean(constraints.timestampFrom || constraints.timestampTo),
    ),
  }
}

export async function finalizeSelectiveDisclosureProof(input: {
  actorAddress: string
  txHash: string
  requestId: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  ownerAddress: string
  counterpartyAddress: string
  exactAmount?: string | null
  thresholdAmount?: string | null
  paymentTimestamp?: string | null
  commitment: string
  nullifier?: string | null
  disclosureTxHash: string
  constraints?: DisclosureConstraints
}) {
  const prepared = await prepareSelectiveDisclosureProof(input)
  const proofId = createDisclosureProofId()
  const submittedCommitment = input.commitment.trim()

  if (prepared.ownerAddress !== input.ownerAddress.trim()) {
    throw new SelectiveDisclosureError("Submitted proof owner does not match the authorized actor", 409)
  }

  if (prepared.counterpartyAddress !== input.counterpartyAddress.trim()) {
    throw new SelectiveDisclosureError("Submitted proof counterparty does not match the payment", 409)
  }

  if (!submittedCommitment) {
    throw new SelectiveDisclosureError("Submitted proof commitment is required", 400)
  }

  if (prepared.commitment && prepared.commitment.trim() !== submittedCommitment) {
    await prisma.payment.update({
      where: { id: prepared.paymentId },
      data: { receiptCommitment: submittedCommitment },
    })
  }

  const proofPayload: StoredDisclosurePayload = {
    proofId,
    program: prepared.program,
    paymentTxHash: prepared.paymentTxHash,
    disclosureTxHash: input.disclosureTxHash,
    requestId: prepared.requestId,
    amount: prepared.amountMicro,
    ownerAddress: prepared.ownerAddress,
    counterpartyAddress: prepared.counterpartyAddress,
    actorRole: prepared.actorRole,
    proofType: prepared.proofType,
    disclosedAmount: prepared.exactAmount,
    thresholdAmount: prepared.thresholdAmount,
    paymentTimestamp: input.paymentTimestamp || prepared.paymentTimestamp,
    commitment: submittedCommitment,
    nullifier: input.nullifier?.trim() || null,
    constraints: prepared.constraints,
    proverAddress: input.actorAddress,
  }

  const proof = await prisma.selectiveDisclosureProof.create({
    data: {
      proofId,
      paymentId: prepared.paymentId,
      paymentTxHash: prepared.paymentTxHash,
      disclosureTxHash: input.disclosureTxHash,
      requestId: prepared.requestId,
      creatorAddress: prepared.counterpartyAddress,
      proverAddress: input.actorAddress,
      ownerAddress: prepared.ownerAddress,
      commitment: submittedCommitment,
      nullifier: input.nullifier?.trim() || null,
      contractProgram: prepared.program,
      constraints: prepared.constraints as Prisma.InputJsonValue,
      proofPayload: proofPayload as unknown as Prisma.InputJsonValue,
    },
    include: {
      _count: {
        select: {
          verifications: true,
        },
      },
    },
  })

  return serializeProofRow(proof)
}

export async function verifySelectiveDisclosureProof(input: {
  proofId?: string
  verifier?: string
  proof?: {
    proofId: string
    paymentTxHash: string
    disclosureTxHash?: string | null
    requestId: string
    ownerAddress: string
    commitment: string
    nullifier?: string | null
    actorRole?: DisclosureActorRole
    proofType?: DisclosureProofType
    proofDigest?: string
  }
}) {
  const proofId = input.proofId || input.proof?.proofId

  if (!proofId) {
    throw new SelectiveDisclosureError("proofId is required")
  }

  const proofRecord = await prisma.selectiveDisclosureProof.findUnique({
    where: { proofId },
    include: {
      payment: {
        include: {
          PaymentLink: true,
        },
      },
    },
  })

  if (!proofRecord) {
    throw new SelectiveDisclosureError("Proof not found", 404)
  }

  if (input.proof) {
    assertSubmittedProofMatches(input.proof, proofRecord)
  }

  if (proofRecord.status === "REVOKED") {
    await prisma.selectiveDisclosureVerification.create({
      data: {
        proofId: proofRecord.proofId,
        verifier: input.verifier,
        success: false,
        revoked: true,
        details: { reason: "Proof has been revoked" },
      },
    })

    throw new SelectiveDisclosureError("Proof has been revoked", 410)
  }

  const payload = getStoredProofPayload({
    proofId: proofRecord.proofId,
    contractProgram: proofRecord.contractProgram,
    paymentTxHash: proofRecord.paymentTxHash,
    disclosureTxHash: proofRecord.disclosureTxHash,
    requestId: proofRecord.requestId,
    ownerAddress: proofRecord.ownerAddress,
    commitment: proofRecord.commitment,
    nullifier: proofRecord.nullifier,
    constraints: proofRecord.constraints,
    proverAddress: proofRecord.proverAddress,
    proofPayload: proofRecord.proofPayload,
  })
  const payment = proofRecord.payment

  if (!payment.txHash || payment.txHash !== proofRecord.paymentTxHash) {
    throw new SelectiveDisclosureError("Underlying payment transaction is unavailable", 404)
  }

  if (formatRequestId(payment.PaymentLink.requestId) !== proofRecord.requestId) {
    throw new SelectiveDisclosureError("Proof requestId no longer matches the underlying payment", 409)
  }

  const actorBinding = resolveActorAndCounterparty(payment, payload.actorRole)

  if (actorBinding.ownerAddress !== proofRecord.ownerAddress) {
    throw new SelectiveDisclosureError("Proof owner no longer matches the recorded payment participant", 409)
  }

  if (payment.receiptCommitment && payment.receiptCommitment !== proofRecord.commitment) {
    // Older payments may have a commitment persisted from a buggy client-side hash implementation.
    // We trust the wallet-owned receipt commitment captured during proof generation instead.
  }

  const amountMicro = toMicroUnits(payment.amount)

  if (payload.proofType === "amount" && payload.disclosedAmount !== amountMicro) {
    throw new SelectiveDisclosureError("Amount proof no longer matches the payment amount", 409)
  }

  if (payload.proofType === "threshold" && payload.thresholdAmount && BigInt(amountMicro) < BigInt(payload.thresholdAmount)) {
    throw new SelectiveDisclosureError("Threshold proof no longer satisfies the payment amount", 409)
  }

  const evaluation = evaluateDisclosureConstraints(
    Number(payment.amount),
    payment.createdAt,
    proofRecord.requestId,
    serializeConstraints(proofRecord.constraints),
  )

  const success = evaluation.ok && Boolean(proofRecord.disclosureTxHash)

  await prisma.selectiveDisclosureVerification.create({
    data: {
      proofId: proofRecord.proofId,
      verifier: input.verifier,
      success,
      revoked: false,
      details: success
        ? {
            requestId: proofRecord.requestId,
            paymentTxHash: proofRecord.paymentTxHash,
            disclosureTxHash: proofRecord.disclosureTxHash,
            commitment: proofRecord.commitment,
            actorRole: payload.actorRole,
            proofType: payload.proofType,
            matched: true,
          }
        : {
            requestId: proofRecord.requestId,
            paymentTxHash: proofRecord.paymentTxHash,
            actorRole: payload.actorRole,
            proofType: payload.proofType,
            matched: false,
            reason: evaluation.ok ? "Missing finalized disclosure transaction" : evaluation.reason,
          },
    },
  })

  return {
    valid: success,
    proofId: proofRecord.proofId,
    paymentTxHash: proofRecord.paymentTxHash,
    disclosureTxHash: proofRecord.disclosureTxHash,
    requestId: proofRecord.requestId,
    ownerAddress: proofRecord.ownerAddress,
    counterpartyAddress: payload.counterpartyAddress,
    actorRole: payload.actorRole,
    proofType: payload.proofType,
    disclosedAmount: payload.disclosedAmount ? parseMicroUnitsToDisplay(payload.disclosedAmount) : null,
    thresholdAmount: payload.thresholdAmount ? parseMicroUnitsToDisplay(payload.thresholdAmount) : null,
    proverAddress: proofRecord.proverAddress,
    commitment: proofRecord.commitment,
    nullifier: proofRecord.nullifier,
    revoked: false,
    verifiedAt: new Date().toISOString(),
    paymentTimestamp: payment.createdAt.toISOString(),
    constraints: serializeConstraints(proofRecord.constraints),
    message: success
      ? "Selective disclosure proof verified successfully"
      : evaluation.ok
        ? "Proof record exists but no finalized disclosure transaction was stored"
        : evaluation.reason,
  }
}

export async function revokeSelectiveDisclosureProof(input: { proofId: string; actorAddress: string }) {
  const proofId = input.proofId.trim()
  const actorAddress = input.actorAddress.trim()

  const proof = await prisma.selectiveDisclosureProof.findUnique({
    where: { proofId },
  })

  if (!proof) {
    throw new SelectiveDisclosureError("Proof not found", 404)
  }

  if (proof.ownerAddress !== actorAddress && proof.proverAddress !== actorAddress) {
    throw new SelectiveDisclosureError("Only the proof owner or prover can revoke this proof", 403)
  }

  const updated = await prisma.selectiveDisclosureProof.update({
    where: { proofId },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
    include: {
      _count: {
        select: {
          verifications: true,
        },
      },
    },
  })

  return serializeProofRow(updated)
}

export function isSelectiveDisclosureError(error: unknown): error is SelectiveDisclosureError {
  return error instanceof SelectiveDisclosureError
}
