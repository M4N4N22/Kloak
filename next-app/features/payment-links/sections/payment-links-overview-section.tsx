"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { BarChart3, Eye, Link2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentLinksAccessGate } from "@/features/payment-links/components/payment-links-access-gate"
import { PaymentLinksSectionHeader } from "@/features/payment-links/components/payment-links-section-header"
import { PaymentLinksTable } from "@/features/payment-links/components/payment-links-table"
import { ContextHelpCard } from "@/features/trust/components/context-help-card"
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
          title="Payment links that are easy to create and easy to manage"
          description="Create payment links, see how they are performing, and move completed payments into compliance proofs when needed. The payer stays private by default."
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

        <ContextHelpCard
          title="Want the quick version before you start?"
          description="Use docs for how payment links work, privacy for what stays hidden, and support if a link or payment does not behave the way you expect."
          links={[
            { label: "Open docs", href: "/docs" },
            { label: "Read privacy", href: "/privacy" },
            { label: "Get support", href: "/support" },
          ]}
        />

        <div className="flex flex-col gap-6 ">
          <Card className="" >
            <CardHeader>
              <div className="text-sm text-neutral-500">Why Kloak</div>
              <CardTitle className="mt-2 text-2xl">Everything you need to run payment links well</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4  md:grid-cols-3 ">
              <CapabilityCard
                icon={Link2}
                title="Easy to share"
                body="Create a link, set the amount and expiry, and share it anywhere you want."
              />
              <CapabilityCard
                icon={BarChart3}
                title="Easy to track"
                body="See views, payments, volume, and top-performing links in one place."
              />
              <CapabilityCard
                icon={ShieldCheck}
                title="Private by default"
                body="Who paid stays private, and proofs only reveal what the proof owner chooses to share."
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

        <Card className="bg-transparent border rounded-[2.5rem]">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm text-neutral-500">Traffic</div>
                <CardTitle className="mt-2 text-lg">A quick view of demand</CardTitle>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SignalPill label="Views" value={String(overview?.totals.totalViews ?? 0)} />
                <SignalPill label="Visitors" value={String(overview?.totals.uniqueVisitors ?? 0)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[2.5rem] border px-6 py-8">
                <div className="flex items-center justify-between gap-2 text-base ">
                 
                  Top earning link
                   <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="mt-3 text-xl font-semibold text-foreground">
                  {overview?.insights.highestRevenueLink?.title || "Waiting for payments"}
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  {overview?.insights.highestRevenueLink
                    ? `${overview.insights.highestRevenueLink.revenue.toFixed(4)} ALEO collected`
                    : "Your best earner will show up here once payments start coming in."}
                </p>
              </div>
              <div className="rounded-[2.5rem] border px-6 py-8">
                <div className="flex items-center justify-between gap-2 text-base ">
                 
                  Best conversion
                    <Eye className="h-6 w-6 text-primary" />
                </div>
               
                <div className="mt-3 text-xl font-semibold text-foreground">
                  {overview?.insights.highestConversionLink?.title || "Waiting for traffic"}
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  {overview?.insights.highestConversionLink
                    ? `${(overview.insights.highestConversionLink.conversion * 100).toFixed(1)}% visit-to-payment conversion`
                    : "Once your links have enough traffic and payments, the strongest converter will appear here."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <PaymentLinksTable
          links={recentLinks}
          title="Recent links"
          description="Your latest payment links, with status, expiry, and quick access to details."
        />

        <div className="flex justify-end">
          <Link href="/payment-links/analytics">
            <Button variant="outline" >
              Open analytics

            </Button>
          </Link>
        </div>
      </div>
    </PaymentLinksAccessGate>
  )
}

function OverviewMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardHeader >
        <div className="text-xl  text-neutral-300 ">{label}</div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="font-mono text-3xl font-semibold tracking-tight text-primary">{value}</div>
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
    <div className="rounded-[2rem] bg-neutral-950/50 py-8 px-6">
      <div className="flex gap-2 items-center font-light">
        <Icon className="h-5 w-5 text-primary" />
        <div className=" text-base ">{title}</div></div>
      <p className="mt-4 text-sm leading-6 text-neutral-500">{body}</p>
    </div>
  )
}

function SignalPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border  px-4 py-3 text-center">
      <div className="text-xs text-primary">{label}</div>
      <div className="mt-2 font-mono text-base text-foreground">{value}</div>
    </div>
  )
}
