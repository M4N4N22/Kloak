"use client"

import Link from "next/link"
import { ArrowUpRight, FileStack, Receipt, Radio } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime, formatProofTypeLabel, shortHash } from "@/features/compliance/lib/presentation"

type PaymentFeedItem = {
  id: string
  amount: string
  token: "ALEO" | "USDCX" | "USAD"
  status: string
  source: string
  sourceType: string
  createdAt: string
  txHash: string | null
}

type ProofFeedItem = {
  proofId: string
  paymentTxHash: string
  createdAt: string
  proofType: "existence" | "amount" | "threshold"
  actorRole: "payer" | "receiver"
  status: string
  verificationCount: number
}

function formatAmount(value: string, token: string) {
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })} ${token}`
}

function EmptyLedger({
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
  icon: typeof Receipt
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
        <Button className="rounded-2xl bg-[#F1F66A] text-black hover:bg-[#FAFF8B]">{cta}</Button>
      </Link>
    </div>
  )
}

export function DashboardLedger({
  payments,
  proofs,
}: {
  payments: PaymentFeedItem[]
  proofs: ProofFeedItem[]
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Recent Payments</div>
            <CardTitle className="mt-2 text-lg">Payment Ledger</CardTitle>
          </div>
          <Link href="/payment-links">
            <Button variant="outline" size="sm">
              Open Links
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyLedger
              title="No payments yet"
              description="Once payment links start converting, recent payments will appear here with status and source context."
              href="/payment-links"
              cta="Create payment link"
              icon={Receipt}
            />
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-foreground/5">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Link Source</th>
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
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-foreground">{payment.source}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {payment.sourceType} • {payment.txHash ? shortHash(payment.txHash, 8, 6) : "Pending tx"}
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

      <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              Live Proof Feed
            </div>
            <CardTitle className="mt-2 text-lg">Compliance Ledger</CardTitle>
          </div>
          <Link href="/compliance/proofs">
            <Button variant="outline" size="sm">
              Open Ledger
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {proofs.length === 0 ? (
            <EmptyLedger
              title="No proofs issued"
              description="Generate your first selective disclosure proof to start building a verifiable compliance ledger."
              href="/compliance/generate"
              cta="Generate proof"
              icon={FileStack}
            />
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-foreground/5">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                    <th className="px-5 py-4">Proof Type</th>
                    <th className="px-5 py-4">Validity</th>
                    <th className="px-5 py-4">Payment Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {proofs.map((proof) => (
                    <tr key={proof.proofId} className="hover:bg-foreground/[0.02]">
                      <td className="px-5 py-4">
                        <div className="text-sm text-foreground">
                          {formatProofTypeLabel(proof.proofType)}
                        </div>
                        <div className="mt-1 text-xs capitalize text-neutral-500">
                          {proof.actorRole} disclosure • {formatDateTime(proof.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Radio className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono text-sm text-foreground">{proof.status}</span>
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {proof.verificationCount} verification events
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-foreground">
                          {shortHash(proof.paymentTxHash, 8, 6)}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {shortHash(proof.proofId, 8, 6)}
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
    </div>
  )
}
