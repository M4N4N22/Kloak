"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  ChevronRight,
  PieChart,
  ShieldCheck,
  TrendingUp,
  History
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { WalletConnect } from "@/components/wallet-connect"
import AnimatedButton from "@/components/ui/animated-button"
import { useEffect } from "react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import CreateCampaignForm from "./create-campaign-form"
import CampaignList from "./campaign-list"
import CampaignExplainerModal from "./campaign-explainer-modal"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import CampaignAnalytics from "./campaign-analytics"

export default function CampaignsPage() {
  const { connected, address } = useWallet()
  const [view, setView] = useState<"overview" | "create">("overview")
  const [Open, setOpen] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if (!connected || !address) return

    const fetchStats = async () => {
      setLoading(true)

      try {
        const res = await fetch(
          `/api/analytics/campaigns?creator=${address}`
        )
        const data = await res.json()

        setStats(data ?? {})
      } catch (err) {
        console.error("Failed to fetch stats", err)

        // prevent UI break
        setStats({})
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [connected, address])

  if (!connected) {
    return (
      <div className="">
        <Breadcrumbs view={view} setView={setView} />

        <div className="rounded-[2.5rem] border-2 border-dashed border-foreground/5 bg-foreground/2 p-20 text-center backdrop-blur-md justify-center flex flex-col items-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Connect Shield Wallet
          </h1>

          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            To create and manage private reward distributions on Aleo, you need to authorize your wallet first.
          </p>

          <WalletConnect />
        </div>
      </div>
    )
  }



  return (
    <div className="">
      <Breadcrumbs view={view} setView={setView} />

      {view === "overview" ? (
        <div className="space-y-10 ">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-32">
            <div className="space-y-3">

              <div className="space-y-2">
                <h1 className="text-7xl tracking-tighter text-foreground font-bold">
                  Campaigns
                </h1>

                <p className="text-muted-foreground max-w-md">
                  Deploy private rewards using zero-knowledge proofs. Shield your recipients and treasury.
                </p>
              </div>

              {/* Use Case Pills */}

              <div className="flex flex-wrap gap-2">

                <Badge variant="secondary">
                  Hackathon Rewards
                </Badge>

                <Badge variant="secondary" >
                  DAO Grants
                </Badge>

                <Badge variant="secondary" >
                  Contributor Bounties
                </Badge>

                <Badge variant="secondary" >
                  Community Airdrops
                </Badge>

                <Badge variant="secondary" >
                  Retroactive Funding
                </Badge>

                <Badge variant="secondary">
                  Bug Bounties
                </Badge>

              </div>

            </div>
            <div className="gap-4 flex flex-col">
              <Button
                onClick={() => setView("create")}
                size="lg"
                className=""
              >

                Create New Campaign
              </Button>

              <AnimatedButton onClick={() => setOpen(true)}>
                Kloak Privacy Model
              </AnimatedButton>


            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 ml-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Campaigns Overview</h2>
              <p className="text-sm text-muted-foreground">
                Track distribution campaigns, total allocated budget, and recipient counts.
              </p>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickStatSkeleton />
                <QuickStatSkeleton />
                <QuickStatSkeleton />
              </div>
            ) : (
              <CampaignAnalytics
                stats={stats}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Recent Distributions
              </h2>
            </div>

            <CampaignList />
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center flex-col gap-4">
          <div className="mb-4">
            <h2 className="text-4xl tracking-tighter text-foreground font-bold">
              New Campaign
            </h2>
            <p className="text-muted-foreground mt-1 max-w-1/2">
              Securely register and fund a private reward distribution using Aleo zero-knowledge infrastructure.
            </p>
          </div>

          <CreateCampaignForm />

          <Button
            variant={"secondary"}
            onClick={() => setView("overview")}
            className=" mx-auto w-fit"
          >
            Back to Campaigns
          </Button>
        </div>
      )}
      {Open && (
        <CampaignExplainerModal onClose={() => setOpen(false)} />
      )}
    </div>

  )
}

function Breadcrumbs({
  view,
  setView,
}: {
  view: "overview" | "create"
  setView: (v: "overview" | "create") => void
}) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>

        <BreadcrumbItem>
          <BreadcrumbLink
            href="/dashboard"
          >
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <ChevronRight className="h-3 w-3" />
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          {view === "overview" ? (
            <BreadcrumbPage>Campaigns</BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => setView("overview")}
            >
              Campaigns
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {view === "create" && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbPage>New Campaign</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

      </BreadcrumbList>
    </Breadcrumb>
  )
}

function QuickStat({ title, value, label, icon, subtext }: any) {
  return (
    <Card className="relative overflow-hidden">

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="">
          {title}
        </CardTitle>

        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground tracking-tighter">
            {value}
          </span>

          <span className="text-xs font-semibold text-muted-foreground">
            {label}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {subtext}
        </p>
      </CardFooter>

    </Card>
  )
}

function QuickStatSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-24 bg-neutral-50/10 animate-pulse rounded-3xl" />
        <div className="h-5 w-5 bg-neutral-50/10 animate-pulse rounded-full" />
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="h-8 w-20 bg-neutral-50/10 animate-pulse rounded-3xl" />
          <div className="h-4 w-10 bg-neutral-50/10 animate-pulse rounded-3xl" />
        </div>
      </CardContent>

      <CardFooter>
        <div className="h-3 w-32 bg-neutral-50/10 animate-pulse rounded-3xl" />
      </CardFooter>
    </Card>
  )
}