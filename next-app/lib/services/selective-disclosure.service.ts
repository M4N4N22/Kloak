import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { decryptJsonAtRest, encryptJsonAtRest } from "@/lib/at-rest-encryption"
import { verifyProofPackageAgainstPublicChain } from "@/lib/aleo-chain-verifier"
import { validatePaymentTransactionForLink } from "@/lib/payment-chain-validation"
import { validatePortableDisclosureProofPackage } from "@/lib/portable-proof-verifier"
import { recordPayment } from "@/lib/services/payment.service"
import {
  KLOAK_PROGRAM,
  buildSharedDisclosureProof,
  canonicalizeDisclosureStatement,
  type DisclosureActorRole,
  type DisclosureConstraints,
  type DisclosureProofType,
  type DisclosureStatement,
  type PortableDisclosureProofV1,
  type StoredDisclosurePayload,
  createDisclosureProofId,
  evaluateDisclosureConstraints,
  getDisclosureProofFunctionName,
  normalizeDisclosureConstraints,
} from "@/lib/selective-disclosure"

class SelectiveDisclosureError extends Error {
  status: number
  details?: Record<string, unknown>

  constructor(message: string, status = 400, details?: Record<string, unknown>) {
    super(message)
    this.name = "SelectiveDisclosureError"
    this.status = status
    this.details = details
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
  direction: "sent" | "received"
  paymentSource: "wallet" | "server"
  walletReceipt?: WalletReceiptInput
}
type CompliancePaymentDiagnostic = {
  id: string
  direction: "sent" | "received"
  requestId: string
  commitment: string
  amount: string
  paymentTimestamp: string
  title: string
  message: string
  actionLabel: string
  reasonCode: "REQUEST_NOT_INDEXED" | "PAYMENT_NOT_SYNCED" | "PAYMENT_NOT_READY"
  walletReceipt: WalletReceiptInput
}
type WalletReceiptInput = {
  requestId?: string
  actorRole?: DisclosureActorRole
  ownerAddress: string
  counterpartyAddress: string
  commitment: string
  paymentTimestamp: string
  amountMicro: string
}

type DuplicateProofMatch = {
  proofId: string
  proofType: DisclosureProofType
  actorRole: DisclosureActorRole
  createdAt: string
  disclosureTxHash: string | null
}

type VerificationChecks = {
  packageIntegrity: boolean
  publicChainPaymentTransaction: boolean
  publicChainDisclosureTransaction: boolean
  publicChainDisclosureMatch: boolean
  kloakRecordFound: boolean
  kloakRevocationChecked: boolean
  kloakPaymentHistoryChecked: boolean
}

function serializeConstraints(value: Prisma.JsonValue): DisclosureConstraints {
  return normalizeDisclosureConstraints((value ?? {}) as DisclosureConstraints)
}

function buildDisclosureStatement(input: {
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  constraints: DisclosureConstraints
  exactAmount?: string | null
  thresholdAmount?: string | null
}): DisclosureStatement {
  return {
    actorRole: input.actorRole,
    proofType: input.proofType,
    disclosedAmount: input.proofType === "amount" ? input.exactAmount || null : null,
    thresholdAmount: input.proofType === "threshold" ? input.thresholdAmount || null : null,
    constraints: normalizeDisclosureConstraints(input.constraints),
  }
}

function getDisclosureStatementSignature(statement: DisclosureStatement) {
  return canonicalizeDisclosureStatement(statement)
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
  options?: {
    paymentSource?: "wallet" | "server"
    walletReceipt?: WalletReceiptInput
  },
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
    direction,
    paymentSource: options?.paymentSource || "server",
    walletReceipt: options?.walletReceipt,
  }
}

function normalizeWalletReceiptInput(input: WalletReceiptInput, actorRole: DisclosureActorRole) {
  return {
    requestId: formatRequestId(input.requestId?.trim() || ""),
    actorRole,
    ownerAddress: input.ownerAddress.trim(),
    counterpartyAddress: input.counterpartyAddress.trim(),
    commitment: input.commitment.trim(),
    paymentTimestamp: input.paymentTimestamp.trim(),
    amountMicro: input.amountMicro.trim(),
  } satisfies WalletReceiptInput
}

async function getPaymentByCommitment(commitment: string) {
  return prisma.payment.findFirst({
    where: { receiptCommitment: commitment },
    include: {
      PaymentLink: true,
    },
  })
}

async function getPaymentByWalletReceipt(input: {
  requestId: string
  actorRole: DisclosureActorRole
  walletReceipt: WalletReceiptInput
}) {
  const directMatch = await getPaymentByCommitment(input.walletReceipt.commitment)

  if (directMatch) {
    return directMatch
  }

  const requestId = formatRequestId(input.requestId)
  const paymentTimestampMs = Number(input.walletReceipt.paymentTimestamp) * 1000
  const paymentAmount = new Prisma.Decimal(parseMicroUnitsToDisplay(input.walletReceipt.amountMicro))
  const merchantAddress =
    input.actorRole === "receiver"
      ? input.walletReceipt.ownerAddress
      : input.walletReceipt.counterpartyAddress

  const candidates = await prisma.payment.findMany({
    where: {
      status: "SUCCESS",
      txHash: { not: null },
      amount: paymentAmount,
      PaymentLink: {
        requestId,
        creatorAddress: merchantAddress,
      },
    },
    include: {
      PaymentLink: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  if (candidates.length === 0) {
    return null
  }

  return candidates
    .map((candidate) => ({
      candidate,
      timestampDistance: Math.abs(candidate.createdAt.getTime() - paymentTimestampMs),
    }))
    .sort((a, b) => a.timestampDistance - b.timestampDistance)[0]?.candidate ?? null
}

async function reconcileWalletCompliancePayment(input: {
  viewerAddress: string
  walletReceipt: WalletReceiptInput
}) {
  const requestId = formatRequestId(input.walletReceipt.requestId?.trim() || "")
  const actorRole = input.walletReceipt.actorRole === "receiver" ? "receiver" : "payer"

  if (!requestId || input.walletReceipt.ownerAddress.trim() !== input.viewerAddress.trim()) {
    return null
  }

  const payment = await getPaymentByWalletReceipt({
    requestId,
    actorRole,
    walletReceipt: input.walletReceipt,
  })

  if (!payment || !payment.txHash || payment.status !== "SUCCESS") {
    return null
  }

  const normalizedCommitment = input.walletReceipt.commitment.trim()

  if (normalizedCommitment && payment.receiptCommitment !== normalizedCommitment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        receiptCommitment: normalizedCommitment,
      },
    })

    payment.receiptCommitment = normalizedCommitment
  }

  return serializeCompliancePayment(payment, actorRole === "receiver" ? "received" : "sent", {
    paymentSource: "wallet",
    walletReceipt: {
      requestId,
      actorRole,
      ownerAddress: input.walletReceipt.ownerAddress.trim(),
      counterpartyAddress: input.walletReceipt.counterpartyAddress.trim(),
      commitment: input.walletReceipt.commitment.trim(),
      paymentTimestamp: input.walletReceipt.paymentTimestamp.trim(),
      amountMicro: input.walletReceipt.amountMicro.trim(),
    },
  })
}

function getStoredProofPayload(
  proof: Pick<
    ProofRow,
    "proofId" | "contractProgram" | "paymentTxHash" | "disclosureTxHash" | "requestId" | "ownerAddress" | "commitment" | "nullifier" | "constraints" | "proverAddress"
  > & { proofPayload?: Prisma.JsonValue | null }
): StoredDisclosurePayload {
  const normalizedConstraints = serializeConstraints(proof.constraints)

  if (
    decryptJsonAtRest<Record<string, unknown>>(proof.proofPayload)
  ) {
    const payload = decryptJsonAtRest<Record<string, unknown>>(proof.proofPayload)!

    if (
      typeof payload.proofId === "string" &&
      typeof payload.program === "string" &&
      typeof payload.paymentTxHash === "string" &&
      typeof payload.requestId === "string" &&
      typeof payload.ownerAddress === "string" &&
      typeof payload.commitment === "string" &&
      typeof payload.proverAddress === "string"
    ) {
      return {
        proofId: payload.proofId,
        program: payload.program,
        paymentTxHash: payload.paymentTxHash,
        disclosureTxHash:
          typeof payload.disclosureTxHash === "string" || payload.disclosureTxHash === null
            ? (payload.disclosureTxHash as string | null)
            : proof.disclosureTxHash,
        requestId: payload.requestId,
        ownerAddress: payload.ownerAddress,
        counterpartyAddress:
          typeof payload.counterpartyAddress === "string" ? payload.counterpartyAddress : null,
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
        amount:
          typeof payload.amount === "string" || payload.amount === null
            ? (payload.amount as string | null)
            : null,
        commitment: payload.commitment,
        nullifier:
          typeof payload.nullifier === "string" || payload.nullifier === null
            ? (payload.nullifier as string | null)
            : proof.nullifier,
        constraints:
          payload.constraints && typeof payload.constraints === "object"
            ? normalizeDisclosureConstraints(payload.constraints as DisclosureConstraints)
            : normalizedConstraints,
        proverAddress: payload.proverAddress,
      }
    }
  }

  return {
    proofId: proof.proofId,
    program: proof.contractProgram,
    paymentTxHash: proof.paymentTxHash,
    disclosureTxHash: proof.disclosureTxHash,
    requestId: proof.requestId,
    ownerAddress: proof.ownerAddress,
    counterpartyAddress: null,
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

function getStoredProofStatement(
  proof: Pick<
    ProofRow,
    "proofId" | "contractProgram" | "paymentTxHash" | "disclosureTxHash" | "requestId" | "ownerAddress" | "commitment" | "nullifier" | "constraints" | "proverAddress"
  > & { proofPayload?: Prisma.JsonValue | null },
) {
  const payload = getStoredProofPayload(proof)

  return buildDisclosureStatement({
    actorRole: payload.actorRole,
    proofType: payload.proofType,
    exactAmount: payload.disclosedAmount,
    thresholdAmount: payload.thresholdAmount,
    constraints: payload.constraints,
  })
}

async function findActiveDuplicateProof(input: {
  paymentId: string
  ownerAddress: string
  actorRole: DisclosureActorRole
  proofType: DisclosureProofType
  constraints: DisclosureConstraints
  exactAmount?: string | null
  thresholdAmount?: string | null
}) {
  const activeProofs = await prisma.selectiveDisclosureProof.findMany({
    where: {
      paymentId: input.paymentId,
      ownerAddress: input.ownerAddress,
      status: "ACTIVE",
    },
    select: {
      proofId: true,
      proofPayload: true,
      disclosureTxHash: true,
      createdAt: true,
      constraints: true,
      contractProgram: true,
      paymentTxHash: true,
      requestId: true,
      commitment: true,
      nullifier: true,
      proverAddress: true,
      ownerAddress: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const targetStatement = getDisclosureStatementSignature(
    buildDisclosureStatement({
      actorRole: input.actorRole,
      proofType: input.proofType,
      exactAmount: input.exactAmount,
      thresholdAmount: input.thresholdAmount,
      constraints: input.constraints,
    }),
  )

  const duplicate = activeProofs.find((proof) => {
    const statement = getStoredProofStatement(proof)
    return getDisclosureStatementSignature(statement) === targetStatement
  })

  if (!duplicate) return null

  return {
    proofId: duplicate.proofId,
    proofType: input.proofType,
    actorRole: input.actorRole,
    createdAt: duplicate.createdAt.toISOString(),
    disclosureTxHash: duplicate.disclosureTxHash,
  } satisfies DuplicateProofMatch
}

function serializeProofRow(proof: ProofRow) {
  const payload = getStoredProofPayload(proof)
  const hasDisclosedTimeRange = Boolean(
    payload.constraints.timestampFrom || payload.constraints.timestampTo,
  )
  const shouldHideExactTimestamp = payload.proofType !== "amount" || hasDisclosedTimeRange
  const portableProof = buildSharedDisclosureProof({
    program: proof.contractProgram,
    proofId: proof.proofId,
    paymentTxHash: proof.paymentTxHash,
    disclosureTxHash: proof.disclosureTxHash,
    requestId: proof.requestId,
    ownerAddress: proof.ownerAddress,
    proverAddress: proof.proverAddress,
    commitment: proof.commitment,
    actorRole: payload.actorRole,
    proofType: payload.proofType,
    disclosedAmount: payload.disclosedAmount,
    thresholdAmount: payload.thresholdAmount,
    constraints: serializeConstraints(proof.constraints),
  })

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
    paymentTimestamp: shouldHideExactTimestamp ? null : payload.paymentTimestamp,
    proverAddress: proof.proverAddress,
    commitment: proof.commitment,
    nullifier: proof.nullifier,
    contractProgram: proof.contractProgram,
    constraints: serializeConstraints(proof.constraints),
    proofDigest: portableProof.proofDigest,
    status: proof.status,
    createdAt: proof.createdAt.toISOString(),
    revokedAt: proof.revokedAt ? proof.revokedAt.toISOString() : null,
    verificationCount: proof._count?.verifications ?? 0,
  }
}

function assertSubmittedProofMatches(
  submittedProof: PortableDisclosureProofV1,
  proofRecord: Awaited<ReturnType<typeof prisma.selectiveDisclosureProof.findUniqueOrThrow>>,
) {
  const packageValidation = validatePortableDisclosureProofPackage(submittedProof)

  if (!packageValidation.ok) {
    throw new SelectiveDisclosureError(packageValidation.reason, 409)
  }

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
  const storedProof = buildSharedDisclosureProof({
    program: proofRecord.contractProgram,
    proofId: proofRecord.proofId,
    paymentTxHash: proofRecord.paymentTxHash,
    disclosureTxHash: proofRecord.disclosureTxHash,
    requestId: proofRecord.requestId,
    ownerAddress: proofRecord.ownerAddress,
    proverAddress: proofRecord.proverAddress,
    commitment: proofRecord.commitment,
    actorRole: storedPayload.actorRole,
    proofType: storedPayload.proofType,
    disclosedAmount: storedPayload.disclosedAmount,
      thresholdAmount: storedPayload.thresholdAmount,
      constraints: serializeConstraints(proofRecord.constraints),
  })

  if (submittedProof.chain.paymentTxHash !== proofRecord.paymentTxHash) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the payment linked to this proof.",
      409,
    )
  }

  if (submittedProof.chain.requestId !== proofRecord.requestId) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the request linked to this proof.",
      409,
    )
  }

  if (submittedProof.subject.ownerAddress !== proofRecord.ownerAddress) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the wallet that owns this proof.",
      409,
    )
  }

  if (submittedProof.chain.commitment !== proofRecord.commitment) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original proof record.",
      409,
    )
  }

  if (
    typeof submittedProof.chain.disclosureTxHash !== "undefined" &&
    submittedProof.chain.disclosureTxHash !== proofRecord.disclosureTxHash
  ) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original proof transaction.",
      409,
    )
  }

  if (submittedProof.statement.actorRole !== storedPayload.actorRole) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original proof details.",
      409,
    )
  }

  if (submittedProof.statement.proofType !== storedPayload.proofType) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original proof details.",
      409,
    )
  }

  if (submittedProof.program !== storedProof.program) {
    throw new SelectiveDisclosureError(
      "This proof package was created for a different program.",
      409,
    )
  }

  if (
    typeof submittedProof.subject.proverAddress === "string" &&
    submittedProof.subject.proverAddress !== proofRecord.proverAddress
  ) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original proof details.",
      409,
    )
  }

  if (
    submittedProof.statement.disclosedAmount !== storedProof.statement.disclosedAmount ||
    submittedProof.statement.thresholdAmount !== storedProof.statement.thresholdAmount
  ) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original disclosed amount.",
      409,
    )
  }

  if (
    canonicalizeDisclosureStatement(submittedProof.statement) !==
    canonicalizeDisclosureStatement(storedProof.statement)
  ) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original disclosure statement.",
      409,
    )
  }

  if (submittedProof.proofDigest !== storedProof.proofDigest) {
    throw new SelectiveDisclosureError(
      "This proof package does not match the original proof record.",
      409,
    )
  }
}

async function buildPortablePackageVerificationResult(input: {
  proof: PortableDisclosureProofV1
}) {
  const publicChain = await verifyProofPackageAgainstPublicChain(input.proof)

  return {
    valid: publicChain.status !== "mismatch",
    verificationMode: "portable-package" as const,
    kloakVerified: false,
    publicChainStatus: publicChain.status,
    publicChainMessage: publicChain.message,
    recordStatus: "missing" as const,
    recordMessage:
      "Kloak could not find a matching proof record, so revocation and verification history were not checked here.",
    verificationChecks: {
      packageIntegrity: true,
      publicChainPaymentTransaction: publicChain.checks.paymentTransactionFound,
      publicChainDisclosureTransaction: publicChain.checks.disclosureTransactionFound,
      publicChainDisclosureMatch: publicChain.checks.disclosureFunctionMatched,
      kloakRecordFound: false,
      kloakRevocationChecked: false,
      kloakPaymentHistoryChecked: false,
    } satisfies VerificationChecks,
    proofId: input.proof.proofId,
    paymentTxHash: input.proof.chain.paymentTxHash,
    disclosureTxHash: input.proof.chain.disclosureTxHash || null,
    requestId: input.proof.chain.requestId,
    ownerAddress: input.proof.subject.ownerAddress,
    counterpartyAddress: null,
    actorRole: input.proof.statement.actorRole,
    proofType: input.proof.statement.proofType,
    disclosedAmount: input.proof.statement.disclosedAmount
      ? parseMicroUnitsToDisplay(input.proof.statement.disclosedAmount)
      : null,
    thresholdAmount: input.proof.statement.thresholdAmount
      ? parseMicroUnitsToDisplay(input.proof.statement.thresholdAmount)
      : null,
    proverAddress: input.proof.subject.proverAddress || input.proof.subject.ownerAddress,
    commitment: input.proof.chain.commitment,
    nullifier: null,
    revoked: false,
    verifiedAt: new Date().toISOString(),
    paymentTimestamp: null,
    constraints: input.proof.statement.constraints,
    message:
      publicChain.status === "verified"
        ? "The proof package passed its integrity check, and the referenced payment and disclosure transactions were confirmed on the public chain."
        : publicChain.status === "unavailable"
          ? "The proof package passed its integrity check. Public chain checks were temporarily unavailable, so Kloak could only confirm the package itself in this mode."
          : publicChain.message,
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

async function getPaymentLinkByWalletReceipt(input: {
  requestId: string
  actorRole: DisclosureActorRole
  walletReceipt: WalletReceiptInput
}) {
  const normalizedRequestId = input.requestId.endsWith("field")
    ? input.requestId
    : `${input.requestId}field`
  const merchantAddress =
    input.actorRole === "receiver"
      ? input.walletReceipt.ownerAddress
      : input.walletReceipt.counterpartyAddress

  return prisma.paymentLink.findFirst({
    where: {
      requestId: normalizedRequestId,
      creatorAddress: merchantAddress,
    },
  })
}

async function buildWalletReceiptDiagnostic(input: {
  viewerAddress: string
  walletReceipt: WalletReceiptInput
}): Promise<CompliancePaymentDiagnostic | null> {
  const requestId = formatRequestId(input.walletReceipt.requestId?.trim() || "")
  const actorRole = input.walletReceipt.actorRole === "receiver" ? "receiver" : "payer"
  const normalizedWalletReceipt = normalizeWalletReceiptInput(input.walletReceipt, actorRole)

  if (!requestId || input.walletReceipt.ownerAddress.trim() !== input.viewerAddress.trim()) {
    return null
  }

  const payment = await getPaymentByWalletReceipt({
    requestId,
    actorRole,
    walletReceipt: input.walletReceipt,
  })

  if (payment?.txHash && payment.status === "SUCCESS") {
    return null
  }

  const linkedRequest = await getPaymentLinkByWalletReceipt({
    requestId,
    actorRole,
    walletReceipt: input.walletReceipt,
  })

  const paymentAmount = new Prisma.Decimal(parseMicroUnitsToDisplay(input.walletReceipt.amountMicro))
  const merchantAddress =
    actorRole === "receiver"
      ? input.walletReceipt.ownerAddress.trim()
      : input.walletReceipt.counterpartyAddress.trim()

  const relatedPayments = linkedRequest
    ? await prisma.payment.findMany({
        where: {
          amount: paymentAmount,
          PaymentLink: {
            requestId,
            creatorAddress: merchantAddress,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      })
    : []

  if (!linkedRequest) {
    return {
      id: input.walletReceipt.commitment.trim(),
      direction: actorRole === "receiver" ? "received" : "sent",
      requestId,
      commitment: input.walletReceipt.commitment.trim(),
      amount: parseMicroUnitsToDisplay(input.walletReceipt.amountMicro),
      paymentTimestamp: new Date(Number(input.walletReceipt.paymentTimestamp.trim()) * 1000).toISOString(),
      title: "This receipt is not linked to a Kloak request yet",
      message:
        "We found the receipt in your wallet, but Kloak does not currently have the matching payment request indexed for it. This can happen if the payment came from older test data or a different app environment.",
      actionLabel: "Use a payment made through the current Kloak app, or resync after switching to the matching environment.",
      reasonCode: "REQUEST_NOT_INDEXED",
      walletReceipt: normalizedWalletReceipt,
    }
  }

  if (relatedPayments.length === 0) {
    return {
      id: input.walletReceipt.commitment.trim(),
      direction: actorRole === "receiver" ? "received" : "sent",
      requestId,
      commitment: input.walletReceipt.commitment.trim(),
      amount: parseMicroUnitsToDisplay(input.walletReceipt.amountMicro),
      paymentTimestamp: new Date(Number(input.walletReceipt.paymentTimestamp.trim()) * 1000).toISOString(),
      title: "This payment has not finished syncing into Kloak yet",
      message:
        "The receipt exists in your wallet and the request is known to Kloak, but the settled payment row is not recorded yet. This usually happens if the app was closed before the post-payment sync finished.",
      actionLabel: "Paste the original payment transaction hash below to recover this payment into Kloak without paying again.",
      reasonCode: "PAYMENT_NOT_SYNCED",
      walletReceipt: normalizedWalletReceipt,
    }
  }

  return {
    id: input.walletReceipt.commitment.trim(),
    direction: actorRole === "receiver" ? "received" : "sent",
    requestId,
    commitment: input.walletReceipt.commitment.trim(),
    amount: parseMicroUnitsToDisplay(input.walletReceipt.amountMicro),
    paymentTimestamp: new Date(Number(input.walletReceipt.paymentTimestamp.trim()) * 1000).toISOString(),
    title: "We found the payment, but it is not ready for proofs yet",
    message:
      "Kloak can see a related payment record, but it is still pending, failed, or missing the finalized transaction data needed for compliance proofs.",
    actionLabel: "Wait for the payment to fully settle, then refresh this page and try again.",
    reasonCode: "PAYMENT_NOT_READY",
    walletReceipt: normalizedWalletReceipt,
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

export async function listSelectiveDisclosureProofs(viewerAddress: string) {
  const proofs = await prisma.selectiveDisclosureProof.findMany({
    where: {
      OR: [
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

export async function listCompliancePayments(viewerAddress: string, walletReceipts: WalletReceiptInput[] = []) {
  const reconciliationResults = await Promise.all(
    walletReceipts.map(async (walletReceipt) => {
      const payment = await reconcileWalletCompliancePayment({
        viewerAddress,
        walletReceipt,
      })

      if (payment) {
        return { payment, diagnostic: null as CompliancePaymentDiagnostic | null }
      }

      const diagnostic = await buildWalletReceiptDiagnostic({
        viewerAddress,
        walletReceipt,
      })

      return { payment: null as CompliancePaymentListItem | null, diagnostic }
    }),
  )

  const reconciledWalletPayments = reconciliationResults
    .map((result) => result.payment)
    .filter((payment): payment is CompliancePaymentListItem => Boolean(payment))
  const diagnostics = reconciliationResults
    .map((result) => result.diagnostic)
    .filter((item): item is CompliancePaymentDiagnostic => Boolean(item))
  const sentPayments = reconciledWalletPayments.filter((payment) => payment.direction === "sent")
  const receivedPayments = reconciledWalletPayments.filter((payment) => payment.direction === "received")

  return {
    sent: sentPayments,
    received: receivedPayments,
    diagnostics: {
      sent: diagnostics.filter((item) => item.direction === "sent"),
      received: diagnostics.filter((item) => item.direction === "received"),
    },
  }
}

export async function recoverCompliancePayment(input: {
  viewerAddress: string
  walletReceipt: WalletReceiptInput
  txHash: string
}) {
  const viewerAddress = input.viewerAddress.trim()
  const txHash = input.txHash.trim()
  const actorRole = input.walletReceipt.actorRole === "receiver" ? "receiver" : "payer"
  const normalizedWalletReceipt = normalizeWalletReceiptInput(input.walletReceipt, actorRole)
  const requestId = normalizedWalletReceipt.requestId?.trim() || ""

  if (!viewerAddress || !txHash) {
    throw new SelectiveDisclosureError("Wallet confirmation and transaction hash are required.", 400)
  }

  if (!requestId || normalizedWalletReceipt.ownerAddress !== viewerAddress) {
    throw new SelectiveDisclosureError("This wallet receipt does not belong to the connected wallet.", 403)
  }

  const linkedRequest = await getPaymentLinkByWalletReceipt({
    requestId,
    actorRole,
    walletReceipt: normalizedWalletReceipt,
  })

  if (!linkedRequest) {
    throw new SelectiveDisclosureError(
      "We could not match this receipt to a Kloak payment request in this environment.",
      404,
    )
  }

  const existingRecoveredPayment = await getPaymentByWalletReceipt({
    requestId,
    actorRole,
    walletReceipt: normalizedWalletReceipt,
  })

  if (existingRecoveredPayment?.txHash && existingRecoveredPayment.status === "SUCCESS") {
    return serializeCompliancePayment(
      existingRecoveredPayment,
      actorRole === "receiver" ? "received" : "sent",
      {
        paymentSource: "wallet",
        walletReceipt: normalizedWalletReceipt,
      },
    )
  }

  const existingByTxHash = await getPaymentByTxHash(txHash)

  if (existingByTxHash && existingByTxHash.PaymentLink.id !== linkedRequest.id) {
    throw new SelectiveDisclosureError(
      "This transaction is already attached to a different payment in Kloak.",
      409,
    )
  }

  const submittedAmount = parseMicroUnitsToDisplay(normalizedWalletReceipt.amountMicro)
  const validation = await validatePaymentTransactionForLink({
    txHash,
    link: {
      id: linkedRequest.id,
      requestId: linkedRequest.requestId,
      creatorAddress: linkedRequest.creatorAddress,
      amount: linkedRequest.amount,
      allowCustomAmount: linkedRequest.allowCustomAmount,
      token: linkedRequest.token,
    },
    submittedToken: linkedRequest.token,
    submittedAmount,
  })

  if (!validation.ok) {
    throw new SelectiveDisclosureError(validation.message, validation.status)
  }

  const recoveredPayment = await recordPayment(
    linkedRequest.id,
    {
      merchantAddress: validation.merchantAddress,
      amount: submittedAmount,
      token: validation.token,
      txHash: validation.txHash,
      receiptCommitment: normalizedWalletReceipt.commitment || null,
    },
    { notify: false },
  )

  const hydratedPayment = await prisma.payment.findUnique({
    where: { id: recoveredPayment.id },
    include: {
      PaymentLink: true,
    },
  })

  if (!hydratedPayment) {
    throw new SelectiveDisclosureError("Payment recovery succeeded, but the rebuilt record could not be loaded.", 500)
  }

  return serializeCompliancePayment(hydratedPayment, actorRole === "receiver" ? "received" : "sent", {
    paymentSource: "wallet",
    walletReceipt: normalizedWalletReceipt,
  })
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
  walletReceipt?: WalletReceiptInput
}) {
  const txHash = input.txHash.trim()
  const requestId = formatRequestId(input.requestId.trim())
  const actorAddress = input.actorAddress.trim()
  const actorRole = input.actorRole
  const proofType = input.proofType
  const exactAmount = input.exactAmount?.trim() || null
  const thresholdAmount = input.thresholdAmount?.trim() || null
  const walletReceipt = input.walletReceipt
  const constraints = normalizeDisclosureConstraints({
    ...input.constraints,
    requestId,
  })

  if (!requestId || !actorAddress) {
    throw new SelectiveDisclosureError("actorAddress and requestId are required")
  }

  validateProofShape({ proofType, exactAmount, thresholdAmount })

  const payment =
    txHash && !txHash.startsWith("wallet:")
      ? await getPaymentByTxHash(txHash)
      : walletReceipt?.commitment
        ? await getPaymentByWalletReceipt({ requestId, actorRole, walletReceipt })
        : null

  if (!payment || !payment.txHash) {
    if (walletReceipt) {
      const linkedRequest = await getPaymentLinkByWalletReceipt({ requestId, actorRole, walletReceipt })

      if (linkedRequest) {
        throw new SelectiveDisclosureError(
          "This payment is still only present in your wallet receipt and was never synced into Kloak's payment history. This usually happens if the app closed before settlement finished syncing. Right now, compliance proofs can only be issued for payments that were recorded by Kloak after confirmation.",
          409,
          { code: "PAYMENT_NOT_SYNCED" },
        )
      }
    }

    throw new SelectiveDisclosureError("Payment transaction not found", 404)
  }

  if (payment.status !== "SUCCESS") {
    throw new SelectiveDisclosureError("Only successful payments can generate disclosure proofs")
  }

  if (formatRequestId(payment.PaymentLink.requestId) !== requestId) {
    throw new SelectiveDisclosureError("Transaction does not belong to the provided requestId")
  }

  if (!walletReceipt) {
    throw new SelectiveDisclosureError(
      "This proof now requires the wallet-held receipt for the payment. Refresh your compliance payments and select the wallet-backed payment entry again.",
      409,
      { code: "WALLET_RECEIPT_REQUIRED" },
    )
  }

  if (walletReceipt.ownerAddress.trim() !== actorAddress) {
    throw new SelectiveDisclosureError("Only the wallet that owns this receipt can generate the proof", 403)
  }

  const ownerAddress = walletReceipt.ownerAddress.trim()
  const counterpartyAddress = walletReceipt.counterpartyAddress.trim()
  const amountMicro = walletReceipt.amountMicro.trim()

  if (toMicroUnits(payment.amount) !== amountMicro) {
    throw new SelectiveDisclosureError("Wallet receipt amount does not match the stored payment record", 409)
  }

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

  const duplicateProof = await findActiveDuplicateProof({
    paymentId: payment.id,
    ownerAddress,
    actorRole,
    proofType,
    constraints,
    exactAmount: proofType === "amount" ? amountMicro : null,
    thresholdAmount,
  })

  if (duplicateProof) {
    throw new SelectiveDisclosureError(
      "You already have an active proof for this statement. Reuse it, revoke it, or generate one of the other proof types.",
      409,
      {
        code: "DUPLICATE_PROOF_STATEMENT",
        existingProof: duplicateProof,
        availableProofTypes: (["existence", "amount", "threshold"] as DisclosureProofType[]).filter(
          (type) => type !== proofType,
        ),
      },
    )
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
    paymentTimestamp: walletReceipt.paymentTimestamp.trim(),
    paymentTxHash: payment.txHash,
    commitment: walletReceipt.commitment.trim(),
    constraints,
    proofFunction: getDisclosureProofFunctionName(
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
  disclosureTxHash: string
  constraints?: DisclosureConstraints
  walletReceipt?: WalletReceiptInput
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

  const duplicateProof = await findActiveDuplicateProof({
    paymentId: prepared.paymentId,
    ownerAddress: prepared.ownerAddress,
    actorRole: prepared.actorRole,
    proofType: prepared.proofType,
    constraints: prepared.constraints,
    exactAmount: prepared.proofType === "amount" ? prepared.amountMicro : null,
    thresholdAmount: prepared.thresholdAmount,
  })

  if (duplicateProof) {
    throw new SelectiveDisclosureError(
      "You already have an active proof for this statement. Reuse it, revoke it, or generate one of the other proof types.",
      409,
      {
        code: "DUPLICATE_PROOF_STATEMENT",
        existingProof: duplicateProof,
        availableProofTypes: (["existence", "amount", "threshold"] as DisclosureProofType[]).filter(
          (type) => type !== prepared.proofType,
        ),
      },
    )
  }

  const proofPayload: StoredDisclosurePayload = {
    proofId,
    program: prepared.program,
    paymentTxHash: prepared.paymentTxHash,
    disclosureTxHash: input.disclosureTxHash,
    requestId: prepared.requestId,
    ownerAddress: prepared.ownerAddress,
    actorRole: prepared.actorRole,
    proofType: prepared.proofType,
    disclosedAmount: prepared.exactAmount,
    thresholdAmount: prepared.thresholdAmount,
    commitment: submittedCommitment,
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
      nullifier: null,
      contractProgram: prepared.program,
      constraints: prepared.constraints as Prisma.InputJsonValue,
      proofPayload: encryptJsonAtRest(proofPayload) as unknown as Prisma.InputJsonValue,
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
  proof?: unknown
}) {
  const packageValidation = input.proof
    ? validatePortableDisclosureProofPackage(input.proof)
    : null
  const submittedProof = packageValidation?.ok ? packageValidation.proof : null

  if (input.proof && packageValidation && !packageValidation.ok) {
    throw new SelectiveDisclosureError(packageValidation.reason, 400, {
      code: packageValidation.code,
    })
  }

  const proofId = input.proofId || submittedProof?.proofId

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
    if (submittedProof) {
      return await buildPortablePackageVerificationResult({ proof: submittedProof })
    }

    throw new SelectiveDisclosureError(
      "We could not find this proof in Kloak.",
      404,
    )
  }

  if (submittedProof) {
    assertSubmittedProofMatches(submittedProof, proofRecord)
  }

  if (proofRecord.status === "REVOKED") {
    await prisma.selectiveDisclosureVerification.create({
      data: {
        proofId: proofRecord.proofId,
        verifier: input.verifier,
        success: false,
        revoked: true,
        details: { reason: "This proof is no longer active" },
      },
    })

    throw new SelectiveDisclosureError(
      "This proof was revoked and can no longer be used.",
      410,
    )
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
  const hasDisclosedTimeRange = Boolean(
    payload.constraints.timestampFrom || payload.constraints.timestampTo,
  )
  const shouldHideExactTimestamp = payload.proofType !== "amount" || hasDisclosedTimeRange
  const storedProofPackage = buildSharedDisclosureProof({
    program: proofRecord.contractProgram,
    proofId: proofRecord.proofId,
    paymentTxHash: proofRecord.paymentTxHash,
    disclosureTxHash: proofRecord.disclosureTxHash,
    requestId: proofRecord.requestId,
    ownerAddress: proofRecord.ownerAddress,
    proverAddress: proofRecord.proverAddress,
    commitment: proofRecord.commitment,
    actorRole: payload.actorRole,
    proofType: payload.proofType,
    disclosedAmount: payload.disclosedAmount,
    thresholdAmount: payload.thresholdAmount,
    constraints: serializeConstraints(proofRecord.constraints),
  })
  const publicChain = await verifyProofPackageAgainstPublicChain(submittedProof || storedProofPackage)
  const paymentRowAvailable =
    Boolean(payment?.txHash) &&
    payment.txHash === proofRecord.paymentTxHash &&
    formatRequestId(payment.PaymentLink.requestId) === proofRecord.requestId
  const paymentHistoryMessage = paymentRowAvailable
    ? "Kloak could also match the proof to its payment history for extra context."
    : "Kloak could not fully re-check the linked payment history, so this result leaned on the public chain and the active proof record."

  if (paymentRowAvailable && payment.receiptCommitment && payment.receiptCommitment !== proofRecord.commitment) {
    // Older payments may have a commitment persisted from a buggy client-side hash implementation.
    // We trust the wallet-owned receipt commitment captured during proof generation instead.
  }

  const paymentConsistency = paymentRowAvailable
    ? (() => {
        const amountMicro = toMicroUnits(payment.amount)

        if (payload.proofType === "amount" && payload.disclosedAmount !== amountMicro) {
          return {
            ok: false,
            reason: "Kloak's payment history no longer matches the amount disclosed in this proof.",
          }
        }

        if (
          payload.proofType === "threshold" &&
          payload.thresholdAmount &&
          BigInt(amountMicro) < BigInt(payload.thresholdAmount)
        ) {
          return {
            ok: false,
            reason: "Kloak's payment history no longer satisfies the threshold disclosed in this proof.",
          }
        }

        return evaluateDisclosureConstraints(
          Number(payment.amount),
          payment.createdAt,
          proofRecord.requestId,
          serializeConstraints(proofRecord.constraints),
        )
      })()
    : null

  const success =
    Boolean(proofRecord.disclosureTxHash) &&
    publicChain.status !== "mismatch" &&
    (publicChain.status === "verified" || Boolean(paymentConsistency?.ok))

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
            publicChainStatus: publicChain.status,
            publicChainMessage: publicChain.message,
            paymentHistoryChecked: paymentRowAvailable,
            paymentHistoryMessage,
          }
        : {
            requestId: proofRecord.requestId,
            paymentTxHash: proofRecord.paymentTxHash,
            actorRole: payload.actorRole,
            proofType: payload.proofType,
            matched: false,
            publicChainStatus: publicChain.status,
            publicChainMessage: publicChain.message,
            paymentHistoryChecked: paymentRowAvailable,
            paymentHistoryMessage,
            reason:
              paymentConsistency && !paymentConsistency.ok && publicChain.status !== "verified"
                ? paymentConsistency.reason
                : publicChain.status === "mismatch"
                  ? publicChain.message
                  : publicChain.status === "unavailable" && !paymentRowAvailable
                    ? "We could not confirm this proof on the public chain, and Kloak no longer has enough payment history to back it up here."
                  : "We found the proof record, but the proof transaction has not been finalized yet.",
          },
    },
  })

  return {
    valid: success,
    verificationMode: "kloak-backed" as const,
    kloakVerified: true,
    publicChainStatus: publicChain.status,
    publicChainMessage: publicChain.message,
    recordStatus: "active" as const,
    recordMessage:
      `Kloak found this proof record and it is still active, so revocation and verification history could be checked. ${paymentHistoryMessage}`,
    verificationChecks: {
      packageIntegrity: true,
      publicChainPaymentTransaction: publicChain.checks.paymentTransactionFound,
      publicChainDisclosureTransaction: publicChain.checks.disclosureTransactionFound,
      publicChainDisclosureMatch: publicChain.checks.disclosureFunctionMatched,
      kloakRecordFound: true,
      kloakRevocationChecked: true,
      kloakPaymentHistoryChecked: paymentRowAvailable,
    } satisfies VerificationChecks,
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
    paymentTimestamp:
      paymentRowAvailable && !shouldHideExactTimestamp ? payment.createdAt.toISOString() : null,
    constraints: serializeConstraints(proofRecord.constraints),
    message: success
      ? publicChain.status === "verified"
        ? "Selective disclosure proof verified successfully, and the referenced public chain transactions matched the proof package."
        : "Selective disclosure proof verified successfully. Kloak records matched, but public chain checks were temporarily unavailable."
      : paymentConsistency && !paymentConsistency.ok && publicChain.status !== "verified"
        ? paymentConsistency.reason
        : publicChain.status === "mismatch"
          ? publicChain.message
          : publicChain.status === "unavailable" && !paymentRowAvailable
            ? "We could not confirm this proof on the public chain, and Kloak no longer has enough payment history to back it up here."
          : "We found the proof record, but the proof transaction has not been finalized yet."
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
