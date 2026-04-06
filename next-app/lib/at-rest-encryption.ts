import crypto from "node:crypto"

const ENCRYPTION_PREFIX = "enc:v1"

function getEncryptionKey() {
  const keyMaterial = process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET

  if (!keyMaterial?.trim()) {
    throw new Error("Missing DATA_ENCRYPTION_KEY or JWT_SECRET for at-rest encryption")
  }

  return crypto.createHash("sha256").update(keyMaterial).digest()
}

export function isEncryptedValue(value: string | null | undefined) {
  return typeof value === "string" && value.startsWith(`${ENCRYPTION_PREFIX}:`)
}

export function encryptTextAtRest(value: string | null | undefined) {
  if (!value) return null
  if (isEncryptedValue(value)) return value

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":")
}

export function decryptTextAtRest(value: string | null | undefined) {
  if (!value) return null
  if (!isEncryptedValue(value)) return value

  const [, version, ivEncoded, authTagEncoded, ciphertextEncoded] = value.split(":")

  if (version !== "v1" || !ivEncoded || !authTagEncoded || !ciphertextEncoded) {
    throw new Error("Unsupported encrypted value format")
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivEncoded, "base64url"),
  )

  decipher.setAuthTag(Buffer.from(authTagEncoded, "base64url"))

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextEncoded, "base64url")),
    decipher.final(),
  ])

  return plaintext.toString("utf8")
}

export function encryptJsonAtRest(value: unknown) {
  if (value === null || typeof value === "undefined") return null
  return encryptTextAtRest(JSON.stringify(value))
}

export function decryptJsonAtRest<T>(value: unknown): T | null {
  if (value === null || typeof value === "undefined") return null

  if (typeof value === "string") {
    const plaintext = decryptTextAtRest(value)

    if (!plaintext) return null

    try {
      return JSON.parse(plaintext) as T
    } catch {
      return null
    }
  }

  if (typeof value === "object") {
    return value as T
  }

  return null
}
