"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import PaymentLinkRow from "./payment-link-row"

export default function PaymentLinkList() {
    const { address } = useWallet()

    const [links, setLinks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!address) return

        async function fetchLinks() {
            try {
                const res = await fetch(
                    `/api/payment-links?creator=${address}`
                )

                const data = await res.json()

                setLinks(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchLinks()
    }, [address])

    function PaymentLinkRowSkeleton() {
        return (
            <div className="flex items-center justify-between p-4 rounded-3xl bg-zinc-500/10 animate-pulse">

                {/* Left */}
                <div className="flex items-center gap-4">
                    <div>
                        <div className="h-5 w-40 bg-zinc-50/10 rounded-xl mb-2" />
                        <div className="h-3 w-24 bg-zinc-50/10 rounded-xl" />
                    </div>
                </div>

                {/* Center */}
                <div className="hidden md:block text-right mr-8">
                    <div className="h-4 w-20 bg-zinc-50/10 rounded-xl mb-2" />
                    <div className="h-3 w-16 bg-zinc-50/10 rounded-xl" />
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <div className="h-9 w-24 bg-zinc-50/10 rounded-xl" />
                    <div className="h-9 w-20 bg-zinc-50/10 rounded-xl" />
                    <div className="h-9 w-9 bg-zinc-50/10 rounded-full" />
                </div>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle></CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

                {/* Loading skeleton */}
                {loading && (
                    <>
                        <PaymentLinkRowSkeleton />
                        <PaymentLinkRowSkeleton />
                        <PaymentLinkRowSkeleton />
                    </>
                )}

                {/* Empty state */}
                {!loading && links.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
                        <p>No payment links created yet</p>
                        <p className="text-xs opacity-60 mt-1">
                            Create your first payment link to start receiving payments
                        </p>
                    </div>
                )}

                {/* Links */}
                {!loading &&
                    links.map((link) => (
                        <PaymentLinkRow key={link.id} link={link} />
                    ))}

            </CardContent>
        </Card>
    )
}