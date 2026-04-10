import {
  canonicalizePortableDisclosureProof,
  computeDisclosureDigest,
  parsePortableDisclosureProof,
  type PortableDisclosureProofV1,
} from "@/lib/selective-disclosure"

export type PortableProofPackageValidationResult =
  | {
      ok: true
      proof: PortableDisclosureProofV1
      mode: "portable-package"
    }
  | {
      ok: false
      reason: string
      code:
        | "UNSUPPORTED_FORMAT"
        | "UNSUPPORTED_KIND"
        | "UNSUPPORTED_VERSION"
        | "INVALID_DIGEST"
    }

export function validatePortableDisclosureProofPackage(
  input: unknown,
): PortableProofPackageValidationResult {
  const proof = parsePortableDisclosureProof(input)

  if (!proof) {
    return {
      ok: false,
      reason: "This proof file could not be read. Please paste the full proof package and try again.",
      code: "UNSUPPORTED_FORMAT",
    }
  }

  if (proof.kind !== "kloak.selective-disclosure-proof") {
    return {
      ok: false,
      reason: "This proof package is not supported here yet.",
      code: "UNSUPPORTED_KIND",
    }
  }

  if (proof.version !== 1) {
    return {
      ok: false,
      reason: "This proof package was created with a version Kloak does not support yet.",
      code: "UNSUPPORTED_VERSION",
    }
  }

  const expectedDigest = computeDisclosureDigest(
    canonicalizePortableDisclosureProof({
      kind: proof.kind,
      version: proof.version,
      program: proof.program,
      proofId: proof.proofId,
      subject: proof.subject,
      statement: proof.statement,
      chain: proof.chain,
    }),
  )

  if (proof.proofDigest !== expectedDigest) {
    return {
      ok: false,
      reason: "This proof package was changed after it was created. Please ask for a fresh copy and try again.",
      code: "INVALID_DIGEST",
    }
  }

  return {
    ok: true,
    proof,
    mode: "portable-package",
  }
}
