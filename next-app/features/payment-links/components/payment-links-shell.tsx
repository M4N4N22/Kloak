import type { ReactNode } from "react"

import { PaymentLinksSidebar } from "./payment-links-sidebar"

export function PaymentLinksShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-7rem)]">
      <div className="mx-auto grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-3rem)]">
          <PaymentLinksSidebar />
        </div>

        <main className="min-w-0 xl:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
