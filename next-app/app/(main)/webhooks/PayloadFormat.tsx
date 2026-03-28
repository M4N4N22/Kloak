"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Code2,
    Copy,
    Check,
    Terminal,
    ShieldCheck,
    Hash,
    Calendar,
    Layers,
    Zap
} from "lucide-react"

export default function PayloadFormat() {
    const [copied, setCopied] = useState(false)

    const jsonPayload = `{
  "type": "payment.success",
  "linkId": "lnk_721940a",
  "requestId": "req_0x9b2...",
  "paymentId": "pay_550e8400",
  "txHash": "0x7d1a...f2e",
  "status": "SUCCESS",
  "amount": "100",
  "token": "ALEO",
  "paidAt": "2024-03-28T12:00:00Z",
  "title": "Freelance Design Services"
}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonPayload)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Terminal size={20} className="text-primary" />
                    Webhook Payload Format
                </h2>
                <Badge variant="secondary" className="font-mono text-[10px]">v1.0.0</Badge>
            </div>

            <Card className="overflow-hidden  shadow-xl">
                {/* Header/Tabs Area */}
                <div className="border-y  px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button className="text-sm font-bold  pb-1 flex items-center gap-2">
                            <Code2 size={14} /> JSON Body
                        </button>
                       
                    </div>
                    <Button
                        variant="secondary"

                        onClick={copyToClipboard}

                    >
                     
                        {copied ? "Copied" : "Copy JSON"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 ">
                    {/* Code Editor View */}
                    <div className="lg:col-span-3 p-6  overflow-x-auto ">
                        <pre className="text-sm font-mono leading-relaxed">
                            {jsonPayload.split('\n').map((line, i) => (
                                <div key={i} className="table-row">
                                    <span className="table-cell pr-4 text-zinc-600 text-right select-none w-8">{i + 1}</span>
                                    <span className={line.includes(':') ? "text-zinc-100" : "text-zinc-400"}>
                                        {line.includes('"') ? (
                                            line.split('"').map((part, j) => (
                                                j % 2 === 1 ? <span key={j} className={j === 1 ? "text-emerald-400" : "text-sky-300"}>"{part}"</span> : part
                                            ))
                                        ) : line}
                                    </span>
                                </div>
                            ))}
                        </pre>
                    </div>

                    {/* Property Reference View */}
                    <div className="lg:col-span-2 p-6 space-y-6 bg-white/5 rounded-3xl mr-4">
                        <div className="space-y-4">
                            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-widest">HTTP Headers</h3>
                            <div className="space-y-1">
                                {[
                                    { name: "x-kloak-event", desc: "Event type", icon: Zap },
                                    { name: "x-kloak-timestamp", desc: "Unix timestamp", icon: Calendar },
                                    { name: "x-kloak-signature", desc: "HMAC SHA-256", icon: ShieldCheck },
                                ].map((header) => (
                                    <div key={header.name} className="flex flex-col p-3 rounded-lg border border-border/40 bg-background/50 group hover:border-primary/30 transition-colors">
                                        <span className="text-[11px] font-mono text-primary font-bold">{header.name}</span>
                                        <span className="text-xs text-muted-foreground">{header.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-primary/5 ">
                            <div className="flex items-center gap-2 mb-2 text-primary">
                                <ShieldCheck size={16} />
                                <span className="text-sm font-bold">Verification</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Always verify the <code>x-kloak-signature</code> using your secret to ensure the payload hasn't been tampered with.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}