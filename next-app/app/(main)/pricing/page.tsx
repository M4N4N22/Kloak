"use client"

import { useEffect, useMemo, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import {
  BadgeCheck,
  Bot,
  Check,
  Crown,
  Link2,
  Loader2,
  Rocket,
  Sparkles,
  Webhook,
} from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type CreatorProfile = {
  walletAddress: string
  isProUser: boolean
}

const comparisonRows = [
  {
    label: "Private payment links",
    free: "Included",
    pro: "Included",
  },
  {
    label: "Custom amount links",
    free: "Included",
    pro: "Included",
  },
  {
    label: "Link expiry controls",
    free: "Short and standard expiries",
    pro: "Full range, including longer-lived links",
  },
  {
    label: "Max payment count controls",
    free: "Basic",
    pro: "Advanced",
  },
  {
    label: "Telegram bot workflows",
    free: "Basic notifications and link management",
    pro: "Priority automation surface as features expand",
  },
  {
    label: "Webhook endpoints",
    free: "1 creator endpoint",
    pro: "Multiple endpoints for different workflows",
  },
  {
    label: "Automation fit",
    free: "Solo builders and early testing",
    pro: "Studios, teams, and power users",
  },
]

export default function PricingPage() {
  const { connected, address } = useWallet()

  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || !address) {
      setProfile(null)
      return
    }

    const walletAddress = address // now inferred as string

    async function loadProfile() {
      setLoading(true)
      setErrorMessage(null)

      try {
        const res = await fetch(
          `/api/creator-profile?walletAddress=${encodeURIComponent(walletAddress)}`
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to load pricing state")
        }

        setProfile(data)
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to load creator profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [connected, address])

  const isProUser = profile?.isProUser ?? false

  const currentPlanCopy = useMemo(() => {
    if (!connected) return "Connect your wallet to preview or unlock Pro on testnet."
    if (loading) return "Loading your current creator plan."
    if (isProUser) return "This wallet is already unlocked for Pro features in the current test environment."

    return "You are currently on Free. Since this is testnet, upgrading simply marks this wallet as Pro in the database."
  }, [connected, isProUser, loading])

  const handleUpgrade = async () => {
    if (!address || upgrading) return

    setUpgrading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/creator-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to activate Pro")
      }

      setProfile(data)
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to activate Pro")
    } finally {
      setUpgrading(false)
    }
  }

  if (!connected) {
    return (
      <div className="rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/2 p-20 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Connect Shield Wallet
        </h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          Connect your wallet to choose a plan and unlock creator-level Pro access for testnet.
        </p>
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <Badge variant="secondary">Testnet Pricing</Badge>
          <div className="space-y-3">
            <h1 className="text-7xl tracking-tighter font-bold">
              Pricing
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Keep Free generous for normal users, and make Pro feel right for merchants, automators, and heavier operators.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Payment Links</Badge>
            <Badge variant="secondary">Telegram Bot</Badge>
            <Badge variant="secondary">Webhooks</Badge>
            <Badge variant="secondary">Automation</Badge>
          </div>
        </div>

        <Card className="p-6 min-w-[320px] bg-white/5 border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {isProUser ? (
                <BadgeCheck className="h-5 w-5 text-primary" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
              <span className="font-semibold">
                Current plan: {isProUser ? "Pro" : "Free"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentPlanCopy}
            </p>
            <Button
              className="w-full"
              disabled={loading || upgrading || isProUser}
              onClick={handleUpgrade}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading
                </>
              ) : upgrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activating Pro
                </>
              ) : isProUser ? (
                "Pro Already Active"
              ) : (
                "Unlock Pro for Testnet"
              )}
            </Button>
          </div>
        </Card>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-8 rounded-[2rem] border-white/10 bg-white/5">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Link2 className="h-5 w-5 text-primary" />
                <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Free
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tight">For normal users</h2>
                <p className="text-muted-foreground">
                  Enough to create links, test flows, and run lightweight operations without friction.
                </p>
              </div>
            </div>

            <div className="text-5xl font-bold tracking-tight">
              $0
              <span className="text-base text-muted-foreground font-medium ml-2">
                while in testnet
              </span>
            </div>

            <div className="space-y-3">
              {[
                "Create upto 5 private payment links",
                "Set basic expiry windows",
                "Control max number of payments",
                "Use Telegram bot for core workflows",
                "One webhook endpoint for simple automation",
                "Great for solo creators, testers, and early demos",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-8 rounded-[2rem] border-primary/30 bg-linear-to-br from-primary/10 via-white/5 to-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-primary" />
                <span className="text-sm uppercase tracking-[0.2em] text-primary">
                  Pro
                </span>
                <Badge variant="secondary">Power Users</Badge>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tight">For operators and automators</h2>
                <p className="text-muted-foreground">
                  Best for merchants and teams who want more control over automation, link policies, and scaling behavior.
                </p>
              </div>
            </div>

            <div className="text-5xl font-bold tracking-tight">
              Testnet Unlock
             
            </div>

            <div className="space-y-3">
              {[
                "Everything in Free",
                "Create Unlimited private payment links",
                "Multiple webhook endpoints for different backends",
                "Stronger fit for advanced automation workflows",
                "Expanded expiry options and longer-running links",
                "Future-ready access for deeper Telegram and workflow features",
                "Better suited to teams, agencies, and power merchants",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 rounded-full font-semibold"
              disabled={upgrading || isProUser}
              onClick={handleUpgrade}
            >
              {upgrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activating
                </>
              ) : isProUser ? (
                "Pro Active on This Wallet"
              ) : (
                "Upgrade This Wallet to Pro"
              )}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-8 rounded-[2rem] border-white/10 bg-black/20">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Feature Breakdown</h2>
            <p className="text-sm text-muted-foreground">
              The split is intentionally lightweight for now: Free handles normal usage, Pro is for heavier operational needs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-white/10 pb-3">
                <div>Feature</div>
                <div>Free</div>
                <div>Pro</div>
              </div>

              <div className="space-y-3 pt-4">
                {comparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.6fr_1fr_1fr] gap-3 items-start rounded-2xl bg-white/5 p-4"
                  >
                    <div className="font-medium">{row.label}</div>
                    <div className="text-sm text-muted-foreground">{row.free}</div>
                    <div className="text-sm text-muted-foreground">{row.pro}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 rounded-[1.75rem] bg-white/5 border-white/10 space-y-3">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Telegram-first operators</h3>
          <p className="text-sm text-muted-foreground">
            Free is enough to start, but Pro is the right home for users who will lean hard into bot workflows over time.
          </p>
        </Card>

        <Card className="p-6 rounded-[1.75rem] bg-white/5 border-white/10 space-y-3">
          <Webhook className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Automation-heavy builders</h3>
          <p className="text-sm text-muted-foreground">
            One endpoint is enough for simple use. Multiple endpoints is where power-user automation starts to matter.
          </p>
        </Card>

        <Card className="p-6 rounded-[1.75rem] bg-white/5 border-white/10 space-y-3">
          <Rocket className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Testing now, gating later</h3>
          <p className="text-sm text-muted-foreground">
            This page does not charge anyone yet. It only stores plan state so the product can gate features later.
          </p>
        </Card>
      </div>
    </div>
  )
}
