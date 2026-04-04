"use client"

import { ArrowDownLeft, ArrowUpRight, Clock3, RefreshCw, Search, History, CheckCircle2 } from "lucide-react"
import type { CompliancePayment } from "@/hooks/use-compliance-payments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type CompliancePaymentPickerProps = {
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

function formatPaymentTime(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function CompliancePaymentPicker({
  payments,
  selectedTxHash,
  loading,
  error,
  onRefresh,
  onSelect,
}: CompliancePaymentPickerProps) {
  return (
    <div className="space-y-6">
      {/* Header with Search Look-alike */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-500" />
            Transaction Ledger
          </h3>
          <p className="text-sm text-zinc-500">Select a record to generate a cryptographic disclosure.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={loading}
          className="border-white/10 bg-zinc-900/50 hover:bg-zinc-800"
        >
          <RefreshCw className={cn("mr-2 h-3.5 w-3.5", loading && "animate-spin")} />
          Sync Ledger
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-400">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 p-1 border border-white/5 h-12 rounded-xl">
          <TabsTrigger value="sent" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Outbound
          </TabsTrigger>
          <TabsTrigger value="received" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-400">
            <ArrowDownLeft className="mr-2 h-4 w-4" /> Inbound
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="sent" className="m-0 space-y-3">
             <PaymentList 
               items={payments.sent} 
               selectedHash={selectedTxHash} 
               onSelect={onSelect} 
               type="sent" 
             />
          </TabsContent>
          <TabsContent value="received" className="m-0 space-y-3">
             <PaymentList 
               items={payments.received} 
               selectedHash={selectedTxHash} 
               onSelect={onSelect} 
               type="received" 
             />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function PaymentList({ items, selectedHash, onSelect, type }: { 
  items: CompliancePayment[], 
  selectedHash: string, 
  onSelect: (p: CompliancePayment) => void,
  type: 'sent' | 'received'
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-white/5 bg-zinc-950/50">
        <Search className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-sm text-zinc-500">No {type} transactions found in history.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
      {items.map((payment) => {
        const isSelected = payment.txHash === selectedHash
        
        return (
          <button
            key={payment.id}
            onClick={() => onSelect(payment)}
            className={cn(
              "group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-200",
              isSelected 
                ? "border-emerald-500/50 bg-emerald-500/5" 
                : "border-white/5 bg-zinc-900/30 hover:border-white/20 hover:bg-zinc-900/60"
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute right-0 top-0 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                  {payment.title || "Untitled Transaction"}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock3 className="h-3 w-3" />
                  {formatPaymentTime(payment.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {payment.amount} <span className="text-[10px] text-zinc-500">{payment.token}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-tighter text-zinc-600">Request ID</span>
                <div className="font-mono text-[10px] text-zinc-400 truncate bg-black/20 p-1.5 rounded border border-white/5">
                  {payment.requestId}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-tighter text-zinc-600">Transaction Hash</span>
                <div className="font-mono text-[10px] text-zinc-400 truncate bg-black/20 p-1.5 rounded border border-white/5">
                  {payment.txHash}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}