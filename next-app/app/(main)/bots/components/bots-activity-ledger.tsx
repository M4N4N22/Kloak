"use client"

import Link from "next/link"
import { ArrowUpRight, Link2, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime, shortHash } from "@/features/compliance/lib/presentation"

type BotPayment = {
  id: string
  txHash: string | null
  amount: string
  token: "ALEO" | "USDCX" | "USAD"
  status: string
  source: string
  createdAt: string
  channel: string
}

type BotLink = {
  id: string
  title: string
  requestId: string
  createdAt: string
  active: boolean
  paymentsReceived: number
  totalVolume: number
}

function formatAmount(value: string, token: string) {
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })} ${token}`
}

function EmptyState({
  title,
  description,
  href,
  cta,
  icon: Icon,
}: {
  title: string
  description: string
  href: string
  cta: string
  icon: typeof MessageCircle
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-foreground/10 bg-black/20 px-8 text-center">
      <div className="rounded-2xl bg-foreground/5 p-3 text-neutral-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-5 max-w-sm space-y-2">
        <div className="font-medium text-foreground">{title}</div>
        <p className="text-sm leading-6 text-neutral-500">{description}</p>
      </div>
      <Link href={href} className="mt-5">
        <Button>{cta}</Button>
      </Link>
    </div>
  )
}

export function BotsActivityLedger({
  payments,
  links,
}: {
  payments: BotPayment[]
  links: BotLink[]
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500">Recent Payments</div>
            <CardTitle className="mt-2 text-lg">Payment Alert Feed</CardTitle>
          </div>
          <a href="https://t.me/kloak_private_payments_bot" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              Open Bot
            </Button>
          </a>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              title="No payment alerts yet"
              description="When someone pays through one of your links, the latest bot alerts will appear here."
              href="/payment-links"
              cta="Open payment links"
              icon={MessageCircle}
            />
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-foreground/5">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-sm text-neutral-500">
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-foreground/[0.02]">
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-foreground">{formatAmount(payment.amount, payment.token)}</div>
                        <div className="mt-1 text-xs text-neutral-500">{formatDateTime(payment.createdAt)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full  bg-primary/10 px-2.5 py-1 text-xs text-primary">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-foreground">{payment.source}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {payment.channel} | {payment.txHash ? shortHash(payment.txHash, 8, 6) : "Pending tx"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500">Recent Links</div>
            <CardTitle className="mt-2 text-lg">Tracked Links</CardTitle>
          </div>
          <Link href="/payment-links">
            <Button variant="outline">
              Open Links
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <EmptyState
              title="No tracked links yet"
              description="Links you create on the web app will appear here once they are ready to share and track in Telegram."
              href="/payment-links"
              cta="Open payment links"
              icon={Link2}
            />
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-foreground/5">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-sm text-neutral-500">
                    <th className="px-5 py-4">Link</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-foreground/[0.02]">
                      <td className="px-5 py-4">
                        <div className="text-sm text-foreground">{link.title}</div>
                        <div className="mt-1 font-mono text-xs text-neutral-500">{shortHash(link.requestId, 8, 6)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                          {link.active ? "Active" : "Inactive"}
                        </span>
                        <div className="mt-1 text-xs text-neutral-500">{formatDateTime(link.createdAt)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-foreground">{link.totalVolume.toFixed(4)} ALEO</div>
                        <div className="mt-1 text-xs text-neutral-500">{link.paymentsReceived} payments</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
