"use client"

import Link from "next/link"
import { Activity, Bot, LockKeyhole, ShieldCheck } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type DashboardKpiBentoProps = {
  totalVolume: number
  activeLinks: number
  conversionRate: number
  disclosureRate: number
  disclosedPayments: number
  totalPayments: number
  linkedTelegramUsers: number
  telegramOnline: boolean
  proofAccessGranted: boolean
  proofAccessLoading: boolean
  chart: Array<{
    date: string
    label: string
    volume: number
  }>
}

function DenseLabel({ label }: { label: string }) {
  return (
    <div className="text-sm text-neutral-500">{label}</div>
  )
}

export function DashboardKpiBento({
  totalVolume,
  activeLinks,
  conversionRate,
  disclosureRate,
  disclosedPayments,
  totalPayments,
  linkedTelegramUsers,
  telegramOnline,
  proofAccessGranted,
  proofAccessLoading,
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
                    <stop offset="0%" stopColor="#9CE37D" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#9CE37D" stopOpacity={0.02} />
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
                  stroke="#9CE37D"
                  fill="url(#dashboardVolume)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-foreground/5">
          <div className="flex items-center justify-between">
            <DenseLabel label="Disclosure Rate" />
            {proofAccessGranted ? (
              <ShieldCheck className="h-4 w-4 text-primary" />
            ) : (
              <LockKeyhole className="h-4 w-4 text-neutral-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {proofAccessGranted ? (
            <>
              <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">
                {proofAccessLoading ? "..." : `${(disclosureRate * 100).toFixed(1)}%`}
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
                Synced from the same wallet-owned proof ledger shown inside Compliance.
              </p>
            </>
          ) : (
            <>
              <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">Locked</div>
              <div className="rounded-2xl border border-dashed border-foreground/10 bg-black/20 p-3">
                <p className="text-xs leading-5 text-neutral-500">
                  This metric only appears after you unlock your proof ledger with the wallet check.
                </p>
              </div>
              <Link href="/compliance/proofs">
                <Button variant="outline">
                  Unlock in compliance
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-foreground/5">
          <div className="flex items-center justify-between">
            <DenseLabel label="Bot Activity" />
            <Bot className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">
            {linkedTelegramUsers > 0 ? "Connected" : "Not linked"}
          </div>
          <div className="grid gap-3">
            <div className="rounded-full border border-foreground/5 bg-black/20 p-3">
              <DenseLabel label="Wallet Link" />
              <div className="mt-2 font-mono text-sm text-foreground">
                {linkedTelegramUsers > 0 ? `${linkedTelegramUsers} linked account${linkedTelegramUsers > 1 ? "s" : ""}` : "Link Telegram to this wallet"}
              </div>
            </div>
            <div className="rounded-2xl border border-foreground/5 bg-black/20 p-3">
              <DenseLabel label="Channel Health" />
              <div className="mt-2 flex items-center gap-2 font-mono text-sm text-foreground">
                <Activity className="h-4 w-4 text-primary" />
                {telegramOnline ? "Telegram live" : "Bot offline"}
              </div>
            </div>
          </div>
          {linkedTelegramUsers > 0 ? (
            <p className="text-xs leading-5 text-neutral-500">
              Your bot workspace is linked. Use Telegram to share tracked links faster and receive payment alerts.
            </p>
          ) : (
            <Link href="/bots">
              <Button variant="outline">
                Connect Telegram bot
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
