"use client"

import Link from "next/link"
import { Bot, ChevronRight, Webhook, Zap } from "lucide-react"

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

const links = [
  {
    href: "/payment-links",
    title: "Payment Links",
    description: "Manage links and conversion surfaces.",
    accent: "text-primary",
  },
  {
    href: "/compliance",
    title: "Compliance Ledger",
    description: "Issue and verify selective disclosure proofs.",
    accent: "text-primary",
  },
  {
    href: "/bots",
    title: "Telegram Bot",
    description: "Monitor chat-based payment operations.",
    accent: "text-neutral-300",
  },
  {
    href: "/webhooks",
    title: "Webhooks",
    description: "Inspect delivery health and event flow.",
    accent: "text-neutral-300",
  },
  {
    href: "/automation",
    title: "Automation",
    description: "Configure downstream workflows and triggers.",
    accent: "text-neutral-300",
  },
]

function HealthCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string
  helper: string
  icon: typeof Bot
}) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 font-mono text-lg text-foreground">{value}</div>
      <p className="mt-2 text-xs leading-5 text-neutral-500">{helper}</p>
    </div>
  )
}

export function DashboardConnectivityPanel({
  telegram,
  webhooks,
  automation,
}: DashboardConnectivityPanelProps) {
  return (
    <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
      <CardHeader>
        <CardTitle className="text-lg">Connectivity</CardTitle>
        <p className="text-sm leading-6 text-neutral-400">
          Operational health for bots, webhooks, and automation surfaces.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <HealthCard
            label="Telegram"
            value={`${telegram.status} • ${telegram.linkedUsers}`}
            helper={`${telegram.interactions} tracked Telegram interactions`}
            icon={Bot}
          />
          <HealthCard
            label="Webhooks"
            value={`${webhooks.status}`}
            helper={`${webhooks.activeEndpoints} active endpoints • ${webhooks.recentDeliveries} recent deliveries`}
            icon={Webhook}
          />
          <HealthCard
            label="Automation"
            value={`${automation.status}`}
            helper={`${automation.triggers} active automation triggers`}
            icon={Zap}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-foreground/5 bg-black/20 p-4 transition hover:border-foreground/10 hover:bg-black/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`font-medium ${item.accent}`}>{item.title}</div>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-600 transition group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
