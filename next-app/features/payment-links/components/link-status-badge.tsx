import { Badge } from "@/components/ui/badge"
import { getPaymentLinkStatusMeta } from "@/features/payment-links/lib/presentation"

export function LinkStatusBadge({
  active,
  expiresAt,
  maxPayments,
  paymentsReceived,
}: {
  active: boolean
  expiresAt?: string | Date | null
  maxPayments?: number | null
  paymentsReceived?: number | null
}) {
  const meta = getPaymentLinkStatusMeta({ active, expiresAt, maxPayments, paymentsReceived })

  return <Badge variant={"secondary"} className={meta.className}>{meta.label}</Badge>
}
