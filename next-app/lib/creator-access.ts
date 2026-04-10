import { base64ToBytes, bytesToBase64 } from "@/lib/compliance-access"

export type CreatorAccessScope =
  | "creator:read"
  | "creator:write"
  | "creator:webhooks:read"
  | "creator:webhooks:write"

export type CreatorAccessPayload = {
  viewerAddress: string
  scope: CreatorAccessScope
  issuedAt: string
  signature: string
}

export type CreatorAccessSigner = (
  message: Uint8Array,
) => Promise<Uint8Array | undefined>

type CreatorAccessRequest = {
  viewerAddress?: string
  scope?: string
  issuedAt?: string
  signature?: string
}

const MAX_CREATOR_AUTH_AGE_MS = 5 * 60 * 1000
const CREATOR_ACCESS_STORAGE_PREFIX = "kloak:creator-access"

export const CREATOR_READ_SCOPE: CreatorAccessScope = "creator:read"
export const CREATOR_WRITE_SCOPE: CreatorAccessScope = "creator:write"
export const CREATOR_WEBHOOKS_READ_SCOPE: CreatorAccessScope = "creator:webhooks:read"
export const CREATOR_WEBHOOKS_WRITE_SCOPE: CreatorAccessScope = "creator:webhooks:write"

export class CreatorAccessError extends Error {
  status: number

  constructor(message: string, status = 401) {
    super(message)
    this.name = "CreatorAccessError"
    this.status = status
  }
}

export function buildCreatorAccessMessage(input: {
  scope: CreatorAccessScope
  viewerAddress: string
  issuedAt: string
}) {
  return [
    "KLOAK creator access",
    `scope:${input.scope}`,
    `viewer:${input.viewerAddress.trim()}`,
    `issuedAt:${input.issuedAt.trim()}`,
  ].join("\n")
}

function getCreatorAccessStorageKey(scope: CreatorAccessScope, viewerAddress: string) {
  return `${CREATOR_ACCESS_STORAGE_PREFIX}:${scope}:${viewerAddress.trim()}`
}

export function getCachedCreatorAccessPayload(
  scope: CreatorAccessScope,
  viewerAddress: string,
): CreatorAccessPayload | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.sessionStorage.getItem(getCreatorAccessStorageKey(scope, viewerAddress))

  if (!raw) {
    return null
  }

  try {
    const payload = JSON.parse(raw) as CreatorAccessPayload
    const issuedAt = Number(payload.issuedAt)

    if (
      !payload.signature ||
      payload.scope !== scope ||
      payload.viewerAddress !== viewerAddress.trim() ||
      !Number.isFinite(issuedAt) ||
      Math.abs(Date.now() - issuedAt) > MAX_CREATOR_AUTH_AGE_MS
    ) {
      window.sessionStorage.removeItem(getCreatorAccessStorageKey(scope, viewerAddress))
      return null
    }

    return payload
  } catch {
    window.sessionStorage.removeItem(getCreatorAccessStorageKey(scope, viewerAddress))
    return null
  }
}

export function setCachedCreatorAccessPayload(payload: CreatorAccessPayload) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    getCreatorAccessStorageKey(payload.scope, payload.viewerAddress),
    JSON.stringify(payload),
  )
}

export function clearCachedCreatorAccessPayload(
  scope: CreatorAccessScope,
  viewerAddress: string,
) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(getCreatorAccessStorageKey(scope, viewerAddress))
}

export async function getOrCreateCreatorAccessPayload(input: {
  scope: CreatorAccessScope
  viewerAddress: string
  signMessage?: CreatorAccessSigner
}) {
  const cached = getCachedCreatorAccessPayload(input.scope, input.viewerAddress)

  if (cached) {
    return cached
  }

  if (!input.signMessage) {
    throw new Error("This wallet does not support signed creator access.")
  }

  const issuedAt = Date.now().toString()
  const message = buildCreatorAccessMessage({
    scope: input.scope,
    viewerAddress: input.viewerAddress,
    issuedAt,
  })
  const signatureBytes = await input.signMessage(new TextEncoder().encode(message))

  if (!signatureBytes) {
    throw new Error("This wallet did not return a creator access signature.")
  }

  const payload: CreatorAccessPayload = {
    viewerAddress: input.viewerAddress,
    scope: input.scope,
    issuedAt,
    signature: bytesToBase64(signatureBytes),
  }

  setCachedCreatorAccessPayload(payload)
  return payload
}

function assertScope(scope: string | undefined, expectedScope: CreatorAccessScope) {
  if (scope !== expectedScope) {
    throw new CreatorAccessError("Creator access scope is invalid", 403)
  }
}

function assertIssuedAt(issuedAt: string | undefined) {
  const issuedAtNumber = Number(issuedAt)

  if (!Number.isFinite(issuedAtNumber)) {
    throw new CreatorAccessError("Creator access timestamp is invalid", 400)
  }

  if (Math.abs(Date.now() - issuedAtNumber) > MAX_CREATOR_AUTH_AGE_MS) {
    throw new CreatorAccessError("Creator access signature has expired", 401)
  }
}

export async function verifyCreatorAccessRequest(
  input: CreatorAccessRequest,
  expectedScope: CreatorAccessScope,
) {
  const viewerAddress = input.viewerAddress?.trim()
  const issuedAt = input.issuedAt?.trim()
  const signature = input.signature?.trim()

  if (!viewerAddress || !issuedAt || !signature) {
    throw new CreatorAccessError("Signed creator access payload is required", 400)
  }

  assertScope(input.scope, expectedScope)
  assertIssuedAt(issuedAt)

  const { Address, Signature } = await import("@provablehq/sdk")
  const message = buildCreatorAccessMessage({
    scope: expectedScope,
    viewerAddress,
    issuedAt,
  })
  const addressObject = Address.from_string(viewerAddress)
  const messageBytes = new TextEncoder().encode(message)
  const signatureBytes = base64ToBytes(signature)

  try {
    const signatureObject = Signature.fromBytesLe(signatureBytes)

    if (signatureObject.verify(addressObject, messageBytes)) {
      return viewerAddress
    }
  } catch {
    // Fall through to string-based parsing.
  }

  try {
    const signatureText = new TextDecoder().decode(signatureBytes).trim()

    if (signatureText) {
      const signatureObject = Signature.from_string(signatureText)

      if (signatureObject.verify(addressObject, messageBytes)) {
        return viewerAddress
      }
    }
  } catch {
    // Ignore and surface the shared error below.
  }

  throw new CreatorAccessError("We couldn't confirm this wallet for creator settings.", 401)
}

export function isCreatorAccessError(error: unknown): error is CreatorAccessError {
  return error instanceof CreatorAccessError
}

export { bytesToBase64 }
