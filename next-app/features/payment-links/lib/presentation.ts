export type PaymentLinkStatus = "live" | "expired" | "capped" | "inactive"

type PaymentLinkStatusInput = {
  active: boolean
  expiresAt?: string | Date | null
  maxPayments?: number | null
  paymentsReceived?: number | null
}

export function shortHash(value: string | null | undefined, start = 6, end = 4) {
  if (!value) return "Unavailable"
  if (value.length <= start + end) return value
  return `${value.slice(0, start)}...${value.slice(-end)}`
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "Not set"

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Invalid date"

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatDateOnly(value: string | Date | null | undefined) {
  if (!value) return "No expiry"

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Invalid date"

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatAmount(value: string | number | null | undefined, token: string, digits = 4) {
  const numeric = Number(value ?? 0)

  return `${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })} ${token}`
}

export function getPaymentLinkStatus(input: PaymentLinkStatusInput): PaymentLinkStatus {
  if (!input.active) return "inactive"

  const now = Date.now()
  const expiresAt = input.expiresAt ? new Date(input.expiresAt).getTime() : null

  if (expiresAt && !Number.isNaN(expiresAt) && expiresAt <= now) {
    return "expired"
  }

  if (input.maxPayments && (input.paymentsReceived ?? 0) >= input.maxPayments) {
    return "capped"
  }

  return "live"
}

export function getPaymentLinkStatusMeta(input: PaymentLinkStatusInput) {
  const status = getPaymentLinkStatus(input)

  switch (status) {
    case "expired":
      return {
        status,
        label: "Expired",
        helper: "Past expiry",
        className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
      }
    case "capped":
      return {
        status,
        label: "Closed",
        helper: "Payment cap reached",
        className: "border-sky-400/20 bg-sky-400/10 text-sky-200",
      }
    case "inactive":
      return {
        status,
        label: "Inactive",
        helper: "Manually disabled",
        className: "border-foreground/10 bg-foreground/5 text-neutral-300",
      }
    default:
      return {
        status,
        label: "Live",
        helper: "Accepting payments",
        className: "border-primary/20 bg-primary/10 text-primary",
      }
  }
}
