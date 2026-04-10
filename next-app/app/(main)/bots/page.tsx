"use client"

import { Bot } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BotsActivityLedger } from "./components/bots-activity-ledger"
import { BotsCommandCenter } from "./components/bots-command-center"
import { BotsKpiGrid } from "./components/bots-kpi-grid"
import { BotsPulseHeader } from "./components/bots-pulse-header"
import { CreatorAccessGate } from "@/features/trust/components/creator-access-gate"
import { ContextHelpCard } from "@/features/trust/components/context-help-card"
import { useBotsOverview } from "@/hooks/use-bots-overview"

const TELEGRAM_BOT_USERNAME = "@kloak_private_payments_bot"
const TELEGRAM_BOT_LINK = "https://t.me/kloak_private_payments_bot"

function BotsDisconnectedState() {
  return (
    <div className="rounded-[2.5rem] border border-dashed border-foreground/10 bg-[radial-gradient(circle_at_top,rgba(156,227,125,0.12),transparent_30%),rgba(255,255,255,0.02)] p-16 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
        <div className="rounded-3xl bg-primary/10 p-4 text-primary">
          <Bot className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Connect your wallet to use the Telegram bot</h1>
          <p className="text-sm leading-7 text-neutral-400">
            Link your wallet to Telegram so you can share payment links, get paid alerts, and keep an eye on activity without leaving the chat.
          </p>
        </div>
        <WalletConnect />
      </div>
    </div>
  )
}

function BotsLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-16 animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="h-[420px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
        <div className="h-[420px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-[420px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
        <div className="h-[420px] animate-pulse rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40" />
      </div>
    </div>
  )
}

export default function BotsPage() {
  const { connected, address } = useWallet()
  const actorAddress = address || ""

  if (!connected) {
    return <BotsDisconnectedState />
  }

  return (
    <CreatorAccessGate
      disconnectedFallback={<BotsDisconnectedState />}
      eyebrow="Creator Workspace"
      title="Unlock your Telegram workspace"
      description="Your Telegram activity, linked users, and bot settings are tied to this wallet. We ask for a quick wallet check before opening them."
      actionLabel="Unlock Telegram workspace"
      dialogTitle="Confirm it’s you"
      dialogDescription="We’re about to ask your wallet for a quick confirmation so we can open Telegram activity and settings tied to this wallet. This is only an access check."
    >
      <BotsWorkspace actorAddress={actorAddress} />
    </CreatorAccessGate>
  )
}

function BotsWorkspace({ actorAddress }: { actorAddress: string }) {
  const { overview, loading, error } = useBotsOverview(actorAddress)

  if (loading && !overview) {
    return <BotsLoadingState />
  }

  if (!overview) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Failed to load bot overview"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto text-foreground">
      <BotsPulseHeader
        online={overview.pulse.online}
        linked={overview.pulse.linked}
        alerts={overview.pulse.alerts}
        botUsername={TELEGRAM_BOT_USERNAME}
        botLink={TELEGRAM_BOT_LINK}
      />

      <ContextHelpCard
        title="Need a quick guide to the bot?"
        description="Create links on the web, then use Telegram to share them, follow payments, and stay on top of activity from chat."
        links={[
          { label: "Open docs", href: "/docs" },
          { label: "Read privacy", href: "/privacy" },
          { label: "Get support", href: "/support" },
        ]}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <BotsKpiGrid
        linkedUsers={overview.metrics.linkedUsers}
        trackedLinksCount={overview.metrics.trackedLinksCount}
        paymentAlertsCount={overview.metrics.paymentAlertsCount}
        trackedVolume={overview.metrics.trackedVolume}
      />

      <BotsCommandCenter linked={overview.pulse.linked} />

      <BotsActivityLedger payments={overview.feeds.payments} links={overview.feeds.links} />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-neutral-500">Get Connected</div>
            <div className="mt-2 text-lg font-medium text-foreground">Link your wallet from Telegram</div>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Open the bot in Telegram, approve the wallet link in Kloak, and come back once the connection is done.
            </p>
          </div>
          <a href={TELEGRAM_BOT_LINK} target="_blank" rel="noopener noreferrer">
            <Button>
              Open linking flow
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
