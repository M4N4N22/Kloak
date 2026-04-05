"use client"

import { Activity, Bot, ShieldCheck } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

type DashboardKpiBentoProps = {
  totalVolume: number
  activeLinks: number
  conversionRate: number
  disclosureRate: number
  disclosedPayments: number
  totalPayments: number
  botActivity: number
  linkedTelegramUsers: number
  chart: Array<{
    date: string
    label: string
    volume: number
  }>
}

function DenseLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
  )
}

export function DashboardKpiBento({
  totalVolume,
  activeLinks,
  conversionRate,
  disclosureRate,
  disclosedPayments,
  totalPayments,
  botActivity,
  linkedTelegramUsers,
  chart,
}: DashboardKpiBentoProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr_0.6fr]">
      <Card className="bg-transparent">
        <CardHeader className="border-b border-foreground/5">
          <DenseLabel label="Net Volume" />
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-4xl font-semibold tracking-tight ">
                {totalVolume.toFixed(4)}
              </div>
              <div className="mt-2 text-xs text-neutral-500">ALEO over the last 7 days</div>
            </div>
            <div className="grid gap-3 text-right">
              <div>
                <DenseLabel label="Active Links" />
                <div className="mt-1 font-mono text-sm ">{activeLinks}</div>
              </div>
              <div>
                <DenseLabel label="Conversion" />
                <div className="mt-1 font-mono text-sm">{(conversionRate * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F1F66A" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#F1F66A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(9,9,11,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#F1F66A"
                  fill="url(#dashboardVolume)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
        <CardHeader className="border-b border-foreground/5">
          <div className="flex items-center justify-between">
            <DenseLabel label="Disclosure Rate" />
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">
            {(disclosureRate * 100).toFixed(1)}%
          </div>
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(disclosureRate * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
              <span>{disclosedPayments} payments with proofs</span>
              <span>{totalPayments} total payments</span>
            </div>
          </div>
          <p className="text-xs leading-5 text-neutral-500">
            Share of recorded payments that have at least one active selective disclosure proof.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
        <CardHeader className="border-b border-foreground/5">
          <div className="flex items-center justify-between">
            <DenseLabel label="Bot Activity" />
            <Bot className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">{botActivity}</div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-foreground/5 bg-black/20 p-3">
              <DenseLabel label="Linked Users" />
              <div className="mt-2 font-mono text-sm text-foreground">{linkedTelegramUsers}</div>
            </div>
            <div className="rounded-2xl border border-foreground/5 bg-black/20 p-3">
              <DenseLabel label="Channel Health" />
              <div className="mt-2 flex items-center gap-2 font-mono text-sm text-foreground">
                <Activity className="h-4 w-4 text-primary" />
                Telegram live
              </div>
            </div>
          </div>
          <p className="text-xs leading-5 text-neutral-500">
            Combined Telegram-linked activity across linked users, tracked payment links, and alertable payment events.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
