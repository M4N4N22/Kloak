"use client"

import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type BotsPulseHeaderProps = {
  online: boolean
  linked: boolean
  alerts: string
  botUsername: string
  botLink: string
}

function StatusPill({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-foreground/8 bg-neutral-900/70 px-3 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full ${active ? "animate-ping bg-primary/60" : "bg-neutral-600"}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${active ? "bg-primary" : "bg-neutral-600"}`} />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  )
}

export function BotsPulseHeader({
  online,
  linked,
  alerts,
  botUsername,
  botLink,
}: BotsPulseHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(botUsername)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-4 rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill label="Bot Status" value={online ? "Online" : "Offline"} active={online} />
        <StatusPill label="Wallet Link" value={linked ? "Linked" : "Pending"} active={linked} />
        <StatusPill label="Alerts" value={alerts} active={alerts === "Live"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="rounded-2xl border-foreground/8 bg-neutral-900/70" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : botUsername}
        </Button>
        <a href={botLink} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="rounded-2xl border-foreground/8 bg-neutral-900/70">
            <MessageCircle className="h-4 w-4" />
            Open Telegram
          </Button>
        </a>
        <a href={botLink} target="_blank" rel="noopener noreferrer">
          <Button className="rounded-2xl bg-[#F1F66A] text-black hover:bg-[#FAFF8B]">
            <ExternalLink className="h-4 w-4" />
            Open Bot Console
          </Button>
        </a>
      </div>
    </div>
  )
}
