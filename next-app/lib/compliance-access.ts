export type ComplianceAccessScope = "compliance:read" | "proof:list" | "proof:payments"
export type ComplianceAccessPayload = {
  viewerAddress: string
  scope: ComplianceAccessScope
  issuedAt: string
  signature: string
}

type ComplianceAccessRequest = {
  viewerAddress?: string
  scope?: string
  issuedAt?: string
  signature?: string
}

const MAX_COMPLIANCE_AUTH_AGE_MS = 5 * 60 * 1000
const COMPLIANCE_ACCESS_STORAGE_PREFIX = "kloak:compliance-access"
export const COMPLIANCE_READ_SCOPE: ComplianceAccessScope = "compliance:read"

export class ComplianceAccessError extends Error {
  status: number

  constructor(message: string, status = 401) {
    super(message)
    this.name = "ComplianceAccessError"
    this.status = status
  }
}

export function buildComplianceAccessMessage(input: {
  scope: ComplianceAccessScope
  viewerAddress: string
  issuedAt: string
}) {
  return [
    "KLOAK compliance access",
    `scope:${input.scope}`,
    `viewer:${input.viewerAddress.trim()}`,
    `issuedAt:${input.issuedAt.trim()}`,
  ].join("\n")
}

export function bytesToBase64(bytes: Uint8Array) {
  if (typeof window !== "undefined") {
    let binary = ""
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return window.btoa(binary)
  }

  return Buffer.from(bytes).toString("base64")
}

export function base64ToBytes(value: string) {
  if (typeof window !== "undefined") {
    const binary = window.atob(value)
    const bytes = new Uint8Array(binary.length)

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    return bytes
  }

  return new Uint8Array(Buffer.from(value, "base64"))
}

function getComplianceAccessStorageKey(scope: ComplianceAccessScope, viewerAddress: string) {
  return `${COMPLIANCE_ACCESS_STORAGE_PREFIX}:${scope}:${viewerAddress.trim()}`
}

export function getCachedComplianceAccessPayload(
  scope: ComplianceAccessScope,
  viewerAddress: string,
): ComplianceAccessPayload | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.sessionStorage.getItem(getComplianceAccessStorageKey(scope, viewerAddress))

  if (!raw) {
    return null
  }

  try {
    const payload = JSON.parse(raw) as ComplianceAccessPayload
    const issuedAt = Number(payload.issuedAt)

    if (
      !payload.signature ||
      payload.scope !== scope ||
      payload.viewerAddress !== viewerAddress.trim() ||
      !Number.isFinite(issuedAt) ||
      Math.abs(Date.now() - issuedAt) > MAX_COMPLIANCE_AUTH_AGE_MS
    ) {
      window.sessionStorage.removeItem(getComplianceAccessStorageKey(scope, viewerAddress))
      return null
    }

    return payload
  } catch {
    window.sessionStorage.removeItem(getComplianceAccessStorageKey(scope, viewerAddress))
    return null
  }
}

export function setCachedComplianceAccessPayload(payload: ComplianceAccessPayload) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    getComplianceAccessStorageKey(payload.scope, payload.viewerAddress),
    JSON.stringify(payload),
  )
}

export function clearCachedComplianceAccessPayload(
  scope: ComplianceAccessScope,
  viewerAddress: string,
) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(getComplianceAccessStorageKey(scope, viewerAddress))
}

function assertScope(scope: string | undefined, expectedScope: ComplianceAccessScope) {
  if (scope !== expectedScope) {
    throw new ComplianceAccessError("Compliance access scope is invalid", 403)
  }
}

function assertIssuedAt(issuedAt: string | undefined) {
  const issuedAtNumber = Number(issuedAt)

  if (!Number.isFinite(issuedAtNumber)) {
    throw new ComplianceAccessError("Compliance access timestamp is invalid", 400)
  }

  if (Math.abs(Date.now() - issuedAtNumber) > MAX_COMPLIANCE_AUTH_AGE_MS) {
    throw new ComplianceAccessError("Compliance access signature has expired", 401)
  }
}

export async function verifyComplianceAccessRequest(
  input: ComplianceAccessRequest,
  expectedScope: ComplianceAccessScope,
) {
  const viewerAddress = input.viewerAddress?.trim()
  const issuedAt = input.issuedAt?.trim()
  const signature = input.signature?.trim()

  if (!viewerAddress || !issuedAt || !signature) {
    throw new ComplianceAccessError("Signed compliance access payload is required", 400)
  }

  assertScope(input.scope, expectedScope)
  assertIssuedAt(issuedAt)

  const { Address, Signature } = await import("@provablehq/sdk")
  const message = buildComplianceAccessMessage({
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

  throw new ComplianceAccessError("We couldn't confirm this wallet for the compliance workspace.", 401)
}

export function isComplianceAccessError(error: unknown): error is ComplianceAccessError {
  return error instanceof ComplianceAccessError
}
