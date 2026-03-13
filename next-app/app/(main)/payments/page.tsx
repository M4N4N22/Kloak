"use client"

import { useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { useBalances } from "@/hooks/use-balances"

export default function PaymentsPage() {
    const { connected } = useWallet()
    const { balances, loading } = useBalances()

    const [recipient, setRecipient] = useState("")
    const [amount, setAmount] = useState("")
    const [token, setToken] = useState("aleo")

    const handleSend = async () => {
        if (!connected) return

        console.log({
            recipient,
            amount,
            token,
        })

        /**
         * Later:
         * call transfer_private
         */
    }

    if (!connected) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-semibold">Payments</h1>

                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        Connect your Shield wallet to send private payments
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 ">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold">Payments</h1>
                <p className="text-muted-foreground text-sm">
                    Send private payments using Aleo
                </p>
            </div>

            {/* Send Payment */}
            <div className="flex w-full gap-4 items-center">


                {/* Balances */}
                <div className="flex flex-col gap-4 w-1/2">

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                ALEO Balance
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {loading ? (
                                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                            ) : (
                                <div className="text-xl font-semibold">
                                    {balances.aleo.public ?? "—"}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                USDCx Balance
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {loading ? (
                                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                            ) : (
                                <div className="text-xl font-semibold">
                                    { "—"}
                                </div>
                            )}
                        </CardContent>
                    </Card>


                </div>
                <div className="w-1/2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Private Payment</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">

                            <Input
                                placeholder="Recipient address (aleo1...)"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                            />

                            <div className="flex gap-3 justify-center items-center">

                                <Input
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    type="number"
                                />

                                <Select
                                    value={token}
                                    onValueChange={(v) => setToken(v)}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="aleo">ALEO</SelectItem>
                                        <SelectItem value="usdcx">USDCx</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>

                            <Button
                                className="w-full"
                                onClick={handleSend}
                            >
                                Send Privately
                            </Button>

                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Private transfer
                        </span>

                        <div className="flex items-center gap-3">
                            <Badge variant="secondary">ALEO</Badge>
                            <span className="font-medium">2.5</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Private transfer
                        </span>

                        <div className="flex items-center gap-3">
                            <Badge variant="secondary">USDCx</Badge>
                            <span className="font-medium">120</span>
                        </div>
                    </div>

                </CardContent>
            </Card>

        </div>
    )
}