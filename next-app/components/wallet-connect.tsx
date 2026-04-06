"use client"

import { useEffect, useMemo, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { WalletMultiButton } from "@provablehq/aleo-wallet-adaptor-react-ui"
import { getShortAddress } from "@provablehq/aleo-wallet-adaptor-core"
import { WalletReadyState } from "@provablehq/aleo-wallet-standard"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WalletConnect() {
    const { wallets, wallet, selectWallet, disconnect, connected, connecting, reconnecting, autoConnect, address } = useWallet()
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const visibleWallets = useMemo(
        () =>
            [...wallets].sort((left, right) => {
                const order = (name?: string) => {
                    const normalized = String(name || "").toLowerCase()
                    if (normalized.includes("shield")) return 0
                    if (normalized.includes("leo")) return 1
                    return 2
                }

                return order(String(left.adapter.name)) - order(String(right.adapter.name))
            }),
        [wallets],
    )

    const handleSelectWallet = (
        walletName: (typeof wallets)[number]["adapter"]["name"],
        readyState: WalletReadyState,
    ) => {
        try {
            setError(null)
            if (readyState !== WalletReadyState.INSTALLED) {
                setError("That wallet is not installed in this browser yet.")
                return
            }

            selectWallet(walletName)
        } catch {
            setError("We couldn't start the wallet connection flow.")
        }
    }

    const handleDisconnect = async () => {
        try {
            if (!connected) return

            setError(null)

            await Promise.resolve(disconnect())
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : ""
            if (
                (err instanceof Error && err.name === "WalletDisconnectionError") ||
                message.includes("Receiving end does not exist") ||
                message.includes("disconnected port")
            ) {
                // swallow extension errors
            } else {
                if (process.env.NODE_ENV === "development") {
                    console.warn("Wallet disconnect warning:", err)
                }
            }
        } finally {
            setError(null)
        }
    }

    if (!connected) {
        return (
            <div className="flex flex-col items-center gap-2">
                <WalletMultiButton className="!h-10 !rounded-full !border bg-linear-to-br from-primary via-green-400 to-emerald-400 !border-foreground/10 !bg-primary !px-5 !text-sm !font-semibold !text-black shadow-lg shadow-primary/10" />

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {autoConnect ? <span>Auto-connect on</span> : null}
                    {reconnecting ? <span>Reconnecting wallet…</span> : null}
                    {!reconnecting && error ? <span>{error}</span> : null}
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3 rounded-full bg-neutral-500/10 p-1  shadow-xl">
            <WalletMultiButton className="!h-10 !rounded-full !border !border-foreground/10 !bg-linear-to-br from-primary via-green-400 to-emerald-400 !px-4 !text-sm !font-semibold !text-black shadow-lg shadow-primary/10" />
        </div>
    )
}
