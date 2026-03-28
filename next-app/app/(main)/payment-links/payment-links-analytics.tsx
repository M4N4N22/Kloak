"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  Link as LinkIcon,
  History,
  Eye,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Target,
  Zap
} from "lucide-react"

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Rectangle
} from "recharts"

function QuickStat({ title, value, label, icon, subtext, trend }: any) {
  return (
    <Card className="relative overflow-hidden ">

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="">
          {title}
        </CardTitle>

        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground tracking-tighter">
            {value}
          </span>

          <span className="text-xs font-semibold text-muted-foreground">
            {label}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {subtext}
        </p>
      </CardFooter>

    </Card>
  )
}

export default function PaymentLinksAnalytics({ stats }: any) {
  const [expanded, setExpanded] = useState(false)

  if (!stats) return null

  const totals = stats.totals
  const insights = stats.insights

  const chartData =
    insights?.topLinksThisWeek?.map((l: any) => ({
      name: l.title.length > 12 ? l.title.substring(0, 10) + '...' : l.title,
      revenue: l.weeklyRevenue,
    })) || []

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/90 border border-white/10 backdrop-blur-md p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-sm font-bold text-white">
              {payload[0].value} <span className="text-[10px] text-zinc-400">ALEO</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-1 flex flex-col">
      {/* HEADER SECTION */}


      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickStat
          title="Total Received"
          value={Number(totals.totalVolume).toFixed(4)}
          label="ALEO"
          icon={<TrendingUp className="h-5 w-5" />}
          subtext="Volume across platform"
        />
        <QuickStat
          title="Active Links"
          value={totals.activeLinks}
          label="Links"
          icon={<LinkIcon className="h-5 w-5" />}
          subtext="Open for payments"
        />
        <QuickStat
          title="Transactions"
          value={totals.totalPayments}
          label="Txns"
          icon={<History className="h-5 w-5" />}
          subtext="Verified on-chain"
        />
      </div>

      {/* DETAILED ANALYTICS */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out ",
          expanded
            ? "grid-rows-[1fr]  "
            : "grid-rows-[0fr] "
        )}
      >
        <div className="overflow-hidden mt-4">

          <div className="grid gap-4">

            {/* FIRST ROW STATS */}


            {/* SECOND ROW */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

              {/* CHART */}
              <Card className="lg:col-span-3 ">
                {/* Subtle Background Glow */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />

                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xs font-bold uppercase tracking-wider">
                        Weekly Performance
                      </CardTitle>
                      <p className="text-[10px] text-zinc-500">Revenue distribution by link</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8">
                  <div className="h-64 w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                        >
                          {/* Horizontal lines only for a cleaner 'pro' look */}
                          <CartesianGrid
                            vertical={false}
                            stroke="rgba(255,255,255,0.03)"
                            strokeDasharray="3 3"
                          />

                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }}
                            dy={15}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#666", fontSize: 10 }}
                          />

                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "rgba(255,255,255,0.03)" }}
                          />

                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#9CE37D
" stopOpacity={1} />
                              <stop offset="100%" stopColor="#9CE37D" stopOpacity={0.7} />
                            </linearGradient>
                          </defs>

                          <Bar
                            dataKey="revenue"
                            fill="url(#barGradient)" // Direct fill with gradient
                            radius={[4, 4, 0, 0]}
                            barSize={24}
                            animationDuration={1500}
                            // This replaces the hover logic previously handled by Cell
                            activeBar={
                              <Rectangle
                                fill="#015FFD"
                                stroke="#4f8fff"
                                strokeWidth={1}
                                filter="drop-shadow(0px 0px 8px rgba(1, 95, 253, 0.5))"
                              />
                            }
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                        <div className="text-center space-y-2">
                          <Zap className="h-5 w-5 text-zinc-700 mx-auto" />
                          <p className="text-[11px] text-zinc-500 font-medium">Waiting for transaction data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SIDE INSIGHTS */}
              <div className="flex flex-col gap-4 lg:col-span-2">
                {insights?.highestRevenueLink && (
                  <QuickStat
                    title="Best Performance"
                    value={insights.highestRevenueLink.title}
                    label=""
                    icon={<ArrowUpRight className="h-5 w-5" />}
                    subtext={`Generated ${insights.highestRevenueLink.revenue} ALEO`}
                  />
                )}

                {insights?.highestConversionLink && (
                  <QuickStat
                    title="Top Conversion"
                    value={`${(insights.highestConversionLink.conversion * 100).toFixed(1)}%`}
                    label=""
                    icon={<Target className="h-5 w-5" />}
                    subtext={insights.highestConversionLink.title}
                  />
                )}
              </div>

            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <QuickStat
                title="Total Views"
                value={totals.totalViews}
                label="Visits"
                icon={<Eye className="h-5 w-5" />}
                subtext="Total impressions"
              />
              <QuickStat
                title="Unique Users"
                value={totals.uniqueVisitors}
                label="Users"
                icon={<Users className="h-5 w-5" />}
                subtext="Identified by hash"
              />
              <QuickStat
                title="Avg. Conversion"
                value={`${(totals.conversionRate * 100).toFixed(1)}%`}
                label="Rate"
                icon={<Target className="h-5 w-5" />}
                subtext="Visits to claims"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="mx-auto mt-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
        {expanded ? "Less Insights" : "More Insights"}
      </Button>

      {/* FOOTER TIP */}

      <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] mt-2">
        Data updates every 60 seconds
      </p>

    </div>
  )
}