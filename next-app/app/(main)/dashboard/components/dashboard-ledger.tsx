"use client"

import Link from "next/link"
import { ArrowUpRight, FileStack, LockKeyhole, Receipt, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime, shortHash } from "@/features/compliance/lib/presentation"

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

function SecureProofSummaryCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string
  helper: string
  icon: typeof ShieldCheck
}) {
  return (
    <div className="rounded-[2rem] border border-foreground/5 bg-black/20 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          {label}
        </div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-5 font-mono text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <p className="mt-3 text-xs leading-5 text-neutral-500">{helper}</p>
    </div>
  )
}

export function DashboardLedger({
  payments,
  proofAccessGranted,
  proofAccessLoading,
  proofSummary,
}: {
  payments: PaymentFeedItem[]
  proofAccessGranted: boolean
  proofAccessLoading: boolean
  proofSummary: {
    activeProofs: number
    distinctCoveredPayments: number
    revokedProofs: number
    verificationEvents: number
  }
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500">
              Recent Payments
            </div>
            <CardTitle className="text-lg">Payment Ledger</CardTitle>
          </div>
          <Link href="/payment-links">
            <Button variant="outline">
              View All Links
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
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-sm font-normal text-neutral-500">
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Title</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-foreground/[0.02]">
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-foreground">
                          {formatAmount(payment.amount, payment.token)}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {formatDateTime(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-foreground">{payment.source}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {payment.sourceType} •{" "}
                          {payment.txHash ? shortHash(payment.txHash, 8, 6) : "Pending tx"}
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

      <Card className="rounded-[2.5rem] border text-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
             
              Protected Proof Ledger
            </div>
            <CardTitle className="mt-2 text-lg">Compliance Ledger</CardTitle>
          </div>
          <Link href="/compliance/proofs">
            <Button variant="outline">
              Open Ledger
             
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!proofAccessGranted ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-foreground/10 bg-black/20 px-8 text-center">
              <div className="rounded-2xl bg-foreground/5 p-3 text-neutral-500">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div className="mt-5 max-w-sm space-y-2">
                <div className="font-medium text-foreground">Proof details stay inside compliance</div>
                <p className="text-sm leading-6 text-neutral-500">
                  The dashboard only shows a protected summary. Open Compliance to unlock the full issued-proof ledger.
                </p>
              </div>
              <Link href="/compliance/proofs" className="mt-5">
                <Button >
                  Unlock proof ledger
                </Button>
              </Link>
            </div>
          ) : proofAccessLoading ? (
            <div className="min-h-[260px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-black/20" />
          ) : proofSummary.activeProofs === 0 && proofSummary.revokedProofs === 0 ? (
            <EmptyLedger
              title="No proofs issued"
              description="Generate your first selective disclosure proof to start building a verifiable compliance ledger."
              href="/compliance/generate"
              cta="Generate proof"
              icon={FileStack}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <SecureProofSummaryCard
                label="Active proofs"
                value={String(proofSummary.activeProofs)}
                helper="Reusable proof documents currently available to share."
                icon={ShieldCheck}
              />
              <SecureProofSummaryCard
                label="Covered payments"
                value={String(proofSummary.distinctCoveredPayments)}
                helper="Distinct payments already backed by at least one active proof."
                icon={FileStack}
              />
              <SecureProofSummaryCard
                label="Revoked proofs"
                value={String(proofSummary.revokedProofs)}
                helper="Proofs you retired and can regenerate later if needed."
                icon={LockKeyhole}
              />
              <SecureProofSummaryCard
                label="Verification events"
                value={String(proofSummary.verificationEvents)}
                helper="Checks recorded across your issued proof history."
                icon={ArrowUpRight}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
