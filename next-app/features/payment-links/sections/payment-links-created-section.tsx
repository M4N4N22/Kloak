"use client"

import { useMemo } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { Activity, Globe, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
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
          title="All of your payment links in one place"
          description="See which links are live, expired, or closed, and open each one for more detail."
        />

       <div className="grid gap-4 md:grid-cols-3 mb-8">
      <SummaryCard 
        label="Total Links" 
        value={summary.total} 
        icon={Activity} 
      />
      <SummaryCard 
        label="Live Links" 
        value={summary.live} 
        icon={Globe} 
        variant="primary" 
      />
      <SummaryCard 
        label="Expired" 
        value={summary.expired} 
        icon={Archive} 
        variant="muted" 
      />
    </div>

        <PaymentLinksTable links={links} />
      </div>
    </PaymentLinksAccessGate>
  )
}

function SummaryCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = "default", 
}: { 
  label: string; 
  value: number; 
  icon: typeof Activity;
  variant?: "default" | "primary" | "muted";
}) {
  return (
    <div className=
      "relative overflow-hidden rounded-[3rem] border py-8 px-6 transition-all duration-300"
     >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <p className="text-2xl text-foreground/80 font-light">
            {label}
          </p>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border transition-colors text-primary",
            variant === "primary" ? "" : ""
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-1">
         
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              "font-mono text-4xl font-bold tracking-tighter tabular-nums",
              variant === "primary" ? "text-white" : "text-zinc-200"
            )}>
              {value}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
