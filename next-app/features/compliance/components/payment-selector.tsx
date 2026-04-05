"use client"

import { ArrowDownLeft, ArrowUpRight, Clock3, RefreshCw, CheckCircle2, ListFilter } from "lucide-react"

import type { CompliancePayment } from "@/hooks/use-compliance-payments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime, formatMoney, shortHash } from "@/features/compliance/lib/presentation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"



type PaymentSelectorProps = {
  payments: {
    sent: CompliancePayment[]
    received: CompliancePayment[]
  }
  selectedTxHash: string
  loading: boolean
  error: string | null
  onRefresh: () => void
  onSelect: (payment: CompliancePayment) => void
}

export function PaymentSelector({
  payments,
  selectedTxHash,
  loading,
  error,
  onRefresh,
  onSelect,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-1">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-primary" />
            Select Source Payment
          </h3>
          <p className="text-sm text-neutral-500 max-w-lg">
            Choose a verified transaction from your ledger to anchor your disclosure proof.
          </p>
        </div>
        <Button
          variant="outline"

          onClick={onRefresh}
          disabled={loading}

        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Sync Ledger
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-400">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Structured Tabs for Focus */}
      <Tabs defaultValue="sent" className="w-full ">
        <TabsList className="mb-6" variant="line">
          <TabsTrigger value="sent" className="">
            <ArrowUpRight className=" h-4 w-4" /> Sent
          </TabsTrigger>
          <TabsTrigger value="received" className="">
            <ArrowDownLeft className="h-4 w-4" /> Received
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="outline-none">
          <PaymentGrid
            items={payments.sent}
            selectedTxHash={selectedTxHash}
            onSelect={onSelect}
            emptyText="No outbound payments found."
          />
        </TabsContent>
        <TabsContent value="received" className="outline-none">
          <PaymentGrid
            items={payments.received}
            selectedTxHash={selectedTxHash}
            onSelect={onSelect}
            emptyText="No inbound payments found."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PaymentGrid({ items, selectedTxHash, onSelect, emptyText }: any) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-[2.5rem] border border-dashed border-foreground/10 bg-neutral-950/40">
        <p className="text-sm text-neutral-500 italic">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-foreground/5 bg-neutral-900/40">
      {/* Table Header - Matching the Proofs Ledger */}
      <div className="grid grid-cols-[64px_1fr_120px_160px_140px] gap-4 border-b border-foreground/5 bg-foreground/[0.02] px-6 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
        <div className="text-center">Select</div>
        <div>Transaction / Request</div>
        <div className="text-right">Amount</div>
        <div>Date & Time</div>
        <div className="text-right">Hash</div>
      </div>

      <RadioGroup
        value={selectedTxHash}
        onValueChange={(hash) => {
          const item = items.find((i: any) => i.txHash === hash)
          if (item) onSelect(item)
        }}
        className="gap-0" // Remove gap to make it a continuous list
      >
        {items.map((payment: any) => {
          const isSelected = payment.txHash === selectedTxHash

          return (
            <div
              key={payment.id}
              onClick={() => onSelect(payment)}
              className={cn(
                "relative grid grid-cols-[64px_1fr_120px_160px_140px] items-center gap-4 px-6 py-5 cursor-pointer group transition-all duration-200",
                "border-b border-foreground/4 last:border-0",
                isSelected
                  ? "bg-primary/3"
                  : "hover:bg-foreground/2"
              )}
            >
              {/* Active Selection Indicator Bar */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
              )}

              {/* Column 1: Selection Target */}
              <div className="flex justify-center">
                <RadioGroupItem
                  value={payment.txHash}
                  id={payment.txHash}
                  className={cn(
                    "transition-all",
                    isSelected ? "border-primary text-primary" : "border-neutral-700"
                  )}
                />
              </div>

              {/* Column 2: Contextual Info */}
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  "text-sm font-semibold truncate transition-colors",
                  isSelected ? "text-primary" : " group-hover:text-primary/80"
                )}>
                  {payment.title}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter">Req:</span>
                  <code className="text-[11px] font-mono text-neutral-500">{shortHash(payment.requestId, 6, 4)}</code>
                </div>
              </div>

              {/* Column 3: Amount - Bold Monospace */}
              <div className={cn(
                "text-right font-mono text-base font-bold tabular-nums tracking-tight transition-colors",
                isSelected ? "" : "text-neutral-300"
              )}>
                {formatMoney(payment.amount, payment.token)}
              </div>

              {/* Column 4: Timestamp */}
              <div className="flex flex-col text-[11px] font-medium text-neutral-500 px-2">
                <div className="flex items-center gap-1.5">

                  {formatDateTime(payment.createdAt)}
                </div>
              </div>

              {/* Column 5: Immutable Hash Badge */}
              <div className="text-right">
                <div className={cn(
                  "inline-block px-2.5 py-1 rounded-lg  font-mono text-[10px] transition-all",
                  isSelected
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-black/40 border-foreground/5 text-neutral-500 group-hover:text-neutral-300"
                )}>
                  {shortHash(payment.txHash, 6, 4)}
                </div>
              </div>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}