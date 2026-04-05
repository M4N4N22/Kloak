"use client"

import { Bot, Link2 } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BotsActivityLedger } from "./components/bots-activity-ledger"
import { BotsCommandCenter } from "./components/bots-command-center"
import { BotsKpiGrid } from "./components/bots-kpi-grid"
import { BotsPulseHeader } from "./components/bots-pulse-header"
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
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Connect your wallet to operate the Telegram bot</h1>
          <p className="text-sm leading-7 text-neutral-400">
            Link Telegram to monitor existing payment links, get paid alerts, share links into chats, and check analytics without leaving the bot.
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
  const { overview, loading, error } = useBotsOverview(actorAddress)

  if (!connected) {
    return <BotsDisconnectedState />
  }

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
    <div className="space-y-5 bg-neutral-950 text-foreground">
      <BotsPulseHeader
        online={overview.pulse.online}
        linked={overview.pulse.linked}
        alerts={overview.pulse.alerts}
        botUsername={TELEGRAM_BOT_USERNAME}
        botLink={TELEGRAM_BOT_LINK}
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

      <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Linking Flow</div>
            <div className="mt-2 text-lg font-medium text-foreground">Complete wallet linking from Telegram</div>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Start in Telegram, approve wallet linking in Kloak, then use the bot to track your links, share them faster, and receive payment alerts.
            </p>
          </div>
          <a href={TELEGRAM_BOT_LINK} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-2xl bg-[#F1F66A] text-black hover:bg-[#FAFF8B]">
              <Link2 className="h-4 w-4" />
              Open linking flow
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
