import {
  KLOAK_PROGRAM,
  getDisclosureProofFunctionName,
  type PortableDisclosureProofV1,
} from "@/lib/selective-disclosure"

type ConfirmedTransactionShape = {
  status?: string
  transaction?: {
    id?: string
    type?: string
    execution?: {
      transitions?: Array<{
        program?: string
        function?: string
      }>
    }
  }
}

type TransactionLookupResult =
  | {
      ok: true
      transaction: ConfirmedTransactionShape
    }
  | {
      ok: false
      kind: "missing" | "unavailable"
      message: string
    }

export type PublicChainVerificationStatus = "verified" | "mismatch" | "unavailable"

export type PublicChainVerificationResult = {
  status: PublicChainVerificationStatus
  message: string
  checks: {
    paymentTransactionFound: boolean
    paymentKloakTransitionFound: boolean
    disclosureTransactionFound: boolean
    disclosureKloakTransitionFound: boolean
    disclosureFunctionMatched: boolean
  }
}

const PAYMENT_FUNCTIONS = new Set(["pay_request_aleo", "pay_request_usdcx", "pay_request_usad"])
const PROVABLE_API_HOST = process.env.PROVABLE_API_HOST || "https://api.provable.com/v2"

let cachedClientPromise: Promise<{ getConfirmedTransaction: (txHash: string) => Promise<ConfirmedTransactionShape> }> | null =
  null

async function getAleoNetworkClient() {
  if (!cachedClientPromise) {
    cachedClientPromise = import("@provablehq/sdk/testnet.js").then(({ AleoNetworkClient }) => {
      return new AleoNetworkClient(PROVABLE_API_HOST)
    })
  }

  return cachedClientPromise
}

function getExecutionTransitions(transaction: ConfirmedTransactionShape) {
  return transaction.transaction?.execution?.transitions ?? []
}

function findKloakTransition(
  transaction: ConfirmedTransactionShape,
  allowedFunctions?: Set<string>,
) {
  return getExecutionTransitions(transaction).find((transition) => {
    if (transition.program !== KLOAK_PROGRAM) {
      return false
    }

    if (!allowedFunctions) {
      return true
    }

    return Boolean(transition.function && allowedFunctions.has(transition.function))
  })
}

function classifyLookupError(error: unknown, txHash: string): TransactionLookupResult {
  const message =
    error instanceof Error ? error.message : `Public chain lookup failed for transaction ${txHash}`
  const normalized = message.toLowerCase()

  if (
    normalized.includes("404") ||
    normalized.includes("not found") ||
    normalized.includes("no transaction") ||
    normalized.includes("missing")
  ) {
    return {
      ok: false,
      kind: "missing",
      message: "We could not find this transaction on the public testnet records.",
    }
  }

  return {
    ok: false,
    kind: "unavailable",
    message: "We could not check the public chain right now. Please try again in a moment.",
  }
}

async function getConfirmedTransaction(txHash: string): Promise<TransactionLookupResult> {
  try {
    const client = await getAleoNetworkClient()
    const transaction = await client.getConfirmedTransaction(txHash)

    return {
      ok: true,
      transaction,
    }
  } catch (error) {
    return classifyLookupError(error, txHash)
  }
}

export async function verifyProofPackageAgainstPublicChain(
  proof: PortableDisclosureProofV1,
): Promise<PublicChainVerificationResult> {
  const baseChecks = {
    paymentTransactionFound: false,
    paymentKloakTransitionFound: false,
    disclosureTransactionFound: false,
    disclosureKloakTransitionFound: false,
    disclosureFunctionMatched: false,
  }

  if (proof.program !== KLOAK_PROGRAM) {
    return {
      status: "mismatch",
      message: "This proof was created for a different program and cannot be verified as a Kloak compliance proof.",
      checks: baseChecks,
    }
  }

  if (!proof.chain.disclosureTxHash) {
    return {
      status: "mismatch",
      message:
        "This proof package is missing its disclosure transaction reference, so we could not confirm it on the public chain.",
      checks: baseChecks,
    }
  }

  const paymentLookup = await getConfirmedTransaction(proof.chain.paymentTxHash)

  if (!paymentLookup.ok) {
    return {
      status: paymentLookup.kind === "missing" ? "mismatch" : "unavailable",
      message: paymentLookup.message,
      checks: baseChecks,
    }
  }

  const paymentTransition = findKloakTransition(paymentLookup.transaction, PAYMENT_FUNCTIONS)

  if (!paymentTransition) {
    return {
      status: "mismatch",
      message:
        "The payment transaction was found, but it does not look like a Kloak payment on the public chain.",
      checks: {
        ...baseChecks,
        paymentTransactionFound: true,
      },
    }
  }

  const disclosureLookup = await getConfirmedTransaction(proof.chain.disclosureTxHash)

  if (!disclosureLookup.ok) {
    return {
      status: disclosureLookup.kind === "missing" ? "mismatch" : "unavailable",
      message: disclosureLookup.message,
      checks: {
        ...baseChecks,
        paymentTransactionFound: true,
        paymentKloakTransitionFound: true,
      },
    }
  }

  const expectedDisclosureFunction = getDisclosureProofFunctionName(
    proof.statement.actorRole,
    proof.statement.proofType,
    Boolean(proof.statement.constraints.timestampFrom || proof.statement.constraints.timestampTo),
  )
  const disclosureTransition = findKloakTransition(disclosureLookup.transaction)

  if (!disclosureTransition) {
    return {
      status: "mismatch",
      message:
        "The disclosure transaction was found, but it does not look like a Kloak proof transaction.",
      checks: {
        paymentTransactionFound: true,
        paymentKloakTransitionFound: true,
        disclosureTransactionFound: true,
        disclosureKloakTransitionFound: false,
        disclosureFunctionMatched: false,
      },
    }
  }

  if (disclosureTransition.function !== expectedDisclosureFunction) {
    return {
      status: "mismatch",
      message:
        "The disclosure transaction was found, but it does not match the proof details in this package.",
      checks: {
        paymentTransactionFound: true,
        paymentKloakTransitionFound: true,
        disclosureTransactionFound: true,
        disclosureKloakTransitionFound: true,
        disclosureFunctionMatched: false,
      },
    }
  }

  return {
    status: "verified",
    message:
      "The payment and proof transactions were both confirmed on Aleo testnet and matched this proof package.",
    checks: {
      paymentTransactionFound: true,
      paymentKloakTransitionFound: true,
      disclosureTransactionFound: true,
      disclosureKloakTransitionFound: true,
      disclosureFunctionMatched: true,
    },
  }
}
