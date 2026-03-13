"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
    TrendingUp,
    Users,
    Target,
    BarChart3,
    PieChart,
    ChevronDown,
    ChevronUp
} from "lucide-react"

function QuickStat({ title, value, label, icon, subtext }: any) {
    return (
        <Card className="relative overflow-hidden">

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{title}</CardTitle>
                <div className="text-primary">{icon}</div>
            </CardHeader>

            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tighter">
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

export default function CampaignAnalytics({ stats }: any) {

    const [expanded, setExpanded] = useState(false)

    if (!stats) return null

    return (
        <div className="space-y-1 flex flex-col">

            {/* CORE CAMPAIGN STATS */}

            <div className="grid grid-cols-1 gap-1 md:grid-cols-3">

                <QuickStat
                    title="Total Campaigns"
                    value={stats.totalCampaigns}
                    label="Campaigns"
                    icon={<PieChart className="h-5 w-5" />}
                    subtext="Created distributions"
                />

                <QuickStat
                    title="Total Budget"
                    value={stats.totalBudget}
                    label="ALEO"
                    icon={<TrendingUp className="h-5 w-5" />}
                    subtext="Allocated to campaigns"
                />

                <QuickStat
                    title="Recipients"
                    value={stats.totalRecipients}
                    label="Users"
                    icon={<Users className="h-5 w-5" />}
                    subtext="Across all campaigns"
                />

            </div>

            {/* SECOND ROW */}

            <div
                className={cn(
                    "grid transition-all duration-500 ease-in-out",
                    expanded
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]"
                )}
            >
                <div className="overflow-hidden">

                    <div className="grid grid-cols-1 gap-1 md:grid-cols-3">


                        <QuickStat
                            title="Total Claimed"
                            value={stats.totalClaimed}
                            label="ALEO"
                            icon={<TrendingUp className="h-5 w-5" />}
                            subtext="Distributed privately"
                        />

                        <QuickStat
                            title="Claim Rate"
                            value={`${stats.claimRate}%`}
                            label="Success"
                            icon={<Target className="h-5 w-5" />}
                            subtext={`${stats.claimedRecipients} recipients claimed`}
                        />

                    </div>

                </div>
            </div>

            {/* EXPAND BUTTON */}

            <Button
                variant="outline"
                className="mx-auto mt-2"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                {expanded ? "Less Insights" : "More Insights"}
            </Button>

            {/* FOOTER */}

            <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] mt-2">
                Data updates every 60 seconds
            </p>

        </div>
    )
}