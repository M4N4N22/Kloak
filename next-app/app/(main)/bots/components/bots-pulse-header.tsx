"use client"

import { Check, Copy } from "lucide-react"
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
    <div className="flex items-center gap-2 rounded-full border  px-3 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full ${active ? "animate-ping bg-primary/60" : "bg-neutral-600"}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${active ? "bg-primary" : "bg-neutral-600"}`} />
      </span>
      <span className="text-xs text-neutral-500">{label}</span>
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
    <div className="flex flex-col gap-4 rounded-[2.5rem]   px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill label="Bot Status" value={online ? "Online" : "Offline"} active={online} />
        <StatusPill label="Wallet" value={linked ? "Linked" : "Not linked"} active={linked} />
        <StatusPill label="Alerts" value={alerts} active={alerts === "Live"} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline"  onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Copied" : botUsername}
        </Button>
        <a href={botLink} target="_blank" rel="noopener noreferrer">
          <Button>
          
            Open in Telegram
          </Button>
        </a>
      </div>
    </div>
  )
}
