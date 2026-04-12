"use client"

import { AlertCircle, ArrowDownLeft, ArrowUpRight, RefreshCw, ListFilter } from "lucide-react"

import type { CompliancePayment, CompliancePaymentDiagnostic } from "@/hooks/use-compliance-payments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime, formatMoney, shortHash } from "@/features/compliance/lib/presentation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { useState } from "react"



type PaymentSelectorProps = {
  payments: {
    sent: CompliancePayment[]
    received: CompliancePayment[]
    diagnostics: {
      sent: CompliancePaymentDiagnostic[]
      received: CompliancePaymentDiagnostic[]
    }
  }
  selectedTxHash: string
  loading: boolean
  recoveringCommitment?: string | null
  error: string | null
  onRefresh: () => void
  onSelect: (payment: CompliancePayment) => void
  onRecover?: (input: { diagnostic: CompliancePaymentDiagnostic; txHash: string }) => Promise<void>
}

type PaymentGridProps = {
  items: CompliancePayment[]
  diagnostics: CompliancePaymentDiagnostic[]
  selectedTxHash: string
  recoveringCommitment?: string | null
  onSelect: (payment: CompliancePayment) => void
  onRecover?: (input: { diagnostic: CompliancePaymentDiagnostic; txHash: string }) => Promise<void>
  emptyText: string
}

function dedupeCompliancePayments(items: CompliancePayment[]) {
  const byTxHash = new Map<string, CompliancePayment>()

  for (const item of items) {
    const existing = byTxHash.get(item.txHash)

    if (!existing) {
      byTxHash.set(item.txHash, item)
      continue
    }

    const existingIsWalletBacked = existing.paymentSource === "wallet" && Boolean(existing.walletReceipt)
    const currentIsWalletBacked = item.paymentSource === "wallet" && Boolean(item.walletReceipt)

    if (!existingIsWalletBacked && currentIsWalletBacked) {
      byTxHash.set(item.txHash, item)
    }
  }

  return Array.from(byTxHash.values())
}

export function PaymentSelector({
  payments,
  selectedTxHash,
  loading,
  recoveringCommitment,
  error,
  onRefresh,
  onSelect,
  onRecover,
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
          <RefreshCw className={cn("mr-2 h-3 w-3", loading && "animate-spin")} />
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
            diagnostics={payments.diagnostics.sent}
            selectedTxHash={selectedTxHash}
            recoveringCommitment={recoveringCommitment}
            onSelect={onSelect}
            onRecover={onRecover}
            emptyText="No outbound payments found."
          />
        </TabsContent>
        <TabsContent value="received" className="outline-none">
          <PaymentGrid
            items={payments.received}
            diagnostics={payments.diagnostics.received}
            selectedTxHash={selectedTxHash}
            recoveringCommitment={recoveringCommitment}
            onSelect={onSelect}
            onRecover={onRecover}
            emptyText="No inbound payments found."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PaymentGrid({
  items,
  diagnostics,
  selectedTxHash,
  recoveringCommitment,
  onSelect,
  onRecover,
  emptyText,
}: PaymentGridProps) {
  const [recoveryInputs, setRecoveryInputs] = useState<Record<string, string>>({})
  const uniqueItems = dedupeCompliancePayments(items)

  if (uniqueItems.length === 0 && diagnostics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-[2.5rem] border border-dashed border-foreground/10 bg-neutral-950/40">
        <p className="text-sm text-neutral-500 italic">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uniqueItems.length > 0 ? (
        <div className="w-full overflow-hidden rounded-3xl border">
          {/* Table Header - Matching the Proofs Ledger */}
          <div className="grid grid-cols-[64px_1fr_120px_160px_140px] gap-4 border-b  px-6 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            <div className="text-center">Select</div>
            <div>Transaction / Request</div>
            <div className="text-right">Amount</div>
            <div>Date & Time</div>
            <div className="text-right">Hash</div>
          </div>

        <RadioGroup
          value={selectedTxHash}
          onValueChange={(hash) => {
            const item = uniqueItems.find((candidate) => candidate.txHash === hash)
            if (item) onSelect(item)
          }}
          className="gap-0"
        >
          {uniqueItems.map((payment) => {
            const isSelected = payment.txHash === selectedTxHash

            return (
              <div
                key={`${payment.direction}:${payment.txHash}`}
                onClick={() => onSelect(payment)}
                className={cn(
                  "relative grid grid-cols-[64px_1fr_120px_160px_140px] items-center gap-4 px-6 py-5 cursor-pointer group transition-all duration-200",
                  "border-b border-foreground/4 last:border-0",
                  isSelected
                    ? "bg-primary/3"
                    : "hover:bg-foreground/2"
                )}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                )}

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

                <div className={cn(
                  "text-right font-mono text-base font-bold tabular-nums tracking-tight transition-colors",
                  isSelected ? "" : "text-neutral-300"
                )}>
                  {formatMoney(payment.amount, payment.token)}
                </div>

                <div className="flex flex-col text-[11px] font-medium text-neutral-500 px-2">
                  <div className="flex items-center gap-1.5">
                    {formatDateTime(payment.createdAt)}
                  </div>
                </div>

                <div className="text-right">
                  <div className={cn(
                    "inline-block px-2.5 py-1 rounded-lg font-mono text-[10px] transition-all",
                    isSelected
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-black/40 border-foreground/5 text-neutral-500 group-hover:text-neutral-300"
                  )}>
                    {payment.paymentSource === "wallet" ? "Wallet receipt" : shortHash(payment.txHash, 6, 4)}
                  </div>
                </div>
              </div>
            )
          })}
        </RadioGroup>
      </div>
      ) : null}

      {diagnostics.length > 0 ? (
        <div className="rounded-[2rem] border border-orange-500/15 bg-orange-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-orange-500/10 p-2 text-orange-300">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-orange-100">Some wallet receipts are not ready for proofs yet</p>
              <p className="text-xs leading-relaxed text-orange-100/75">
                These receipts are real, but Kloak could not safely match them to a proof-ready payment record yet. Use the notes below to understand why.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {diagnostics.map((item) => (
              <div key={item.id} className="rounded-2xl border border-foreground/5 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs leading-relaxed text-neutral-400">{item.message}</p>
                    <p className="text-xs text-orange-100/80">{item.actionLabel}</p>
                    {item.reasonCode === "PAYMENT_NOT_SYNCED" && onRecover ? (
                      <div className="pt-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            value={recoveryInputs[item.id] || ""}
                            onChange={(event) =>
                              setRecoveryInputs((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                            placeholder="Paste the original payment transaction hash"
                            className="h-10 border-foreground/10 bg-black/30 text-sm text-foreground placeholder:text-neutral-500"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={recoveringCommitment === item.commitment}
                            onClick={() =>
                              void onRecover({
                                diagnostic: item,
                                txHash: recoveryInputs[item.id] || "",
                              })
                            }
                            className="shrink-0"
                          >
                            <RefreshCw
                              className={cn(
                                "mr-2 h-3.5 w-3.5",
                                recoveringCommitment === item.commitment && "animate-spin",
                              )}
                            />
                            {recoveringCommitment === item.commitment ? "Recovering..." : "Recover payment"}
                          </Button>
                        </div>
                        <p className="pt-2 text-[11px] leading-relaxed text-neutral-500">
                          This rebuilds the missing payment row from your wallet receipt plus the original transaction hash. It does not ask you to pay again.
                        </p>
                        <p className="pt-1 text-[11px] leading-relaxed text-neutral-500">
                          You can usually find the transaction hash in your wallet activity, the original payment success screen, or an Aleo explorer if you already opened the payment there.
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-1 text-[11px] text-neutral-500 md:text-right">
                    <p>Req: <code className="font-mono">{shortHash(item.requestId, 6, 4)}</code></p>
                    <p>Receipt: <code className="font-mono">{shortHash(item.commitment, 6, 4)}</code></p>
                    <p>Amount: {item.amount}</p>
                    <p>Seen at: {formatDateTime(item.paymentTimestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
