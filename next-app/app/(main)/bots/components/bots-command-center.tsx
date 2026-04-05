"use client"

import Link from "next/link"
import { ArrowUpRight, Bell, Bot, Link2, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const commands = [
  {
    command: "/start",
    label: "Initialize bot session",
    helper: "Starts the companion bot and prompts wallet linking when Telegram is not connected yet.",
  },
  {
    command: "My Links",
    label: "Track and share links",
    helper: "Browse existing payment links from your web account and share them directly into Telegram chats.",
  },
  {
    command: "Analytics",
    label: "Check link performance",
    helper: "Returns payment-link analytics and recent payment performance directly inside Telegram.",
  },
  {
    command: "Settings",
    label: "Manage wallet link",
    helper: "Review link status, relink, or disconnect your wallet from the Telegram companion surface.",
  },
]

const actions = [
  {
    href: "/payment-links",
    title: "Payment Links",
    description: "Create and edit links on the web app before tracking and sharing them through Telegram.",
    icon: Link2,
  },
  {
    href: "/webhooks",
    title: "Webhook Delivery",
    description: "Pair Telegram alerts with backend delivery for payment success events.",
    icon: Bell,
  },
  {
    href: "/compliance",
    title: "Compliance Ledger",
    description: "Turn payments collected via chat into verifier-ready proofs.",
    icon: ShieldCheck,
  },
]

export function BotsCommandCenter({ linked }: { linked: boolean }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Command Center</div>
              <CardTitle className="mt-2 text-lg">Operational Workflow</CardTitle>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                The bot acts as a mobile companion for links you already manage on the web app: inbox access, chat sharing, payment alerts, and lightweight analytics.
              </p>
            </div>
            <Badge variant={linked ? "secondary" : "outline"}>{linked ? "Linked" : "Needs Link"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {commands.map((item) => (
            <div key={item.command} className="rounded-2xl border border-foreground/5 bg-black/20 p-4">
              <div className="font-mono text-sm text-primary">{item.command}</div>
              <div className="mt-2 text-sm text-foreground">{item.label}</div>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{item.helper}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
        <CardHeader>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Next Actions</div>
          <CardTitle className="mt-2 text-lg">Jump to related surfaces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-2xl border border-foreground/5 bg-black/20 p-4 transition hover:border-foreground/10 hover:bg-black/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.title}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">{item.description}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-600 transition group-hover:text-primary" />
                </div>
              </Link>
            )
          })}

          <div className="rounded-2xl border border-dashed border-foreground/10 bg-foreground/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Bot className="h-4 w-4 text-primary" />
              Wallet linking
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Start from Telegram, tap the wallet-link prompt, and come back once the bot confirms the connection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
