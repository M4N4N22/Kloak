"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Globe, Loader2 } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import ClaimStepper from "../components/ClaimStepper"
import { cn } from "@/lib/utils"
import type { ClaimStatus } from "@/hooks/useClaimCampaign"
import { useClaimCampaign } from "@/hooks/useClaimCampaign"

export default function ClaimClient({ campaign }: any) {
    const { connected, address } = useWallet()
    const [proof, setProof] = useState<any>(null)

    const [eligible, setEligible] = useState<boolean | null>(null)
    const [payout, setPayout] = useState<string | null>(null)

    const [copied, setCopied] = useState(false)



    const {
        handleClaim,
        status: claimStatus,
        txId: claimTxId,
        loading: claimLoading,
        errorMessage
    } = useClaimCampaign(campaign)

    const status = claimStatus
    const loading = claimLoading
    const txId = claimTxId

    const isFinalized = status === "finalized"

    async function sha256(message: string) {
        const msgBuffer = new TextEncoder().encode(message)
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    }

    async function checkEligibility() {
        if (!address) return



        const lookupHash = await sha256(`${address}:${campaign.id}`)

        const res = await fetch(
            `/api/campaigns/${campaign.id}/proof?lookupHash=${lookupHash}`
        )

        const data = await res.json()
        console.log("Proof from API:", data.proof)

        if (data.eligible) {
            setEligible(true)
            setPayout(data.payout)
            setProof(data.proof)
        } else {
            setEligible(false)
        }

    }

    useEffect(() => {
        if (connected && address) {
            checkEligibility()
        }
    }, [connected, address])

    const handleCopy = () => {
        if (!txId) return

        navigator.clipboard.writeText(txId)
        setCopied(true)

        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center justify-center p-6">
            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl w-full items-start">

                {/* LEFT SIDE */}

                <div className="space-y-6 max-w-xs">

                    <ClaimStepper status={status} />

                    {errorMessage && (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                            {errorMessage}
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-2">
                        <p>• Rewards are distributed privately using Aleo ZK proofs.</p>
                        <p>• Your wallet address is never revealed on-chain.</p>
                        <p>• Claims cannot be executed twice.</p>
                    </div>

                </div>

                {/* RIGHT SIDE */}

                <div className="w-full max-w-sm rounded-[2.5rem] border bg-black/10 backdrop-blur-2xl p-6 flex flex-col gap-6">

                    {/* HEADER */}

                    <div className="flex justify-between items-center">
                        <div className="flex gap-3 items-center">

                            <Image
                                src="/kloak_logo.png"
                                alt="Kloak"
                                height={36}
                                width={36}
                                className="rounded-full"
                            />

                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Kloak</span>
                                <span className="text-xs opacity-50">
                                    Private reward distribution
                                </span>
                            </div>

                        </div>

                        <div className="flex gap-1 opacity-40">
                            <div className="h-2 w-2 rounded-full bg-foreground" />
                            <div className="h-2 w-2 rounded-full bg-foreground" />
                        </div>
                    </div>

                    {!isFinalized && (
                        <>
                            <div className="space-y-3 mt-6">

                                <h1 className="text-xl font-bold">
                                    {campaign.name}
                                </h1>

                                {campaign.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {campaign.description}
                                    </p>
                                )}

                            </div>

                            <div className="border-t border-dashed border-white/20" />

                            {/* PAYOUT */}

                            {eligible && payout && (
                                <div className="space-y-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                        You are eligible to claim
                                    </span>

                                    <div className="text-3xl font-bold tracking-tight">
                                        {/* Formatting to ensure we show 0.1 instead of 0.100000 */}
                                        {(Number(payout) / 1_000_000).toLocaleString(undefined, {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 6
                                        })}

                                        <span className="text-sm ml-2 text-muted-foreground uppercase">
                                            aleo
                                        </span>
                                    </div>
                                </div>
                            )}
                            {eligible === false && (
                                <p className="text-sm text-muted-foreground">
                                    You are not eligible for this campaign.
                                </p>
                            )}

                        </>
                    )}

                    {/* CLAIM BUTTON */}

                    <div className="space-y-4 text-center mt-4">

                        {isFinalized ? (
                            <div className="space-y-2">

                                <div className="flex flex-col items-center gap-4">
                                    <span className="ring-8 ring-primary/20 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-flagship-gradient text-primary-foreground">
                                        ✓
                                    </span>

                                    <span className="text-xl">
                                        Claim Successful
                                    </span>
                                </div>

                                <div className="bg-black/60 border rounded-xl p-4 space-y-3 mt-6">

                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Reward Claimed
                                        </span>

                                        <span className="font-semibold">
                                            {Number(payout) / 1_000_000} CREDITS
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">

                                        <span className="text-muted-foreground">
                                            Transaction ID
                                        </span>

                                        <div className="flex items-center gap-2">

                                            <span className="font-mono">
                                                {txId?.slice(0, 8)}...{txId?.slice(-6)}
                                            </span>

                                            <button
                                                onClick={handleCopy}
                                                className={cn(
                                                    "text-[10px] px-2 py-1 rounded transition-all uppercase font-bold",
                                                    copied
                                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                        : "bg-white/10 hover:bg-white/20 text-muted-foreground"
                                                )}
                                            >
                                                {copied ? "Copied" : "Copy"}
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        ) : connected ? (
                            <Button
                                className="w-full h-12 rounded-full font-semibold"
                                disabled={!eligible}
                                onClick={handleClaim}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                        Claiming...
                                    </>
                                ) : (
                                    "Claim Now"
                                )}
                            </Button>
                        ) : (
                            <WalletConnect />
                        )}

                    </div>

                    {/* FOOTER */}

                    <div className="flex items-center justify-center gap-1.5 opacity-40 pt-2">

                        <Globe className="h-3 w-3" />

                        <span className="text-[10px] font-mono">
                            kloak.vercel.app/claim/{campaign.id.slice(0, 8)}...{campaign.id.slice(-6)}
                        </span>
                    </div>

                </div>

            </div>
        </div>
    )
}