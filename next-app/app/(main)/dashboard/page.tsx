"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardConnectivityPanel } from "./components/dashboard-connectivity-panel"
import { DashboardDisconnectedState } from "./components/dashboard-disconnected-state"
import { DashboardKpiBento } from "./components/dashboard-kpi-bento"
import { DashboardLedger } from "./components/dashboard-ledger"
import { DashboardPulseHeader } from "./components/dashboard-pulse-header"
import { CreatorAccessGate } from "@/features/trust/components/creator-access-gate"
import { useDashboardOverview } from "@/hooks/use-dashboard-overview"
import { useSelectiveDisclosureProofs } from "@/hooks/use-selective-disclosure-proofs"
import {
  COMPLIANCE_READ_SCOPE,
  getCachedComplianceAccessPayload,
} from "@/lib/compliance-access"

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

  if (!connected) {
    return <DashboardDisconnectedState />
  }

  return (
    <CreatorAccessGate
      disconnectedFallback={<DashboardDisconnectedState />}
      eyebrow="Creator Workspace"
      title="Unlock your dashboard"
      description="Your dashboard includes payment performance, link activity, and creator settings tied to this wallet. We ask for a quick wallet check before opening it."
      actionLabel="Unlock dashboard"
      dialogTitle="Confirm it’s you"
      dialogDescription="We’re about to ask your wallet for a quick confirmation so we can open dashboard data tied to this wallet. This is only an access check."
    >
      <DashboardWorkspace actorAddress={actorAddress} />
    </CreatorAccessGate>
  )
}

function DashboardWorkspace({ actorAddress }: { actorAddress: string }) {
  const [selectedToken, setSelectedToken] = useState<"ALEO" | "USDCX" | "USAD">("ALEO")
  const { overview, loading, error } = useDashboardOverview(actorAddress, selectedToken)
  const { proofs, loading: proofsLoading } = useSelectiveDisclosureProofs(actorAddress)
  const hasProofAccess = useSyncExternalStore(
    () => () => { },
    () =>
      actorAddress
        ? Boolean(getCachedComplianceAccessPayload(COMPLIANCE_READ_SCOPE, actorAddress))
        : false,
    () => false,
  )

  const proofSummary = useMemo(() => {
    const activeProofs = proofs.filter((proof) => proof.status === "ACTIVE")
    const distinctCoveredPayments = new Set(activeProofs.map((proof) => proof.paymentTxHash)).size
    const verificationEvents = proofs.reduce((sum, proof) => sum + proof.verificationCount, 0)

    return {
      activeProofs: activeProofs.length,
      distinctCoveredPayments,
      revokedProofs: proofs.filter((proof) => proof.status === "REVOKED").length,
      verificationEvents,
      disclosureRate:
        overview && overview.metrics.totalPayments > 0
          ? distinctCoveredPayments / overview.metrics.totalPayments
          : 0,
    }
  }, [overview, proofs])

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
        disclosureRate={proofSummary.disclosureRate}
        disclosedPayments={proofSummary.distinctCoveredPayments}
        totalPayments={overview.metrics.totalPayments}
        linkedTelegramUsers={overview.connectivity.telegram.linkedUsers}
        telegramOnline={overview.pulse.telegram.online}
        chart={overview.metrics.chart}
        selectedToken={overview.metrics.selectedToken}
        onTokenChange={setSelectedToken}
        proofAccessGranted={hasProofAccess}
        proofAccessLoading={proofsLoading}
      />
      
      <DashboardLedger
        payments={overview.feeds.payments}
        proofAccessGranted={hasProofAccess}
        proofAccessLoading={proofsLoading}
        proofSummary={proofSummary}
      />

      <DashboardConnectivityPanel
        telegram={overview.connectivity.telegram}
        webhooks={overview.connectivity.webhooks}
        automation={overview.connectivity.automation}
      />
    </div>
  )
}
