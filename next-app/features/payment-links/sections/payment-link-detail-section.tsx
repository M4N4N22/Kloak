"use client"

import Link from "next/link"
import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import type { LucideIcon } from "lucide-react"
import { Copy, ExternalLink, ArrowLeft, Globe, Activity, Fingerprint, BarChart3, Clock3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentLinksAccessGate } from "@/features/payment-links/components/payment-links-access-gate"
import { LinkStatusBadge } from "@/features/payment-links/components/link-status-badge"
import { PaymentLinkPaymentsTable } from "@/features/payment-links/components/payment-link-payments-table"
import { cn } from "@/lib/utils"
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

  if (loading) return <LoadingState />
  if (!detail) return <ErrorState error={error} />


  return (
    <PaymentLinksAccessGate connected={connected}>
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* 1. TOP CONTROL BAR */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/payment-links/links">
              <Button variant="secondary">
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{detail.title}</h1>
                <LinkStatusBadge active={detail.active} expiresAt={detail.expiresAt} />
              </div>
              <p className="text-sm text-zinc-500 font-mono tracking-tight">{shortHash(detail.requestId, 12, 10)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              onClick={() => void copyLink()}
              className={cn("")}
            >
              {copied ? "Link Copied" : "Copy Payment Link"}
            </Button>
            <a href={`/pay/${detail.id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                Open Page

              </Button>
            </a>
          </div>
        </div>

        {/* 2. PERFORMANCE BENTO GRID */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Net Volume"
            value={`${Number(detail.totalVolume).toFixed(2)} ALEO`}
            icon={Activity}
            primary
          />
          <MetricCard
            label="Conversion"
            value={`${(detail.analytics.conversionRate * 100).toFixed(1)}%`}
            icon={BarChart3}
          />
          <MetricCard
            label="Total Payments"
            value={String(detail.paymentsReceived)}
            icon={Globe}
          />
          <MetricCard
            label="Visitors"
            value={String(detail.uniqueVisitors)}
            icon={Fingerprint}
          />
        </div>

        {/* 3. MAIN CONTENT SPLIT */}
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

          <div className="space-y-6">
            {/* Primary Details Card */}
            <Card>
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
                  Configuration & Settings
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  <DetailItem
                    label="Amount"
                    value={detail.allowCustomAmount ? `Variable ${detail.token}` : formatAmount(detail.amount, detail.token)}
                  />
                  <DetailItem label="Expiry Date" value={formatDateOnly(detail.expiresAt)} />
                  <DetailItem label="Template" value={detail.template.replace("-", " ")} capitalized />
                  <DetailItem label="Max Payments" value={detail.maxPayments ? String(detail.maxPayments) : "Unlimited"} />
                </div>
              </CardContent>
            </Card>
              <div className="pt-6 border-t border-foreground/5">
                  <div className="rounded-2xl p-4 bg-foreground/2">
                    <p className="text-xs font-bold text-primary mb-1">Privacy Notice</p>
                    <p className="text-xs leading-relaxed text-zinc-400">
                      Who paid stays private by default. Selective disclosure lets the owner reveal only specific payment proofs.
                    </p>
                  </div>
                </div>

            {/* Payments Table */}

          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm text-zinc-500 mb-4">Internal Metadata</h3>
                  <div className="space-y-4">
                    <MetaRow label="Created At" value={formatDateTime(detail.createdAt)} />
                    <MetaRow label="Request ID" value={detail.requestId} mono />
                    <MetaRow label="Success Message" value={detail.successMessage || "Standard confirmation"} />
                    {detail.redirectUrl && <MetaRow label="Redirect URL" value={detail.redirectUrl} mono />}
                  </div>
                </div>

              
              </CardContent>
            </Card>
          </div>
        
        </div>
          <PaymentLinkPaymentsTable payments={detail.payments} requestId={detail.requestId} />
      </div>
    </PaymentLinksAccessGate>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-[2.5rem] border border-foreground/5 bg-zinc-900/40" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[2rem] border border-foreground/5 bg-zinc-900/40" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="h-[440px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-zinc-900/40" />
        <div className="h-[320px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-zinc-900/40" />
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string | null }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{error || "Failed to load payment link details"}</AlertDescription>
    </Alert>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  primary = false,
}: {
  label: string
  value: string
  icon: LucideIcon
  primary?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start ">
          <p className="text-base  text-zinc-500">{label}</p>
          <div className={cn("p-4 border rounded-full", primary ? "border-primary/10 text-primary" : "border text-zinc-500")}>

            <Icon className="h-4 w-4" />
          </div>
        </div>

        <h3 className={cn("mt-1 font-mono text-2xl font-bold tracking-tight", primary ? "text-foreground" : "text-zinc-200")}>
          {value}
        </h3>
      </CardContent>
    </Card>
  )
}

function DetailItem({
  label,
  value,
  capitalized = false,
}: {
  label: string
  value: string
  capitalized?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{label}</p>
      <p className={cn("text-lg font-medium text-zinc-200", capitalized && "capitalize")}>{value}</p>
    </div>
  )
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="space-y-1 bg-foreground/2 p-3 rounded-2xl">
      <p className="text-[10px] font-bold text-zinc-600 tracking-tight">{label}</p>
      <p className={cn("text-xs break-all leading-relaxed text-zinc-400", mono && "font-mono")}>{value}</p>
    </div>
  )
}
