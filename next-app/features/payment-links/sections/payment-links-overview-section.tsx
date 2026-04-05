"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { ArrowUpRight, BarChart3, Eye, Link2, PlusCircle, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentLinksAccessGate } from "@/features/payment-links/components/payment-links-access-gate"
import { PaymentLinksSectionHeader } from "@/features/payment-links/components/payment-links-section-header"
import { PaymentLinksTable } from "@/features/payment-links/components/payment-links-table"
import { usePaymentLinks } from "@/hooks/use-payment-links"
import { usePaymentLinksOverview } from "@/hooks/use-payment-links-overview"

export function PaymentLinksOverviewSection() {
  const { connected, address } = useWallet()
  const creatorAddress = address || ""

  const { overview } = usePaymentLinksOverview(creatorAddress)
  const { links } = usePaymentLinks(creatorAddress)

  const recentLinks = useMemo(() => links.slice(0, 5), [links])

  return (
    <PaymentLinksAccessGate connected={connected}>
      <div className="space-y-8">
        <PaymentLinksSectionHeader
          eyebrow="Overview"
          title="Private payment links, operated like infrastructure"
          description="Issue private payment requests, monitor conversion and settlement, and route successful payments into compliance-grade proof workflows."
          action={
            <div className="flex flex-wrap gap-3">
              <Link href="/payment-links/create">
                <Button >
                
                  Create payment link
                </Button>
              </Link>
              <Link href="/payment-links/links">
                <Button variant="secondary" >
                  View all links
                </Button>
              </Link>
            </div>
          }
        />

        <div className="flex flex-col gap-6 ">
          <Card className="bg-transparent pt-0 rounded-none" >
            <CardHeader className="px-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Command Center</div>
              <CardTitle className="mt-2 text-2xl">Operate links with clarity, not guesswork</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4  md:grid-cols-3 px-0">
              <CapabilityCard
                icon={Link2}
                title="Create on web"
                body="Use the web app for secure request creation, link terms, and expiry management."
              />
              <CapabilityCard
                icon={BarChart3}
                title="Track performance"
                body="Monitor views, conversion, volume, and link health across your collection."
              />
              <CapabilityCard
                icon={ShieldCheck}
                title="Proof-ready settlements"
                body="Move settled link payments directly into selective disclosure and compliance workflows."
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <OverviewMetric
              label="Net Volume"
              value={`${Number(overview?.totals.totalVolume ?? 0).toFixed(4)} ALEO`}
              helper="Total collected across all payment links."
            />
            <OverviewMetric
              label="Active Links"
              value={String(overview?.totals.activeLinks ?? 0)}
              helper="Links currently able to accept payments."
            />
            <OverviewMetric
              label="Payments"
              value={String(overview?.totals.totalPayments ?? 0)}
              helper="Recorded settlements across your links."
            />
            <OverviewMetric
              label="Conversion"
              value={`${(((overview?.totals.conversionRate ?? 0) as number) * 100).toFixed(1)}%`}
              helper="Visits converted into paid settlements."
            />
          </div>
        </div>

        <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
          <CardHeader className="border-b border-foreground/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Traffic</div>
                <CardTitle className="mt-2 text-lg">Top-level demand signals</CardTitle>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SignalPill label="Views" value={String(overview?.totals.totalViews ?? 0)} />
                <SignalPill label="Visitors" value={String(overview?.totals.uniqueVisitors ?? 0)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] border border-foreground/5 bg-black/20 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Best revenue performer
                </div>
                <div className="mt-3 text-xl font-semibold text-foreground">
                  {overview?.insights.highestRevenueLink?.title || "Waiting for payments"}
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  {overview?.insights.highestRevenueLink
                    ? `${overview.insights.highestRevenueLink.revenue.toFixed(4)} ALEO collected`
                    : "Once a link receives meaningful volume, it will show up here."}
                </p>
              </div>
              <div className="rounded-[2rem] border border-foreground/5 bg-black/20 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Eye className="h-4 w-4 text-primary" />
                  Highest conversion
                </div>
                <div className="mt-3 text-xl font-semibold text-foreground">
                  {overview?.insights.highestConversionLink?.title || "Waiting for traffic"}
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  {overview?.insights.highestConversionLink
                    ? `${(overview.insights.highestConversionLink.conversion * 100).toFixed(1)}% visit-to-payment conversion`
                    : "Once views and settlements accumulate, the top converter will appear here."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <PaymentLinksTable
          links={recentLinks}
          title="Recent links"
          description="Your latest payment links, with operational status and quick navigation into details."
        />

        <div className="flex justify-end">
          <Link href="/payment-links/analytics">
            <Button variant="outline" >
              Open detailed analytics
             
            </Button>
          </Link>
        </div>
      </div>
    </PaymentLinksAccessGate>
  )
}

function OverviewMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="rounded-[2.5rem] border  text-foreground">
      <CardHeader className="border-b border-foreground/5">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="font-mono text-3xl font-semibold tracking-tight text-foreground">{value}</div>
        <p className="mt-3 text-xs leading-5 text-neutral-500">{helper}</p>
      </CardContent>
    </Card>
  )
}

function CapabilityCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Link2
  title: string
  body: string
}) {
  return (
    <div className="rounded-[2rem] border  bg-black/20 p-5">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-4 text-sm font-medium text-foreground">{title}</div>
      <p className="mt-2 text-sm leading-6 text-neutral-500">{body}</p>
    </div>
  )
}

function SignalPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border  px-4 py-3 text-center">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      <div className="mt-2 font-mono text-base text-foreground">{value}</div>
    </div>
  )
}
