"use client"

import Link from "next/link"
import { Command, Plus, Radio } from "lucide-react"

import { Button } from "@/components/ui/button"

type DashboardPulseHeaderProps = {
  telegramOnline: boolean
  webhookStatus: string
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
    <div className="flex items-center gap-2 rounded-full border  p-1">
      <span className={`relative flex ml-2 h-2.5 w-2.5 ${active ? "" : "opacity-60"}`}>
        <span className={`absolute inline-flex h-full w-full rounded-full ${active ? "animate-ping bg-primary/60" : "bg-neutral-600"}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${active ? "bg-primary" : "bg-neutral-600"}`} />
      </span>
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="font-mono text-xs text-primary bg-primary/10 rounded-full px-3 py-1">{value}</span>
    </div>
  )
}

export function DashboardPulseHeader({
  telegramOnline,
  webhookStatus,
}: DashboardPulseHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[2.5rem] py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill label="Telegram Bot" value={telegramOnline ? "Online" : "Offline"} active={telegramOnline} />
        <StatusPill label="Webhooks" value={webhookStatus} active={webhookStatus.includes("OK") || webhookStatus === "Awaiting traffic"} />
        <div className="flex items-center gap-2 rounded-full border  p-1">
          <Radio className="h-3.5 w-3.5 text-primary ml-2" />
          <span className="text-sm text-neutral-500">Proof Feed</span>
          <span className="font-mono text-xs text-primary bg-primary/10 rounded-full px-3 py-1">Live</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">


        <Link href="/payment-links">
          <Button className="">
        
            New Payment Link
          </Button>
        </Link>
      </div>
    </div>
  )
}
