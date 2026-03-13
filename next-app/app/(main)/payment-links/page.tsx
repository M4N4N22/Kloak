"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { Badge } from "@/components/ui/badge"
import PaymentLinksAnalytics from "./payment-links-analytics"
import { WalletConnect } from "@/components/wallet-connect"

import {
  ChevronRight,
  Link,
  TrendingUp,
  History,
  Eye,
  Users,
  ShieldCheck
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

import CreateLinkForm from "./create-link-form"
import PaymentLinkList from "./payment-link-list"

export default function PaymentLinksPage() {
  const { connected, address } = useWallet()
  const [view, setView] = useState<"overview" | "create">("overview")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!connected || !address) return

    const fetchStats = async () => {
      setLoading(true)

      try {
        const res = await fetch(
          `/api/analytics/payment-links?creator=${address}`
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

        <div className="rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/2 p-20 text-center flex flex-col items-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Connect Shield Wallet
          </h1>

          <p className="text-muted-foreground max-w-sm mb-8">
            Connect your wallet to start accepting private payments through secure links.
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
        <div className="space-y-10">

          {/* HERO */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">

            <div className="space-y-3">

              <div className="space-y-2">
                <h1 className="text-7xl tracking-tighter font-bold">
                  Payment Links
                </h1>

                <p className="text-muted-foreground max-w-md">
                  Generate private payment links anyone can use to pay you securely with zero-knowledge privacy.
                </p>
              </div>



              {/* USE CASE PILLS */}

              <div className="flex flex-wrap gap-2">

                <Badge variant="secondary">Freelance Payments</Badge>
                <Badge variant="secondary">Donations</Badge>
                <Badge variant="secondary">Subscriptions</Badge>
                <Badge variant="secondary">Product Sales</Badge>
                <Badge variant="secondary">Tips</Badge>
                <Badge variant="secondary">Private Invoices</Badge>

              </div>

            </div>

            <Button
              size="lg"
              onClick={() => setView("create")}
            >

              Create Payment Link
            </Button>

          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 ml-2">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Performance Overview</h2>
                <p className="text-sm text-muted-foreground">Real-time link activity and revenue tracking.</p>
              </div>
            </div>


            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickStatSkeleton />
                <QuickStatSkeleton />
                <QuickStatSkeleton />
              </div>
            ) : (
              <PaymentLinksAnalytics
                stats={stats}
              />
            )}
          </div>

          {/* PAYMENT LINKS LIST */}

          <div className="space-y-4">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 ml-2">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Your Payment Links</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your payment links and monitor their activity and revenue in real time.
                </p>
              </div>
            </div>

            <PaymentLinkList />

          </div>

        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">

          <div className="mb-8 text-center">
            <h2 className="text-4xl font-medium mb-1">
              Create Payment Link
            </h2>

            <p className="text-muted-foreground">
              Generate a private payment link anyone can use.
            </p>
          </div>

          <CreateLinkForm />

          <Button
            variant="secondary"
            onClick={() => setView("overview")}
            className="mx-auto w-fit"
          >
            Back to Payment Links
          </Button>

        </div>
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
          <BreadcrumbLink href="/dashboard">
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <ChevronRight className="h-3 w-3" />
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          {view === "overview" ? (
            <BreadcrumbPage>Payments</BreadcrumbPage>
          ) : (
            <BreadcrumbLink onClick={() => setView("overview")}>
              Payments
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {view === "create" && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbPage>New Payment Link</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

      </BreadcrumbList>

    </Breadcrumb>
  )
}

function QuickStatSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-24 bg-zinc-50/10 animate-pulse rounded-3xl" />
        <div className="h-5 w-5 bg-zinc-50/10 animate-pulse rounded-full" />
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="h-8 w-20 bg-zinc-50/10 animate-pulse rounded-3xl" />
          <div className="h-4 w-10 bg-zinc-50/10 animate-pulse rounded-3xl" />
        </div>
      </CardContent>

      <CardFooter>
        <div className="h-3 w-32 bg-zinc-50/10 animate-pulse rounded-3xl" />
      </CardFooter>
    </Card>
  )
}