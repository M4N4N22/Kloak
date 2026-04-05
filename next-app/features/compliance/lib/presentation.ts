import type { SelectiveDisclosureProof } from "@/hooks/use-selective-disclosure-proofs"

type ProofType = "existence" | "amount" | "threshold"
type ActorRole = "payer" | "receiver"

export function formatRoleLabel(role: ActorRole) {
  return role === "payer" ? "I am the payer" : "I am the receiver"
}

export function formatProofTypeLabel(type: ProofType) {
  if (type === "amount") return "Exact Amount"
  if (type === "threshold") return "Threshold"
  return "Basic"
}

export function shortHash(value: string, start = 8, end = 6) {
  if (!value) return "-"
  if (value.length <= start + end + 3) return value
  return `${value.slice(0, start)}...${value.slice(-end)}`
}

export function formatMoney(value?: string | number | null, token?: string | null) {
  if (value === null || typeof value === "undefined" || value === "") return "-"
  const numeric = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(numeric)) {
    return token ? `${value} ${token}` : String(value)
  }

  return `${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })}${token ? ` ${token}` : ""}`
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-"

  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatDateRange(from?: string | null, to?: string | null) {
  if (from && to) {
    return `${formatDateTime(from)} to ${formatDateTime(to)}`
  }

  if (from) {
    return `From ${formatDateTime(from)}`
  }

  if (to) {
    return `Until ${formatDateTime(to)}`
  }

  return null
}

export function buildDisclosurePreview(input: {
  proofType: ProofType
  minAmount?: string
  timestampFrom?: string
  timestampTo?: string
  token?: string | null
}) {
  const items = ["Payment exists"]

  if (input.proofType === "amount") {
    items.push("Exact payment amount")
  }

  if (input.proofType === "threshold") {
    items.push(`Amount is at least ${formatMoney(input.minAmount || "-", input.token || undefined)}`)
  }

  const dateRange = formatDateRange(input.timestampFrom, input.timestampTo)
  if (dateRange) {
    items.push(`Payment falls within ${dateRange}`)
  }

  return items
}

export function buildProofSummary(proof: SelectiveDisclosureProof) {
  const lines = [
    formatProofTypeLabel(proof.proofType),
    proof.actorRole === "payer" ? "Payer proof" : "Receiver proof",
  ]

  if (proof.proofType === "amount" && proof.disclosedAmount) {
    lines.push(`Amount: ${proof.disclosedAmount}`)
  }

  if (proof.proofType === "threshold" && proof.thresholdAmount) {
    lines.push(`Amount >= ${proof.thresholdAmount}`)
  }

  const range = formatDateRange(proof.constraints.timestampFrom, proof.constraints.timestampTo)
  if (range) {
    lines.push(range)
  }

  return lines
}
