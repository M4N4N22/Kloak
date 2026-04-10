"use client"

import { useEffect, useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Button } from "@/components/ui/button"
import { TrustLinksRow } from "@/features/trust/components/trust-links-row"
import { cn } from "@/lib/utils"
import { useHandlePay } from "@/hooks/use-handle-pay"
import { useHandleStablePay } from "@/hooks/use-handle-stable-pay"
import { getPaymentLinkTemplate } from "@/features/payment-links/lib/templates"
import { PayActionPanel } from "../components/pay-action-panel"
import { PaySummaryPanel } from "../components/pay-summary-panel"
import PaymentStepper from "../components/payment-stepper"
import type { PayClientLink } from "../components/pay-types"

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
      // Best effort only.
    })
  }, [link.id])

  useEffect(() => {
    if (status !== "finalized" || !link.redirectUrl) {
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
  }, [link.redirectUrl, status])

  const payPageCopy = {
    invoice: {
      eyebrow: "Invoice payment",
      amountLabel: "Invoice total",
      buttonLabel: "Pay invoice",
      helper: "Review the invoice details, keep the payer address private by default, and confirm the payment in your wallet.",
    },
    freelance: {
      eyebrow: "Freelance payment",
      amountLabel: "Amount due",
      buttonLabel: "Pay now",
      helper: "Complete this service payment securely. The merchant does not see the payer address by default.",
    },
    "tip-jar": {
      eyebrow: "Support payment",
      amountLabel: "Choose an amount",
      buttonLabel: "Send support",
      helper: "Pick the amount you want to send. Settlement stays private by default.",
    },
    checkout: {
      eyebrow: "Checkout",
      amountLabel: "Order total",
      buttonLabel: "Complete payment",
      helper: "Finish the payment and return to the merchant flow after confirmation.",
    },
    custom: {
      eyebrow: "Payment",
      amountLabel: "Amount to pay",
      buttonLabel: "Pay now",
      helper: "Review the payment details and confirm in your wallet. The payer identity stays private by default.",
    },
  }[template.id]

  const statusLabel = getStatusLabel(status)
  const isFinalized = status === "finalized"

  const handleCopy = async () => {
    if (!txId) return
    await navigator.clipboard.writeText(txId)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  if (isFinalized) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2.5rem]   p-8 text-center backdrop-blur-2xl sm:p-10">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-primary ring-8 ring-primary/10">
            <Check className="h-8 w-8 text-primary-foreground" />
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold  text-primary">Payment complete</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Payment received successfully
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-neutral-400">
              {link.successMessage ||
                "Your payment was confirmed privately. If you ever need to prove it later, the proof owner can choose exactly what to disclose."}
            </p>
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-foreground/[0.03] p-5 text-left">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <SuccessRow label="Amount paid" value={`${amount || link.amount} ${link.token}`} />
              <SuccessRow label="Payer address" value="Private by default" />
            </div>

            {txId ? (
              <div className="mt-4 flex flex-col gap-3 rounded-[1.25rem]  bg-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs  text-neutral-500">Transaction ID</p>
                  <p className="mt-2 font-mono text-sm text-neutral-300">
                    {txId.slice(0, 12)}...{txId.slice(-10)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className={cn("rounded-full border-foreground/10 bg-foreground/[0.03]", copied && "border-primary/20 text-primary")}
                  onClick={() => void handleCopy()}
                >
                  {copied ? "Copied" : "Copy transaction ID"}
                
                </Button>
              </div>
            ) : null}
          </div>

          {link.redirectUrl ? (
            <div className="mt-8 space-y-3">
              <p className="text-sm text-neutral-500">
                You&apos;ll be sent back automatically in {redirectSeconds}s.
              </p>
              <Button className="rounded-full text-black" onClick={() => window.location.assign(link.redirectUrl as string)}>
                Continue
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <TrustLinksRow className="mt-8 justify-center" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 ">
        <PaymentStepper status={status} orientation="horizontal" />

        <div className="grid items-start gap-0 lg:grid-cols-[0.75fr_0.75fr] xl:gap-0  bg-neutral-950 rounded-[2.25rem] ">
        <PaySummaryPanel
          link={link}
          copy={payPageCopy}
        />

        <div className="space-y-5">
          <PayActionPanel
            link={link}
            copy={payPageCopy}
            amount={amount}
            setAmount={setAmount}
            connected={connected}
            loading={loading}
            status={status}
            statusLabel={statusLabel}
            errorMessage={errorMessage}
            onPay={handlePay}
          />
        </div>
        </div>
      </div>
    </div>
  )
}

function getStatusLabel(currentStatus: string) {
  switch (currentStatus) {
    case "scanning":
      return "Searching for wallet records..."
    case "consolidating":
      return "Preparing the payment..."
    case "signing":
      return "Confirm in wallet"
    case "pending":
      return "Generating private proof..."
    case "broadcasting":
      return "Submitting to Aleo..."
    case "finalized":
      return "Success"
    default:
      return "Confirm payment"
  }
}

function SuccessRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs  text-neutral-500">{label}</p>
      <p className="text-base font-medium text-foreground">{value}</p>
    </div>
  )
}
