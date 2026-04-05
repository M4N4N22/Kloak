"use client"

import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardConnectivityPanel } from "./components/dashboard-connectivity-panel"
import { DashboardDisconnectedState } from "./components/dashboard-disconnected-state"
import { DashboardKpiBento } from "./components/dashboard-kpi-bento"
import { DashboardLedger } from "./components/dashboard-ledger"
import { DashboardPulseHeader } from "./components/dashboard-pulse-header"
import { useDashboardOverview } from "@/hooks/use-dashboard-overview"

function DashboardLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-16 animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr_0.6fr]">
        <div className="h-[360px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
        <div className="h-[360px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
        <div className="h-[360px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
      </div>
      <div className="h-[240px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-[420px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
        <div className="h-[420px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { address, connected } = useWallet()
  const actorAddress = address || ""
  const { overview, loading, error } = useDashboardOverview(actorAddress)

  if (!connected) {
    return <DashboardDisconnectedState />
  }

  if (loading && !overview) {
    return <DashboardLoadingState />
  }

  if (!overview) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Failed to load dashboard overview"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <DashboardPulseHeader
        telegramOnline={overview.pulse.telegram.online}
        webhookStatus={overview.pulse.webhooks.status}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <DashboardKpiBento
        totalVolume={overview.metrics.totalVolume}
        activeLinks={overview.metrics.activeLinks}
        conversionRate={overview.metrics.conversionRate}
        disclosureRate={overview.metrics.disclosureRate}
        disclosedPayments={overview.metrics.disclosedPayments}
        totalPayments={overview.metrics.totalPayments}
        botActivity={overview.metrics.botActivity}
        linkedTelegramUsers={overview.connectivity.telegram.linkedUsers}
        chart={overview.metrics.chart}
      />

      <DashboardConnectivityPanel
        telegram={overview.connectivity.telegram}
        webhooks={overview.connectivity.webhooks}
        automation={overview.connectivity.automation}
      />

      <DashboardLedger
        payments={overview.feeds.payments}
        proofs={overview.feeds.proofs}
      />
    </div>
  )
}
