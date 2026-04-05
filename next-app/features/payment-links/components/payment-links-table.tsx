"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpRight, Copy, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PaymentLinkRecord } from "@/hooks/use-payment-links"
import { LinkStatusBadge } from "./link-status-badge"
import { formatAmount, formatDateOnly, getPaymentLinkStatus, shortHash } from "@/features/payment-links/lib/presentation"

export function PaymentLinksTable({
  links,
  title = "Created Links",
  description = "All payment links, with live operational status, expiry, and conversion health.",
}: {
  links: PaymentLinkRecord[]
  title?: string
  description?: string
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const summary = useMemo(() => {
    return links.reduce(
      (acc, link) => {
        const status = getPaymentLinkStatus(link)
        acc[status] += 1
        return acc
      },
      { live: 0, expired: 0, capped: 0, inactive: 0 },
    )
  }, [links])

  const copyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${id}`)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500)
  }

  return (
    <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
      <CardHeader className="border-b border-foreground/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Ledger</div>
            <CardTitle className="mt-2 text-lg">{title}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricPill label="Live" value={summary.live} />
            <MetricPill label="Expired" value={summary.expired} />
            <MetricPill label="Closed" value={summary.capped} />
            <MetricPill label="Inactive" value={summary.inactive} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {links.length === 0 ? (
          <div className="m-6 rounded-[2rem] border border-dashed border-foreground/10 bg-black/20 px-8 py-16 text-center">
            <div className="text-lg font-medium text-foreground">No payment links yet</div>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Create your first link to start collecting payments and building a proof-ready settlement history.
            </p>
            <Link href="/payment-links/create" className="mt-5 inline-flex">
              <Button>Create payment link</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                  <th className="px-6 py-4">Link</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Performance</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.04]">
                {links.map((link) => {
                  const conversionRate = link.views > 0 ? (link.paymentsReceived / link.views) * 100 : 0

                  return (
                    <tr key={link.id} className="align-top hover:bg-foreground/[0.02]">
                      <td className="px-6 py-5">
                        <div className="max-w-[260px]">
                          <div className="text-sm font-medium text-foreground">{link.title}</div>
                          <div className="mt-1 text-xs text-neutral-500">{link.description || shortHash(link.requestId, 10, 6)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-mono text-sm text-foreground">
                          {link.allowCustomAmount ? `Variable ${link.token}` : formatAmount(link.amount, link.token)}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">{shortHash(link.requestId, 8, 6)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <LinkStatusBadge
                          active={link.active}
                          expiresAt={link.expiresAt}
                          maxPayments={link.maxPayments}
                          paymentsReceived={link.paymentsReceived}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-foreground">{formatDateOnly(link.expiresAt)}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {link.maxPayments ? `${link.paymentsReceived}/${link.maxPayments} payments` : `${link.paymentsReceived} payments`}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-mono text-sm text-foreground">{Number(link.totalVolume).toFixed(4)} ALEO</div>
                        <div className="mt-1 text-xs text-neutral-500">{conversionRate.toFixed(1)}% conversion from {link.views} views</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => void copyLink(link.id)}>

                            {copiedId === link.id ? "Copied" : "Copy"}
                          </Button>
                          <a href={`/pay/${link.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" >

                              Open
                            </Button>
                          </a>
                          <Link href={`/payment-links/links/${link.id}`}>
                            <Button >
                              View details
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-black/20 px-4 py-3 text-center">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      <div className="mt-2 font-mono text-lg text-foreground">{value}</div>
    </div>
  )
}
