"use client"

import Link from "next/link"
import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { Copy, ExternalLink } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentLinksAccessGate } from "@/features/payment-links/components/payment-links-access-gate"
import { LinkStatusBadge } from "@/features/payment-links/components/link-status-badge"
import { PaymentLinkPaymentsTable } from "@/features/payment-links/components/payment-link-payments-table"
import { PaymentLinksSectionHeader } from "@/features/payment-links/components/payment-links-section-header"
import {
  formatAmount,
  formatDateOnly,
  formatDateTime,
  shortHash,
} from "@/features/payment-links/lib/presentation"
import { usePaymentLinkDetails } from "@/hooks/use-payment-link-details"

export function PaymentLinkDetailSection({ linkId }: { linkId: string }) {
  const { connected, address } = useWallet()
  const creatorAddress = address || ""
  const { detail, error, loading } = usePaymentLinkDetails(linkId, creatorAddress)
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${linkId}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <PaymentLinksAccessGate connected={connected}>
      <div className="space-y-8">
        <div>
          <Link href="/payment-links/links">
            <Button variant="outline" >
             
              Back to links
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
            <CardContent className="p-10 text-sm text-neutral-400">Loading payment link details...</CardContent>
          </Card>
        ) : !detail ? (
          <Alert variant="destructive">
            <AlertDescription>{error || "Failed to load payment link details."}</AlertDescription>
          </Alert>
        ) : (
          <>
            <PaymentLinksSectionHeader
              eyebrow="Link Details"
              title={detail.title}
              description={detail.description || "See how this payment link is doing, review payments, and take the next step when needed."}
              action={
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-2xl border-foreground/10 bg-neutral-900/60" onClick={() => void copyLink()}>
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <a href={`/pay/${detail.id}`} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-2xl bg-[#F1F66A] text-black hover:bg-[#FAFF8B]">
                      <ExternalLink className="h-4 w-4" />
                      Open link page
                    </Button>
                  </a>
                </div>
              }
            />

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
                <CardHeader className="border-b border-foreground/5">
                  <div className="flex flex-wrap items-center gap-3">
                    <LinkStatusBadge
                      active={detail.active}
                      expiresAt={detail.expiresAt}
                      maxPayments={detail.maxPayments}
                      paymentsReceived={detail.paymentsReceived}
                    />
                    <div className="font-mono text-xs text-neutral-500">{shortHash(detail.requestId, 10, 8)}</div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                  <DetailMetric label="Amount" value={detail.allowCustomAmount ? `Variable ${detail.token}` : formatAmount(detail.amount, detail.token)} />
                  <DetailMetric label="Volume" value={`${Number(detail.totalVolume).toFixed(4)} ALEO`} />
                  <DetailMetric label="Payments" value={String(detail.paymentsReceived)} />
                  <DetailMetric label="Conversion" value={`${(detail.analytics.conversionRate * 100).toFixed(1)}%`} />
                  <DetailMetric label="Expiry" value={formatDateOnly(detail.expiresAt)} />
                  <DetailMetric label="Updated" value={formatDateTime(detail.updatedAt)} />
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
                <CardHeader className="border-b border-foreground/5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Link Metadata</div>
                  <CardTitle className="mt-2 text-lg">Link details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6 text-sm text-neutral-400">
                  <MetaRow label="Created" value={formatDateTime(detail.createdAt)} />
                  <MetaRow label="Request ID" value={detail.requestId} mono />
                  <MetaRow label="Template" value={detail.template.replace("-", " ")} />
                  <MetaRow label="Max payments" value={detail.maxPayments ? String(detail.maxPayments) : "No cap"} />
                  <MetaRow label="Views" value={String(detail.views)} />
                  <MetaRow label="Unique visitors" value={String(detail.uniqueVisitors)} />
                  {detail.successMessage ? <MetaRow label="Success message" value={detail.successMessage} /> : null}
                  {detail.redirectUrl ? <MetaRow label="Redirect after payment" value={detail.redirectUrl} mono /> : null}
                  {detail.template === "tip-jar" && detail.suggestedAmounts?.length ? (
                    <MetaRow
                      label="Suggested amounts"
                      value={detail.suggestedAmounts.map((amount) => `${amount} ${detail.token}`).join(", ")}
                    />
                  ) : null}
                  <MetaRow
                    label="Privacy"
                    value="This page can be shared openly. Who paid stays private by default, and proofs only reveal what the proof owner chooses to share."
                  />
                </CardContent>
              </Card>
            </div>

            <PaymentLinkPaymentsTable payments={detail.payments} requestId={detail.requestId} />
          </>
        )}
      </div>
    </PaymentLinksAccessGate>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-foreground/5 bg-black/20 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      <div className="mt-3 font-mono text-lg text-foreground">{value}</div>
    </div>
  )
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-black/20 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      <div className={mono ? "mt-2 break-all font-mono text-xs text-foreground" : "mt-2 text-sm text-foreground"}>{value}</div>
    </div>
  )
}
