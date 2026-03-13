"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { getShortAddress } from "@provablehq/aleo-wallet-adaptor-core"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useBalances } from "@/app/providers/balance-provider"
import PaymentLinkList from "../payment-links/payment-link-list"
import { WalletConnect } from "@/components/wallet-connect"
import CampaignList from "../campaigns/campaign-list"

export default function DashboardPage() {
    const { address, connected } = useWallet()
    const [loadingCampaigns, setLoadingCampaigns] = useState(false)
    const { balances, loadingPublic, fetchPrivateBalance, loadingPrivate } = useBalances()

    /* ------------------------------------------------ */
    /* FETCH CAMPAIGNS                                  */
    /* ------------------------------------------------ */

    useEffect(() => {
        if (!connected) return

        const loadCampaigns = async () => {
            try {
                setLoadingCampaigns(true)

                await new Promise((r) => setTimeout(r, 600))
            } finally {
                setLoadingCampaigns(false)
            }
        }

        loadCampaigns()
    }, [connected])

    /* ------------------------------------------------ */
    /* WALLET NOT CONNECTED STATE                       */
    /* ------------------------------------------------ */

    if (!connected) {
        return (
            <div className="">


                <div className="rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/2 p-20 text-center flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Connect Shield Wallet
                    </h1>

                    <p className="text-muted-foreground max-w-sm mb-8">
                        Please connect your wallet to acess your dashboard.
                    </p>

                    <WalletConnect />
                </div>
            </div>
        )
    }
    /* ------------------------------------------------ */
    /* CONNECTED DASHBOARD                              */
    /* ------------------------------------------------ */

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-3xl font-semibold">Dashboard</h1>

                    <p className="text-muted-foreground text-sm">
                        Private payments and distributions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button>Get Paid Privately</Button>
                    <Button>Distribute Funds Privately</Button>
                </div>
            </div>



            {/* Balances */}
            <div className="grid md:grid-cols-2 gap-4">

                <Card>
                    <CardHeader className=" py-1 ">
                        <CardTitle className="text-sm text-foreground/70">
                            ALEO Public Balance
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">


                        {loadingPublic ? (
                            <div className="h-8 w-24 bg-zinc-50/10 animate-pulse rounded-3xl" />
                        ) : (
                            <div className="text-3xl font-semibold text-primary">

                                {balances.aleo.public ?? "—"}
                            </div>
                        )}

                    </CardContent>
                </Card>


                <Card className="hidden">
                    <CardHeader>
                        <CardTitle className="text-sm text-foreground/70">
                            USDCx Balance
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        {loadingPublic ? (
                            <div className="h-8 w-24 bg-zinc-50/10 animate-pulse rounded" />
                        ) : (
                            <div className="text-3xl font-semibold text-primary">
                                {"—"}
                            </div>
                        )}

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-sm text-foreground/70">
                            ALEO Private Balance
                        </CardTitle>

                        <div
                            className="bg-zinc-500/20 hover:bg-zinc-500/30 px-4 py-1 rounded-full text-foreground/70 hover:text-foreground cursor-pointer text-sm"
                            onClick={fetchPrivateBalance}
                        >
                            Click to Reveal
                        </div>
                    </CardHeader>

                    <CardContent>
                        {loadingPrivate ? (
                            <div className="h-8 w-24 bg-zinc-50/10 animate-pulse rounded-3xl" />
                        ) : (
                            <div className="text-3xl font-semibold text-primary">
                                {balances.aleo.private ?? "..."}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="hidden">
                    <CardHeader>
                        <CardTitle className="text-sm text-foreground/70">
                            USAD Balance
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        {loadingPublic ? (
                            <div className="h-8 w-24 bg-zinc-50/10 animate-pulse rounded" />
                        ) : (
                            <div className="text-3xl font-semibold text-primary">
                                {"—"}
                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>


            {/* Active Campaigns */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Recent Distributions
                    </h2>
                </div>

                <CampaignList />
            </div>
            <div className="space-y-4">

                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 ml-2">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight">Your Payment Links</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your payment links and monitor their activity and revenue in real time.
                        </p>
                    </div>
                </div>

                <PaymentLinkList />

            </div>
        </div>
    )
}