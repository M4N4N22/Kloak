"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Copy,
    Check,
    MoreHorizontal,
    ChevronDown,
    ChevronUp,
    Tag, // Icon for price
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function PaymentLinkRow({ link }: any) {
    const [copied, setCopied] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const copy = () => {
        const url = `${window.location.origin}/pay/${link.id}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const conversionRate = link.views > 0
        ? ((link.paymentsReceived / link.views) * 100).toFixed(1)
        : "0"

    const generatedLink = `${window.location.origin}/pay/${link.id}`

    return (
        <div onClick={() => setIsExpanded(!isExpanded)} className={cn(
            "group relative overflow-hidden rounded-3xl bg-white/5 transition-all duration-300 hover:border-white/10 hover:bg-white/5",
            isExpanded ? " " : ""
        )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">

                {/* 1. Title, Status & AMOUNT */}
                <div className="flex items-center gap-4 min-w-70">
                    <Badge
                        variant={"secondary"}
                    >
                        {link.active ? "Live" : "Inactive"}
                    </Badge>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-medium text-foreground">{link.title}</h3>

                        </div>

                        {/* NEW: Price Display */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs font-bold text-zinc-300">
                                <Tag className="h-3 w-3 text-primary/60" />
                                {link.allowCustomAmount ? (
                                    <span className="text-primary/80">Variable Amount</span>
                                ) : (
                                    <span>{Number(link.amount).toLocaleString()} {link.token}</span>
                                )}
                            </div>
                            <span className="text-zinc-700 text-xs">•</span>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase">
                                {link.id.slice(0, 8)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Primary Analytics (Volume & Count) */}
                <div className="flex flex-1 items-center justify-around md:justify-end gap-10 px-4">
                    <div className="text-center md:text-right">
                        <p className="text-xs text-foreground/50 mb-1">Received</p>
                        <div className="flex items-baseline justify-center md:justify-end gap-1">
                            <p className="text-xl font-black text-zinc-100 leading-tight">
                                {link.paymentsReceived} <span className="text-xs font-medium opacity-50"></span>
                            </p>
                            {link.maxPayments && (
                                <p className="text-xs text-zinc-500 font-medium">/ {link.maxPayments}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-xs text-foreground/50 mb-1">Total</p>
                        <p className="text-xl font-black text-foreground leading-tight">
                            {Number(link.totalVolume).toLocaleString()} <span className="text-xs font-medium opacity-50">{link.token}</span>
                        </p>
                    </div>


                </div>

                {/* 3. Actions */}
                <div className="flex items-center gap-2 border-t border-white/5 pt-4 md:border-none md:pt-0">
                    <Button
                        variant="secondary"

                        onClick={copy}
                    >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        <span className="font-bold text-xs uppercase tracking-wider">{copied ? "Copied" : "Copy"}</span>
                    </Button>
                    <Button variant="secondary" onClick={() =>
                        navigator.share?.({
                            title: "Payment Link",
                            url: generatedLink,
                        })
                    } > Share </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (!generatedLink) return
                            window.open(generatedLink, "_blank", "noopener,noreferrer")
                        }}
                    >
                        Visit
                    </Button>

                    <div

                        className={cn(
                            "rounded-full transition-colors p-4",
                            isExpanded ? "bg-white/10 text-primary hover:bg-primary/90" : "bg-white/5 hover:bg-white/10"
                        )}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>

                            <MoreHorizontal className="h-4 w-4" />

                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" >
                            <DropdownMenuItem onClick={() => window.open(`/pay/${link.id}`, "_blank")} className="cursor-pointer">
                                Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" >
                                Deactivate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* 4. Secondary Analytics Drawer */}
            <div className={cn(
                "grid transition-all duration-500 ease-in-out bg-black/40",
                isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-white/5" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8">
                        <div className="space-y-2  border-white/5 pl-4">
                            <div className="flex items-center gap-2 text-zinc-500">

                                <span className="">Total Views</span>
                            </div>
                            <p className="text-2xl font-black text-zinc-100">{link.views.toLocaleString()}</p>
                        </div>

                        <div className="space-y-2 border-l border-white/5 pl-4">
                            <div className="flex items-center gap-2 text-zinc-500">

                                <span className="">Unique Visitors</span>
                            </div>
                            <p className="text-2xl font-black text-zinc-100">{link.uniqueVisitors.toLocaleString()}</p>
                        </div>

                        <div className="space-y-2 border-l border-white/5 pl-4">
                            <div className="flex items-center gap-2 text-zinc-500">

                                <span className="">Conversion</span>
                            </div>
                            <p className="text-2xl font-black text-primary">{conversionRate}%</p>
                        </div>

                        <div className="space-y-2 border-l border-white/5 pl-4">
                            <div className="flex items-center gap-2 text-zinc-500">

                                <span className="">Last Updated</span>
                            </div>
                            <p className="text-sm font-bold text-zinc-300">
                                {new Date(link.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                            <p className=" text-zinc-500 font-medium tracking-tight">
                                {link.description ? link.description.slice(0, 30) + "..." : "No description"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
