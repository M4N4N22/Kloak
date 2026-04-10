"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  Bot,
  Link2,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardConnectivityPanelProps = {
  telegram: {
    status: string
    linkedUsers: number
    interactions: number
  }
  webhooks: {
    status: string
    activeEndpoints: number
    recentDeliveries: number
  }
  automation: {
    status: string
    triggers: number
  }
}

function Eyebrow({ children }: { children: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
      {children}
    </div>
  )
}

function StatusPill({
  label,
  value,
  active = false,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-foreground/5 bg-black/20 px-3 py-2">
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-primary shadow-[0_0_0_4px_rgba(156,227,125,0.12)]" : "bg-neutral-600"}`}
      />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  )
}

function ActionCard({
  href,
  title,
  description,
  helper,
  status,
  icon: Icon,
  featured = false,
}: {
  href: string
  title: string
  description: string
  helper: string
  status?: string
  icon: typeof Link2
  featured?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[2rem] bg-neutral-950/50 py-8 px-6 transition hover:border-foreground/10 hover:bg-black/30 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-2.5">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-medium">{title}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                {status}
              </div>
            </div>
          </div>
          <p className="text-sm leading-6 text-neutral-400">{description}</p>
          <p className="text-xs leading-5 text-neutral-500">{helper}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-600 transition group-hover:text-primary" />
      </div>
    </Link>
  )
}

export function DashboardConnectivityPanel({
  telegram,
  webhooks,
  automation,
}: DashboardConnectivityPanelProps) {
  const telegramLinked = telegram.linkedUsers > 0
  const webhooksReady = webhooks.activeEndpoints > 0
  const automationReady = automation.triggers > 0

  return (
    <Card>
      <CardHeader className="border-b border-foreground/5 pb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <CardTitle className="mt-2 text-lg">Quick Actions</CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Move quickly between the parts of Kloak you use most: payment links, compliance, Telegram, webhooks, and automation.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-1 xl:grid-cols-3">
          <ActionCard
            href="/payment-links"
            title="Payment Links"
            description="Create new payment links and keep track of how they are performing."
            helper="Create links, check conversions, and manage incoming payments."
           
            icon={Link2}
            featured
          />
          <ActionCard
            href="/compliance"
            title="Compliance Ledger"
            description="Generate payment proofs only when you need to share them."
            helper="Create, review, and verify selective disclosure proofs."
         
            icon={ShieldCheck}
          />
          <ActionCard
            href="/bots"
            title="Telegram Bot"
            description={
              telegramLinked
                ? "Your wallet is connected and ready to use in Telegram."
                : "Link Telegram to share links faster and get paid alerts in chat."
            }
            helper={
              telegramLinked
                ? `${telegram.linkedUsers} linked account${telegram.linkedUsers > 1 ? "s" : ""} connected to this wallet.`
                : "Open the bot page to finish linking your wallet."
            }
          
            icon={Bot}
          />
          <ActionCard
            href="/webhooks"
            title="Webhooks"
            description="Send payment events to your backend in real time."
            helper={
              webhooksReady
                ? `${webhooks.activeEndpoints} endpoint${webhooks.activeEndpoints > 1 ? "s" : ""} active with ${webhooks.recentDeliveries} recent deliveries.`
                : "Set up your first endpoint to receive successful payment events."
            }
         
            icon={Webhook}
          />
          <ActionCard
            href="/automation"
            title="Automation"
            description="Connect Kloak to the tools you already use."
            helper={
              automationReady
                ? `${automation.triggers} automation trigger${automation.triggers > 1 ? "s" : ""} ready to use.`
                : "Start with webhooks to connect tools like n8n, Make, or Zapier."
            }
           
            icon={Zap}
          />
        </div>
      </CardContent>
    </Card>
  )
}
