"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    Copy,
    Check,
    ExternalLink,
    Link2,
    Bell,
    BarChart3,
    ShieldCheck
} from "lucide-react"
import { useState } from "react"

const TELEGRAM_BOT_USERNAME = "@kloak_private_payments_bot"
const TELEGRAM_BOT_LINK = "https://t.me/kloak_private_payments_bot"

export default function BotsPage() {
    const [copied, setCopied] = useState(false)

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen">
            <div className=" mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="space-y-3">

                        <div className="space-y-2">
                            <h1 className="text-7xl tracking-tighter font-bold">
                                Kloak Telegram Bot
                            </h1>

                            <p className="text-muted-foreground max-w-md">
                                Manage your payment links and receive notifications directly via Telegram
                            </p>
                        </div>



                        {/* USE CASE PILLS */}

                        <div className="flex flex-wrap gap-2">

                            <Badge variant="secondary">Instant Payment Alerts</Badge>
                            <Badge variant="secondary">Link Management</Badge>
                            <Badge variant="secondary">On-the-go Analytics</Badge>
                            <Badge variant="secondary">Telegram-based Control</Badge>
                            <Badge variant="secondary">Real-time Updates</Badge>
                            <Badge variant="secondary">Secure Wallet Linking</Badge>
                        </div>

                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="secondary"
                            size={"lg"}
                        >
                            <a

                                href={TELEGRAM_BOT_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="flex items-center gap-2">

                                    Open Bot in Telegram
                                </span>
                            </a>
                        </Button>
                    </div>
                </div>
                {/* Main Bot Card */}
                <Card className=" p-12 space-y-8">


                    {/* Title + Status */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Kloak Private Payments Bot</h2>
                            <Badge variant="secondary">Active</Badge>
                        </div>

                        <p className="text-foreground/70">
                            Connect with our Telegram bot to manage your private payment links,
                            receive real-time payment notifications, and access analytics on the go.
                        </p>
                    </div>

                    {/* Bot Username */}
                    <div className="  rounded-xl p-6 space-y-4 bg-white/5">
                        <h3 className="text-lg font-semibold">Bot Username</h3>

                        <div className="flex items-center gap-3">
                            <code className="flex-1 bg-black/50 rounded-full px-4 py-4 text-primary font-mono text-sm border border-white/10">
                                {TELEGRAM_BOT_USERNAME}
                            </code>

                            <Button
                                variant="secondary"
                                onClick={() => handleCopy(TELEGRAM_BOT_USERNAME)}
                                className="flex items-center gap-2"
                            >

                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>

                    {/* Getting Started */}
                    <div className="bg-white/5 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Getting Started</h3>

                        <ol className="space-y-3 text-foreground/70">
                            <li className="flex ">
                                <span className="font-semibold text-primary min-w-6">1.</span>
                                <span>
                                    Open Telegram and search for{" "}
                                    <code className="text-primary font-mono">
                                        {TELEGRAM_BOT_USERNAME}
                                    </code>
                                </span>
                            </li>

                            <li className="flex ">
                                <span className="font-semibold text-primary min-w-6">2.</span>
                                <span>Tap <strong>Start</strong> to initialize the bot</span>
                            </li>

                            <li className="flex ">
                                <span className="font-semibold text-primary min-w-6">3.</span>
                                <span>Link your wallet to your Telegram account</span>
                            </li>

                            <li className="flex ">
                                <span className="font-semibold text-primary min-w-6">4.</span>
                                <span>Start receiving payment notifications and manage your links</span>
                            </li>
                        </ol>
                    </div>

                    {/* CTA */}
                    <div>
                        <Button

                            className="bg-linear-to-br from-primary via-green-400 to-emerald-400 hover:opacity-90 text-black font-semibold"
                        >
                            <a
                                href={TELEGRAM_BOT_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="flex items-center gap-2">
                                    <ExternalLink size={18} />
                                    Open Bot in Telegram
                                </span>
                            </a>
                        </Button>
                    </div>

                </Card>

                {/* Features */}
                <Card className=" p-8 space-y-6">
                    <h2 className="text-2xl font-bold">Bot Features</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">

                        <div className="space-y-3 p-8 rounded-3xl bg-white/5">
                            <div className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">Manage Links</h3>
                            </div>
                            <p className="text-sm text-foreground/70">
                                Browse, edit, and monitor all your payment links directly from Telegram
                            </p>
                        </div>

                        <div className="space-y-3 p-8 rounded-3xl bg-white/5 ">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">Real-time Alerts</h3>
                            </div>
                            <p className="text-sm text-foreground/70">
                                Receive instant notifications when you get paid, with transaction details and explorer links
                            </p>
                        </div>

                        <div className="space-y-3 p-8 rounded-3xl bg-white/5 ">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">Analytics</h3>
                            </div>
                            <p className="text-sm text-foreground/70">
                                View payment statistics, popularity metrics, and visitor insights for your links
                            </p>
                        </div>

                        <div className="space-y-3 p-8 rounded-3xl bg-white/5 ">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">Secure Access</h3>
                            </div>
                            <p className="text-sm text-foreground/70">
                                Wallet-verified access ensures only you can manage your payment links
                            </p>
                        </div>

                    </div>
                </Card>

                {/* FAQ */}
                <Card className=" p-8 space-y-6">
                    <h2 className="text-2xl font-bold">FAQ</h2>

                    <div className="space-y-4">

                        <div className="space-y-2">
                            <h3 className="font-semibold">Is my wallet safe?</h3>
                            <p className="text-foreground/70">
                                Yes. You only link your wallet address to Telegram—no private keys are ever shared.
                                Wallet verification ensures only you can manage the account.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold">Can I unlink my wallet?</h3>
                            <p className="text-foreground/70">
                                You can unlink your wallet anytime via the /settings command in the bot.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold">Does the bot track my payments?</h3>
                            <p className="text-foreground/70">
                                The bot only sends notifications for your payment links.
                                All transaction data remains private on the Aleo network.
                            </p>
                        </div>

                    </div>
                </Card>

            </div>
        </div>
    )
}