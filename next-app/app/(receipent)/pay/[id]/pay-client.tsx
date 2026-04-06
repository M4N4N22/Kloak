"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Check, Globe, Loader2 } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import PaymentStepper from "../components/payment-stepper"
import { cn } from "@/lib/utils"
import { useHandlePay } from "@/hooks/use-handle-pay"
import { useHandleStablePay } from "@/hooks/use-handle-stable-pay"
import {
  getPaymentLinkTemplate,
  type PaymentLinkTemplateId,
} from "@/features/payment-links/lib/templates"

type PayClientLink = {
  id: string
  requestId: string
  title: string
  description: string | null
  template: PaymentLinkTemplateId
  successMessage: string | null
  redirectUrl: string | null
  suggestedAmounts: number[] | null
  amount: number | null
  token: "ALEO" | "USDCX" | "USAD"
  allowCustomAmount: boolean
}

export default function PayClient({ link }: { link: PayClientLink }) {
  const { connected } = useWallet()
  const template = getPaymentLinkTemplate(link.template)

  const [amount, setAmount] = useState<string>(link.amount !== null ? String(link.amount) : "")
  const [copied, setCopied] = useState(false)
  const [redirectSeconds, setRedirectSeconds] = useState(4)

  const aleoPayment = useHandlePay(link, amount)
  const stablePayment = useHandleStablePay(link, amount)
  const { handlePay, status, txId, loading, errorMessage } =
    link.token === "ALEO" ? aleoPayment : stablePayment

  useEffect(() => {
    fetch(`/api/payment-links/${link.id}/visit`, { method: "POST" }).catch(() => {
      // Visit tracking is best-effort and should never block payment UX.
    })
  }, [link.id])

  const getStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case "scanning":
        return "Searching for records..."
      case "consolidating":
        return "Joining records (~30s)..."
      case "signing":
        return "Confirm in wallet..."
      case "pending":
        return "Generating ZK proof..."
      case "broadcasting":
        return "Broadcasting to network..."
      case "finalized":
        return "Success"
      default:
        return "Confirm Payment"
    }
  }

  const isFinalized = status === "finalized"
  const statusLabel = getStatusLabel(status)

  useEffect(() => {
    if (!isFinalized || !link.redirectUrl) {
      return
    }

    const countdown = window.setInterval(() => {
      setRedirectSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(countdown)
          window.location.assign(link.redirectUrl as string)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(countdown)
  }, [isFinalized, link.redirectUrl])

  const payPageCopy = {
    invoice: {
      eyebrow: "Invoice payment",
      amountLabel: "Invoice total",
      buttonLabel: "Pay invoice",
      helper: "Review the invoice details and complete payment securely.",
    },
    freelance: {
      eyebrow: "Freelance payment",
      amountLabel: "Amount due",
      buttonLabel: "Pay now",
      helper: "Complete this service payment securely with your wallet.",
    },
    "tip-jar": {
      eyebrow: "Support payment",
      amountLabel: "Choose an amount",
      buttonLabel: "Send support",
      helper: "Pick any amount you want to send.",
    },
    checkout: {
      eyebrow: "Checkout",
      amountLabel: "Order total",
      buttonLabel: "Complete payment",
      helper: "Finish your payment to continue.",
    },
    custom: {
      eyebrow: "Payment",
      amountLabel: "Amount to pay",
      buttonLabel: "Pay now",
      helper: "Review the details and confirm the payment in your wallet.",
    },
  }[template.id]

  const handleCopy = () => {
    if (!txId) return
    navigator.clipboard.writeText(txId)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center p-6">
      <div className="grid w-full max-w-5xl items-start gap-12 lg:grid-cols-2">
        <div className="max-w-xs space-y-6">
          <PaymentStepper status={status} />

          {errorMessage && (
            <div className="min-h-12">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-400">
                {errorMessage}
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Payments are shielded using Aleo zero-knowledge proofs.</p>
            <p>Your wallet address remains private.</p>
            <p>Confirm the transaction in your wallet.</p>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-6 rounded-[2.5rem] border bg-black/10 p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/kloak_logo.png" alt="Kloak" height={36} width={36} className="rounded-full" />

              <div className="flex flex-col">
                <span className="text-sm font-medium">Kloak</span>
                <span className="text-xs opacity-50">Private payments powered by Aleo</span>
              </div>
            </div>

            <div className="flex gap-1 opacity-40">
              <div className="h-2 w-2 rounded-full bg-foreground" />
              <div className="h-2 w-2 rounded-full bg-foreground" />
            </div>
          </div>

          {!isFinalized && (
            <>
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {payPageCopy.eyebrow}
                </p>
                <h1 className="text-xl font-bold">{link.title}</h1>

                {link.description ? (
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{payPageCopy.helper}</p>
                )}
              </div>

              <div className="border-t border-dashed border-foreground/20" />

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {payPageCopy.amountLabel}
                </span>

                {link.allowCustomAmount ? (
                  <div className="space-y-4">
                    {template.id === "tip-jar" && link.suggestedAmounts?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {link.suggestedAmounts.map((suggestedAmount) => (
                          <button
                            key={suggestedAmount}
                            type="button"
                            onClick={() => setAmount(String(suggestedAmount))}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                              String(suggestedAmount) === String(amount)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-foreground/10 bg-black/20 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                            )}
                          >
                            {suggestedAmount} {link.token}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full bg-transparent text-3xl font-bold outline-none"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </div>
                ) : (
                  <div className="text-3xl font-bold tracking-tight">
                    {link.amount}
                    <span className="ml-2 text-sm uppercase text-muted-foreground">{link.token}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-4 space-y-4 text-center">
            {isFinalized ? (
              <div className="space-y-2">
                <div className="flex flex-col items-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-flagship-gradient text-2xl font-bold text-primary-foreground ring-8 ring-primary/20">
                    <Check className="h-8 w-8" />
                  </span>
                  <span className="text-xl">Payment Successful</span>
                  {link.successMessage ? (
                    <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                      {link.successMessage}
                    </p>
                  ) : null}
                  {link.redirectUrl ? (
                    <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                      You&apos;ll be sent back automatically in {redirectSeconds}s.
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 space-y-3 rounded-xl border bg-black/60 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold">
                      {amount || link.amount} {link.token}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {txId?.slice(0, 8)}...{txId?.slice(-6)}
                      </span>

                      <button
                        onClick={handleCopy}
                        className={cn(
                          "rounded px-2 py-1 text-[10px] font-bold uppercase transition-all duration-200",
                          copied
                            ? "border border-green-500/30 bg-green-500/20 text-green-400"
                            : "bg-foreground/10 text-muted-foreground hover:bg-foreground/20",
                        )}
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {link.redirectUrl ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => window.location.assign(link.redirectUrl as string)}
                  >
                    Continue
                  </Button>
                ) : null}
              </div>
            ) : connected ? (
              <div className="space-y-3">
                <Button
                  className={cn(
                    "h-12 w-full rounded-full font-semibold transition-all duration-500",
                    loading && "opacity-90 shadow-lg shadow-primary/20",
                  )}
                  onClick={handlePay}
                  disabled={loading || ["signing", "pending", "broadcasting", "finalized"].includes(status)}
                >
                  {loading || status !== "idle" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {statusLabel}
                    </>
                  ) : (
                    payPageCopy.buttonLabel
                  )}
                </Button>

                {status === "broadcasting" && (
                  <p className="text-[10px] text-muted-foreground">
                    Generating proof and broadcasting. Please do not close this tab.
                  </p>
                )}
              </div>
            ) : (
              <WalletConnect />
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 opacity-40">
            <Globe className="h-3 w-3" />
            <span className="text-[10px] font-mono">{`kloak.vercel.app/pay/${link.id}`}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
