"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { Network } from "@provablehq/aleo-types"
import { getShortAddress } from "@provablehq/aleo-wallet-adaptor-core"

import { Button } from "@/components/ui/button"

export function WalletConnect() {
    const {
        wallets,
        wallet,
        selectWallet,
        connect,
        disconnect,
        connected,
        connecting,
        address,
    } = useWallet()

    const [attemptingConnect, setAttemptingConnect] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /* ------------------------------------------------ */
    /* CONNECT SHIELD WALLET                            */
    /* ------------------------------------------------ */

    const handleConnectShield = () => {
        try {
            setError(null)

            if (!wallets || wallets.length === 0) {
                setError("No wallets detected")
                return
            }

            const shield = wallets.find((w) =>
                w?.adapter?.name?.toLowerCase()?.includes("shield")
            )

            if (!shield) {
                setError("Shield wallet not installed")
                return
            }

            selectWallet(shield.adapter.name)
            setAttemptingConnect(true)
        } catch {
            setError("Wallet initialization failed")
            setAttemptingConnect(false)
        }
    }

    /* ------------------------------------------------ */
    /* CONNECT AFTER WALLET SELECTED                    */
    /* ------------------------------------------------ */

    useEffect(() => {
        const connectShield = async () => {
            if (!attemptingConnect) return
            if (!wallet) return
            if (connected) return
            if (connecting) return

            try {
                if (wallet.adapter.name.toLowerCase().includes("shield")) {
                    await connect(Network.TESTNET)
                }
            } catch (err: any) {
                // user rejected OR extension error
                if (
                    err?.message?.includes("User rejected") ||
                    err?.message?.includes("Receiving end does not exist")
                ) {
                    setError("Connection cancelled")
                } else {
                    setError("Connection failed")

                    if (process.env.NODE_ENV === "development") {
                        console.warn("Wallet connect warning:", err)
                    }
                }
            } finally {
                setAttemptingConnect(false)
            }
        }

        connectShield()
    }, [wallet, attemptingConnect, connected, connecting, connect])

    /* ------------------------------------------------ */
    /* HANDLE DISCONNECT SAFELY                         */
    /* ------------------------------------------------ */

    const handleDisconnect = async () => {
        try {
            if (!connected) return

            setError(null)

            await Promise.resolve(disconnect())
        } catch (err: any) {
            if (
                err?.name === "WalletDisconnectionError" ||
                err?.message?.includes("Receiving end does not exist") ||
                err?.message?.includes("disconnected port")
            ) {
                // swallow extension errors
            } else {
                if (process.env.NODE_ENV === "development") {
                    console.warn("Wallet disconnect warning:", err)
                }
            }
        } finally {
            // ensure UI never gets stuck
            setAttemptingConnect(false)
            setError(null)
        }
    }

    /* ------------------------------------------------ */
    /* RESET UI IF WALLET DISCONNECTS                   */
    /* ------------------------------------------------ */

    useEffect(() => {
        if (!connected) {
            setAttemptingConnect(false)
        }
    }, [connected])

    /* ------------------------------------------------ */
    /* DISCONNECTED UI                                  */
    /* ------------------------------------------------ */

    if (!connected) {
        return (
            <div className="flex items-center gap-2">

                <Button

                    onClick={handleConnectShield}
                    disabled={connecting || attemptingConnect}
                >
                    {connecting || attemptingConnect
                        ? "Connecting..."
                        : "Connect Shield Wallet"}
                </Button>

                {error && (
                    <span className="text-xs text-muted-foreground">
                        {error}
                    </span>
                )}

            </div>
        )
    }

    /* ------------------------------------------------ */
    /* CONNECTED UI                                     */
    /* ------------------------------------------------ */

    return (
        <div className="flex items-center gap-3 bg-zinc-500/10  rounded-full p-1 pl-6 shadow-xl">
            <span className="text-sm text-primary">
                {address ? getShortAddress(address) : "Connected"}
            </span>

            <Button
className="text-xs"
                variant="secondary"
                onClick={handleDisconnect}
            >
                Disconnect
            </Button>

        </div>
    )
}