"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import {
  BadgeCheck,
  Check,
  Loader2,
  LockKeyhole,
  Sparkles,
} from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { PricingComparisonTable } from "@/features/pricing/components/pricing-comparison-table"
import {
  PricingActionButton,
  PricingPlanCard,
} from "@/features/pricing/components/pricing-plan-card"
import {
  comparisonRows,
  pricingPlans,
  pricingTrustBadges,
} from "@/features/pricing/lib/pricing-content"
import { useCreatorProfile } from "@/hooks/use-creator-profile"
import {
  CREATOR_WRITE_SCOPE,
  getOrCreateCreatorAccessPayload,
} from "@/lib/creator-access"
import { cn } from "@/lib/utils"

const principleItems = [
  "No charges during testnet",
  "Unlimited payment links on Free",
  "Pay for scale and controls later",
]

export default function PricingPage() {
  const { connected, address, signMessage } = useWallet()
  const { profile, loading, error, refresh } = useCreatorProfile(connected ? address : null, {
    autoAuthorize: false,
  })

  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  const isProUser = profile?.isProUser ?? false
  const freePlan = pricingPlans.find((plan) => plan.id === "free")!
  const proPlan = pricingPlans.find((plan) => plan.id === "pro")!

  const walletStateCopy = useMemo(() => {
    if (!connected) {
      return {
        title: "No wallet connected",
        body:
          "You can compare plans right away. Connect a wallet only if you want to activate the Pro testnet unlock.",
      }
    }

    if (loading) {
      return {
        title: "Checking this wallet",
        body: "Loading current testnet access for the connected wallet.",
      }
    }

    if (isProUser) {
      return {
        title: "Pro is active on this wallet",
        body: "This wallet already has the Pro testnet unlock. No payment is collected during testnet.",
      }
    }

    return {
      title: "This wallet is on Free",
      body: "Free is fully usable. Upgrade only if you want to preview Pro-level access on testnet.",
    }
  }, [connected, isProUser, loading])

  const handleUpgrade = async () => {
    if (!address || upgrading) return

    setUpgrading(true)
    setUpgradeError(null)

    try {
      const access = await getOrCreateCreatorAccessPayload({
        scope: CREATOR_WRITE_SCOPE,
        viewerAddress: address,
        signMessage,
      })
      const res = await fetch("/api/creator-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewerAddress: access.viewerAddress,
          scope: access.scope,
          issuedAt: access.issuedAt,
          signature: access.signature,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "We could not activate Pro for this wallet right now.")
      }

      await refresh()
    } catch (err: unknown) {
      setUpgradeError(
        err instanceof Error ? err.message : "We could not activate Pro for this wallet right now."
      )
    } finally {
      setUpgrading(false)
    }
  }

  const statusError = upgradeError || error

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12">
        <section className="">
          <div className="">

            <div className="mx-auto max-w-4xl space-y-7 px-2 py-12 text-center sm:py-16">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge variant={"secondary"} >
                  Pricing
                </Badge>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-7xl">
                  Plans and Pricing
                </h1>
                <p className="mx-auto max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
                  Start with a free plan. Unlock Pro when you need more control across automation, integrations, analytics, and heavier proof workflows.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="rounded-full border border-foreground/8 bg-foreground/[0.05] px-4 py-2 text-xs font-medium text-foreground">
                  Testnet Live
                </div>
                <div className="rounded-full border border-foreground/8 bg-transparent px-4 py-2 text-xs font-medium text-neutral-500">
                  Mainnet Soon
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <PricingPlanCard
                plan={freePlan}
                tone="neutral"
                planStateLabel={!connected ? "Available now" : !isProUser ? "Current wallet default" : undefined}
                action={
                  <Link href="/payment-links">
                    <PricingActionButton label="Start with Free" />
                  </Link>
                }
              />

              <PricingPlanCard
                plan={proPlan}
                featured
                tone="blue"
                planStateLabel={isProUser ? "Active on this wallet" : "Testnet unlock"}
                action={
                  !connected ? (
                    <div className="space-y-3">
                      <p className="text-sm leading-6 text-neutral-500">
                        Connect a wallet when you want to activate the Pro testnet unlock.
                      </p>
                      <WalletConnect />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <PricingActionButton
                        featured
                        label={isProUser ? "Pro active on this wallet" : "Unlock Pro on testnet"}
                        onClick={handleUpgrade}
                        loading={upgrading}
                        disabled={loading || upgrading || isProUser}
                      />
                      <p className="text-xs leading-5 text-neutral-500">
                        This changes testnet plan access for the connected wallet only.
                      </p>
                    </div>
                  )
                }
              />

              <Card className="relative overflow-hidden rounded-[2rem] border border-foreground/8 bg-neutral-950/80 p-7 shadow-[0_20px_70px_rgba(0,0,0,0.26)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_42%)]">
                <div className="relative flex h-full flex-col gap-7">
                  <div className="space-y-5">
                    <Badge className="w-fit rounded-full border-none bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      Mainnet rollout
                    </Badge>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold tracking-tight text-foreground">Planned pricing</h2>
                      <p className="text-sm leading-6 text-neutral-500">
                        Pro is expected to become a paid plan on mainnet, likely around $20/month. Final pricing may still evolve with usage and product maturity.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-5xl  tracking-tighter text-foreground">$20</span>
                      <span className="text-xs font-medium text-neutral-500">expected monthly range</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {principleItems.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full  bg-emerald-400/10 text-emerald-300">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-neutral-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className=" pt-10">
              <div className="space-y-5 text-center">
                <p className="text-sm text-neutral-500">
                  Built for payment links, proof verification, Telegram workflows, and automation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6 mt">
          <PricingComparisonTable rows={comparisonRows} />

          <Card className="px-8 max-w-3xl mx-auto border-0 bg-foreground/[0.03] mt-12">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500">Current wallet status</p>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {walletStateCopy.title}
                  </h3>
                </div>
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full ",
                    isProUser && "  text-primary"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  ) : isProUser ? (
                    <BadgeCheck className="h-5 w-5" />
                  ) : connected ? (
                    <Sparkles className="h-5 w-5 text-primary" />
                  ) : (
                    <LockKeyhole className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
              </div>

              <p className="text-sm leading-7 text-neutral-500">{walletStateCopy.body}</p>

              {connected && address ? (
                <div className="rounded-[1.4rem]  bg-foreground/[0.02] p-4">
                  <div className="text-xs  text-neutral-500">Connected wallet</div>
                  <div className="mt-2 break-all font-mono text-sm text-neutral-200">{address}</div>
                </div>
              ) : (
                <div className="rounded-[1.4rem] 10 bg-foreground/[0.02] p-4">
                  <WalletConnect />
                </div>
              )}

              {statusError ? (
                <div className="rounded-[1.25rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {statusError}
                </div>
              ) : null}

              <div className="flex items-start gap-3 rounded-[1.4rem] ">
              
                <p className="text-sm leading-6 text-neutral-500">
                  Pro is free during testnet. On mainnet, Pro is expected to become a paid plan, likely around <span className="font-medium text-neutral-100">$20/month</span>. Final pricing may still evolve.
                </p>
              </div>
            </div>
          </Card>

        
        </div>
      </div>
    </div>
  )
}
