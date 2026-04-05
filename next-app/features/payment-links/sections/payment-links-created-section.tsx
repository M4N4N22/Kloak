"use client"

import { useMemo } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PaymentLinksAccessGate } from "@/features/payment-links/components/payment-links-access-gate"
import { PaymentLinksSectionHeader } from "@/features/payment-links/components/payment-links-section-header"
import { PaymentLinksTable } from "@/features/payment-links/components/payment-links-table"
import { getPaymentLinkStatus } from "@/features/payment-links/lib/presentation"
import { usePaymentLinks } from "@/hooks/use-payment-links"

export function PaymentLinksCreatedSection() {
  const { connected, address } = useWallet()
  const creatorAddress = address || ""
  const { links } = usePaymentLinks(creatorAddress)

  const summary = useMemo(() => {
    return links.reduce(
      (acc, link) => {
        const status = getPaymentLinkStatus(link)
        acc.total += 1
        acc[status] += 1
        return acc
      },
      { total: 0, live: 0, expired: 0, capped: 0, inactive: 0 },
    )
  }, [links])

  return (
    <PaymentLinksAccessGate connected={connected}>
      <div className="space-y-8">
        <PaymentLinksSectionHeader
          eyebrow="Created Links"
          title="Operational ledger for every payment link"
          description="Review live vs expired status correctly, check expiry and caps at a glance, and open each link for deeper analytics and payment-level actions."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Live" value={summary.live} />
          <SummaryCard label="Expired" value={summary.expired} />
         
        </div>

        <PaymentLinksTable links={links} />
      </div>
    </PaymentLinksAccessGate>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
      <CardHeader className="border-b border-foreground/5 pb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="font-mono text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}
