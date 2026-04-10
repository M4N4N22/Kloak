"use client"

import Link from "next/link"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowUpRight, Lock, Sparkles, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentLinksAccessGate } from "@/features/payment-links/components/payment-links-access-gate"
import { PaymentLinksSectionHeader } from "@/features/payment-links/components/payment-links-section-header"
import { useCreatorProfile } from "@/hooks/use-creator-profile"
import { usePaymentLinksOverview } from "@/hooks/use-payment-links-overview"

export function PaymentLinksAnalyticsSection() {
  const { connected, address } = useWallet()
  const creatorAddress = address || ""

  return (
    <PaymentLinksAccessGate connected={connected}>
      <PaymentLinksAnalyticsContent creatorAddress={creatorAddress} />
    </PaymentLinksAccessGate>
  )
}

function PaymentLinksAnalyticsContent({ creatorAddress }: { creatorAddress: string }) {
  const { overview } = usePaymentLinksOverview(creatorAddress)
  const { profile } = useCreatorProfile(creatorAddress)

  const chartData =
    overview?.insights.topLinksThisWeek.map((link) => ({
      name: link.title.length > 12 ? `${link.title.slice(0, 10)}...` : link.title,
      revenue: link.weeklyRevenue,
    })) || []

  return (
      <div className="space-y-8">
        <PaymentLinksSectionHeader
          eyebrow="Analytics"
          title="See how your payment links are performing"
          description="Free gives you the basics. Pro gives you a closer look at top links, weekly trends, and stronger performance insights."
          action={
            !profile?.isProUser ? (
              <Link href="/pricing">
                <Button variant="default">
                  Upgrade to Pro
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsMetric label="Volume" value={`${Number(overview?.totals.totalVolume ?? 0).toFixed(4)} ALEO`} />
          <AnalyticsMetric label="Payments" value={String(overview?.totals.totalPayments ?? 0)} />
          <AnalyticsMetric label="Views" value={String(overview?.totals.totalViews ?? 0)} />
          <AnalyticsMetric label="Conversion" value={`${(((overview?.totals.conversionRate ?? 0) as number) * 100).toFixed(1)}%`} />
        </div>

        {!profile?.isProUser ? (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
              <CardHeader className="border-b border-foreground/5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Free Plan</div>
                <CardTitle className="mt-2 text-lg">Basic analytics included</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-sm leading-7 text-neutral-400">
                Free gives you the essentials: total volume, payments, views, and overall conversion. Upgrade when you want deeper link-by-link insights and weekly performance trends.
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
              <CardHeader className="border-b border-foreground/5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                  <Lock className="h-3.5 w-3.5" />
                  Pro Preview
                </div>
                <CardTitle className="mt-2 text-lg">What Pro unlocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <LockedFeature title="Weekly top links" body="See which links earned the most over the last 7 days." />
                <LockedFeature title="Best earner" body="Quickly spot the link bringing in the most revenue." />
                <LockedFeature title="Best converter" body="See which link turns visits into payments most effectively." />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Weekly Performance
                </div>
                <CardTitle className="mt-2 text-lg">Revenue by top link</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(9,9,11,0.95)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 16,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="revenue" fill="#9CE37D" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <InsightCard
                title="Top earner"
                body={
                  overview?.insights.highestRevenueLink
                    ? `${overview.insights.highestRevenueLink.title} generated ${overview.insights.highestRevenueLink.revenue.toFixed(4)} ALEO.`
                    : "We need a bit more payment activity before we can show a top earner."
                }
              />
              <InsightCard
                title="Best conversion"
                body={
                  overview?.insights.highestConversionLink
                    ? `${overview.insights.highestConversionLink.title} is converting at ${(overview.insights.highestConversionLink.conversion * 100).toFixed(1)}%.`
                    : "We need a bit more traffic before we can show a reliable conversion leader."
                }
              />
              <InsightCard
                title="Plan status"
                body="This wallet is on Pro, so advanced payment link analytics are already unlocked."
                accent
              />
            </div>
          </div>
        )}
      </div>
  )
}

function AnalyticsMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm text-neutral-500">{label}</div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="font-mono text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}

function LockedFeature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-foreground/10 bg-black/20 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-neutral-500">{body}</p>
    </div>
  )
}

function InsightCard({ title, body, accent = false }: { title: string; body: string; accent?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm text-neutral-500">{title}</div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className={accent ? "text-sm leading-7 text-primary" : "text-sm leading-7 text-neutral-400"}>{body}</p>
      </CardContent>
    </Card>
  )
}
