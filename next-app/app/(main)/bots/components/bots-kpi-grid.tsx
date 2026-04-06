"use client"

import { BarChart3, Bell, Link2, Users } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string
  helper: string
  icon: typeof Users
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-foreground/5 pb-4">
        <div className="text-sm text-neutral-500">{label}</div>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="pt-5">
        <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">{value}</div>
        <p className="mt-3 text-xs leading-5 text-neutral-500">{helper}</p>
      </CardContent>
    </Card>
  )
}

export function BotsKpiGrid({
  linkedUsers,
  trackedLinksCount,
  paymentAlertsCount,
  trackedVolume,
}: {
  linkedUsers: number
  trackedLinksCount: number
  paymentAlertsCount: number
  trackedVolume: number
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        label="Tracked Links"
        value={String(trackedLinksCount)}
        helper="Payment links you can manage and share from Telegram."
        icon={Link2}
      />
      <MetricCard
        label="Payment Alerts"
        value={String(paymentAlertsCount)}
        helper="Payments that can trigger alerts in Telegram."
        icon={Bell}
      />
      <MetricCard
        label="Tracked Volume"
        value={trackedVolume.toFixed(4)}
        helper="Total ALEO collected across links the bot can follow."
        icon={BarChart3}
      />
    </div>
  )
}
