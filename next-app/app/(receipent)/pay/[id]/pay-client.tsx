"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Globe, Loader2 } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import PaymentStepper from "../components/payment-stepper"
import { cn } from "@/lib/utils"
import { useHandlePay } from "@/hooks/use-handle-pay"
import { useHandleStablePay } from "@/hooks/use-handle-stable-pay"

export default function PayClient({ link }: any) {
  const { connected } = useWallet()

  const [amount, setAmount] = useState(link.amount || "")

  const aleoPayment = useHandlePay(link, amount)
  const stablePayment = useHandleStablePay(link, amount)
  const { handlePay, status, txId, loading, errorMessage } =
    link.token === "ALEO" ? aleoPayment : stablePayment

  useEffect(() => {
    fetch(`/api/payment-links/${link.id}/visit`, { method: "POST" })
  }, [link.id])

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "scanning": return "Searching for records...";
      case "consolidating": return "Joining records (~30s)...";
      case "signing": return "Confirm in Wallet...";
      case "pending": return "Generating ZK Proof...";
      case "broadcasting": return "Network Broadcast...";
      case "finalized": return "Success";
      default: return "Confirm Payment";
    }
  };

  const isFinalized = (status as string) === "finalized";
  const statusLabel = getStatusLabel(status);

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (txId) {
      navigator.clipboard.writeText(txId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl w-full items-start">

        {/* LEFT SIDE */}

        <div className="space-y-6 max-w-xs">

          <PaymentStepper status={status} />

          {/* Error / Warning message */}
          {errorMessage && (
            <div className="min-h-12">

              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg leading-relaxed">
                {errorMessage}
              </div>

            </div>)}

          {/* Info */}

          <div className="text-xs text-muted-foreground space-y-2">
            <p>• Payments are shielded using Aleo zero-knowledge proofs.</p>
            <p>• Your wallet address remains private.</p>
            <p>• Confirm the transaction in your wallet.</p>
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
                  Private payments powered by Aleo
                </span>
              </div>

            </div>

            <div className="flex gap-1 opacity-40">
              <div className="h-2 w-2 rounded-full bg-foreground" />
              <div className="h-2 w-2 rounded-full bg-foreground" />
            </div>
          </div>

          {/* PAYMENT DETAILS */}

          {!isFinalized && (
            <>
              <div className="space-y-3 mt-6">

                <h1 className="text-xl font-bold">
                  {link.title}
                </h1>

                {link.description && (
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                )}

              </div>

              <div className="border-t border-dashed border-foreground/20" />

              {/* AMOUNT */}

              <div className="space-y-2">

                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Amount to pay
                </span>

                {link.allowCustomAmount ? (
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="text-3xl font-bold bg-transparent outline-none w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                ) : (
                  <div className="text-3xl font-bold tracking-tight">
                    {link.amount}

                    <span className="text-sm ml-2 text-muted-foreground uppercase">
                      {link.token}
                    </span>
                  </div>
                )}

              </div>
            </>
          )}

          {/* PAYMENT BUTTON */}

          <div className="space-y-4 text-center mt-4">

            {isFinalized ? (
              <div className="space-y-2">

                <div className="flex flex-col items-center gap-4">
                  <span className="ring-8 ring-primary/20 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-flagship-gradient text-primary-foreground">
                    ✓
                  </span>

                  <span className="text-xl">
                    Payment Successful
                  </span>
                </div>

                <div className="bg-black/60 border rounded-xl p-4 space-y-3 mt-6">

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>

                    <span className="font-semibold">
                      {amount || link.amount} {link.token}
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
                          "text-[10px] px-2 py-1 rounded transition-all duration-200 uppercase font-bold",
                          copied
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-foreground/10 hover:bg-foreground/20 text-muted-foreground"
                        )}
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            ) : connected ? (

              <div className="space-y-3">
                <Button
                  className={cn(
                    "w-full h-12 rounded-full font-semibold transition-all duration-500",
                    loading && "opacity-90 shadow-lg shadow-primary/20"
                  )}
                  onClick={handlePay}
                  // Disable for ALL active states so the user can't double-click
                  disabled={loading || ["signing", "pending", "broadcasting", "finalized"].includes(status)}
                >
                  {loading || status !== "idle" ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />

                      {statusLabel}
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </Button>




                {/* Visual Hint for long waits */}
                {status === "broadcasting" && (
                  <p className="text-[10px] text-muted-foreground">
                    Generating proof & broadcasting. Please do not close this tab.
                  </p>
                )}
              </div>
            ) : (
              <WalletConnect />
            )}

          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-center gap-1.5 opacity-40 pt-2">

            <Globe className="h-3 w-3" />

            <span className="text-[10px] font-mono">
              kloak.vercel.app/pay/{link.id}
            </span>

          </div>

        </div>

      </div>
    </div>
  )
}
