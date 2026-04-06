"use client"

import Link from "next/link"
import { ArrowUpRight, Bell, Bot, Link2, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const commands = [
  {
    command: "/start",
    label: "Start the bot",
    helper: "Open the bot and begin the wallet linking flow if Telegram is not connected yet.",
  },
  {
    command: "My Links",
    label: "View and share links",
    helper: "See your existing payment links and send them into Telegram chats faster.",
  },
  {
    command: "Analytics",
    label: "Check performance",
    helper: "See recent link activity and payment performance directly in Telegram.",
  },
  {
    command: "Settings",
    label: "Manage wallet link",
    helper: "Check your connection, relink your wallet, or disconnect it when needed.",
  },
]

const actions = [
  {
    href: "/payment-links",
    title: "Payment Links",
    description: "Create and update links on the web app before sharing them through Telegram.",
    icon: Link2,
  },
  {
    href: "/webhooks",
    title: "Webhook Delivery",
    description: "Pair Telegram alerts with backend notifications for successful payments.",
    icon: Bell,
  },
  {
    href: "/compliance",
    title: "Compliance Ledger",
    description: "Turn completed payments into proofs you can share when needed.",
    icon: ShieldCheck,
  },
]

export function BotsCommandCenter({ linked }: { linked: boolean }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-neutral-500">How It Works</div>
              <CardTitle className="mt-2 text-lg">What you can do in Telegram</CardTitle>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                The bot works alongside the web app. Use it to share links, get paid alerts, and check activity without opening Kloak every time.
              </p>
            </div>
            <Badge variant={linked ? "secondary" : "outline"}>{linked ? "Linked" : "Not linked"}</Badge>
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

      <Card>
        <CardHeader>
          <div className="text-sm text-neutral-500">Next Steps</div>
          <CardTitle className="mt-2 text-lg">Keep everything in sync</CardTitle>
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
              Start in Telegram, approve the wallet link, and come back once the bot confirms the connection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
