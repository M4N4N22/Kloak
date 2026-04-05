import type { ReactNode } from "react"

import { PaymentLinksShell } from "@/features/payment-links/components/payment-links-shell"

export default function PaymentLinksLayout({ children }: { children: ReactNode }) {
  return <PaymentLinksShell>{children}</PaymentLinksShell>
}
