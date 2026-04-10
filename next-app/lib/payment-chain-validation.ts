import { Prisma, type Token } from "@prisma/client"

import { KLOAK_PROGRAM } from "@/lib/selective-disclosure"

type ConfirmedTransactionShape = {
  status?: string
  transaction?: {
    id?: string
    type?: string
    execution?: {
      transitions?: Array<{
        program?: string
        function?: string
        inputs?: Array<{
          type?: string
          value?: string
        }>
      }>
    }
  }
}

type PaymentLinkValidationShape = {
  id: string
  requestId: string
  creatorAddress: string | null
  amount: Prisma.Decimal | null
  allowCustomAmount: boolean
  token: Token
}

type PaymentChainValidationResult =
  | {
      ok: true
      amount: string
      merchantAddress: string
      token: Token
      txHash: string
    }
  | {
      ok: false
      status: 400 | 502
      message: string
    }

const PROVABLE_API_HOST = process.env.PROVABLE_API_HOST || "https://api.provable.com/v2"
const TOKEN_PAYMENT_FUNCTION: Record<Token, "pay_request_aleo" | "pay_request_usdcx" | "pay_request_usad"> = {
  ALEO: "pay_request_aleo",
  USDCX: "pay_request_usdcx",
  USAD: "pay_request_usad",
}
const EXPECTED_PAYMENT_INPUT_COUNT: Record<Token, number> = {
  ALEO: 6,
  USDCX: 7,
  USAD: 7,
}

let cachedClientPromise: Promise<{
  getConfirmedTransaction: (txHash: string) => Promise<ConfirmedTransactionShape>
}> | null = null
const PAYMENT_LOOKUP_RETRY_ATTEMPTS = 6
const PAYMENT_LOOKUP_RETRY_DELAY_MS = 1500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getAleoNetworkClient() {
  if (!cachedClientPromise) {
    cachedClientPromise = import("@provablehq/sdk/testnet.js").then(({ AleoNetworkClient }) => {
      return new AleoNetworkClient(PROVABLE_API_HOST)
    })
  }

  return cachedClientPromise
}

function normalizeLeoValue(value: string | null | undefined) {
  if (!value) {
    return null
  }

  return value
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/\.(private|public|constant)$/, "")
}

function classifyLookupError(error: unknown): PaymentChainValidationResult {
  const message = error instanceof Error ? error.message.toLowerCase() : ""

  if (
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("no transaction") ||
    message.includes("missing")
  ) {
    return {
      ok: false,
      status: 400,
      message: "We could not confirm this payment on Aleo testnet yet. Please try again in a moment.",
    }
  }

  return {
    ok: false,
    status: 502,
    message: "We could not check Aleo testnet right now. Please try again in a moment.",
  }
}

async function getConfirmedTransactionWithRetry(txHash: string) {
  let lastError: unknown = null

  for (let attempt = 0; attempt < PAYMENT_LOOKUP_RETRY_ATTEMPTS; attempt++) {
    try {
      const client = await getAleoNetworkClient()
      return await client.getConfirmedTransaction(txHash)
    } catch (error) {
      lastError = error
      const classified = classifyLookupError(error)

      if (classified.ok || classified.status !== 400 || attempt === PAYMENT_LOOKUP_RETRY_ATTEMPTS - 1) {
        throw error
      }

      await sleep(PAYMENT_LOOKUP_RETRY_DELAY_MS)
    }
  }

  throw lastError
}

function findPaymentTransition(transaction: ConfirmedTransactionShape, token: Token) {
  const expectedFunction = TOKEN_PAYMENT_FUNCTION[token]
  const transitions = transaction.transaction?.execution?.transitions ?? []

  return transitions.find((transition) => {
    return transition.program === KLOAK_PROGRAM && transition.function === expectedFunction
  })
}

export async function validatePaymentTransactionForLink(input: {
  txHash: string
  link: PaymentLinkValidationShape
  submittedToken?: unknown
  submittedAmount?: unknown
}): Promise<PaymentChainValidationResult> {
  const txHash = typeof input.txHash === "string" ? input.txHash.trim() : ""



  if (!txHash) {
    return {
      ok: false,
      status: 400,
      message: "Payment update is missing the transaction reference.",
    }
  }

  if (!input.link.creatorAddress) {
    return {
      ok: false,
      status: 400,
      message: "This payment link is missing its receiving wallet address.",
    }
  }

  if (
    typeof input.submittedToken === "string" &&
    input.submittedToken !== input.link.token
  ) {
    return {
      ok: false,
      status: 400,
      message: "The submitted payment token does not match this payment link.",
    }
  }

  let transaction: ConfirmedTransactionShape

  try {
    transaction = await getConfirmedTransactionWithRetry(txHash)
  } catch (error) {
    return classifyLookupError(error)
  }

  const paymentTransition = findPaymentTransition(transaction, input.link.token)

  if (!paymentTransition) {
    return {
      ok: false,
      status: 400,
      message: "This transaction does not look like a valid Kloak payment for this asset.",
    }
  }

  const transitionInputs = paymentTransition.inputs ?? []
  const expectedInputCount = EXPECTED_PAYMENT_INPUT_COUNT[input.link.token]

  if (transitionInputs.length !== expectedInputCount) {
    return {
      ok: false,
      status: 400,
      message: "This transaction does not match the expected Kloak payment shape.",
    }
  }

  const hasPrivateInputs = transitionInputs.slice(1).every((entry) => entry.type === "private")

  if (!hasPrivateInputs) {
    return {
      ok: false,
      status: 400,
      message: "This transaction does not look like a valid private Kloak payment.",
    }
  }

  const firstInputType = transitionInputs[0]?.type
  const expectedFirstInputType = "external_record"

  if (firstInputType !== expectedFirstInputType) {
    return {
      ok: false,
      status: 400,
      message: "This transaction does not use the expected Kloak payment record input.",
    }
  }

  const verifiedAmount =
    typeof input.submittedAmount === "string" || typeof input.submittedAmount === "number"
      ? String(input.submittedAmount)
      : input.link.amount?.toString() ?? null

  if (!verifiedAmount) {
    return {
      ok: false,
      status: 400,
      message: "We could not determine the payment amount for this transaction.",
    }
  }

  const chainAmountDecimal = new Prisma.Decimal(verifiedAmount)

  if (!input.link.allowCustomAmount && input.link.amount && !chainAmountDecimal.equals(input.link.amount)) {
    return {
      ok: false,
      status: 400,
      message: "This transaction amount does not match the fixed amount on this payment link.",
    }
  }

  if (typeof input.submittedAmount === "string" || typeof input.submittedAmount === "number") {
    const submittedAmountDecimal = new Prisma.Decimal(input.submittedAmount)

    if (!submittedAmountDecimal.equals(chainAmountDecimal)) {
      return {
        ok: false,
        status: 400,
        message: "The submitted payment amount did not match the confirmed Aleo transaction.",
      }
    }
  }

  if (chainAmountDecimal.lte(0)) {
    return {
      ok: false,
      status: 400,
      message: "Payment amount must be greater than zero.",
    }
  }

  const verifiedMerchantAddress = normalizeLeoValue(input.link.creatorAddress)

  if (!verifiedMerchantAddress) {
    return {
      ok: false,
      status: 400,
      message: "This payment link is missing its receiving wallet address.",
    }
  }

  return {
    ok: true,
    amount: chainAmountDecimal.toString(),
    merchantAddress: verifiedMerchantAddress,
    token: input.link.token,
    txHash,
  }
}
