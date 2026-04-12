"use client"

import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import { cn } from "@/lib/utils"
import type { PayClientLink, PayPageCopy } from "./pay-types"

export function PayActionPanel({
  link,
  copy,
  amount,
  setAmount,
  connected,
  loading,
  status,
  statusLabel,
  errorMessage,
  onPay,
}: {
  link: PayClientLink
  copy: PayPageCopy
  amount: string
  setAmount: (value: string) => void
  connected: boolean
  loading: boolean
  status: string
  statusLabel: string
  errorMessage: string | null
  onPay: () => void
}) {
  return (
    <div className=" bg-black/50 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-8 rounded-r-[2.25rem]">
      <div className="space-y-2">
        <h2 className="text-3xl font-medium tracking-tight text-foreground">Complete payment</h2>
        <p className="text-xs leading-7 text-neutral-400">
          Confirm the amount, connect your wallet if needed, and approve the transaction when your wallet asks.
        </p>
      </div>

      <div className="mt-8 space-y-5 bg-neutral-950/70 rounded-xl p-5">
        <div className="space-y-4 ">
          <label className="text-sm font-medium text-foreground ">{copy.amountLabel}</label>
          {link.allowCustomAmount ? (
            <div className="space-y-4">
              {link.suggestedAmounts?.length ? (
                <div className="flex flex-wrap gap-2">
                  {link.suggestedAmounts.map((suggestedAmount) => (
                    <button
                      key={suggestedAmount}
                      type="button"
                      onClick={() => setAmount(String(suggestedAmount))}
                      className={cn(
                        "rounded-full  px-3 py-1.5 text-xs font-medium transition border mt-2",
                        String(suggestedAmount) === String(amount)
                          ? "border-0 bg-primary/10 text-primary"
                          : "border-foreground/10 bg-black/20 text-neutral-400 hover:border-foreground/20 hover:text-foreground",
                      )}
                    >
                      {suggestedAmount} {link.token}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-4 py-4">
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full bg-transparent text-3xl font-semibold tracking-tight text-foreground outline-none placeholder:text-neutral-600"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl mt-4 border-foreground/10 bg-foreground/[0.03] px-4 py-4">
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                {link.amount}
                <span className="ml-2 text-sm  text-neutral-500">{link.token}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl  bg-foreground/[0.02] px-4 py-4">
          <div className="grid gap-3 text-xs">
            <LineItem label="Stored payer address" value="Private by default" strong />
            <LineItem label="Merchant-visible identity" value="Hidden unless you choose to disclose later" />
            <LineItem label="Compliance proof" value="Generated only when the proof owner requests it" />
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-[1.5rem] py-3 text-sm leading-6 text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {connected ? (
          <div className="space-y-3">
            <Button
              className={cn(
                "h-12 w-full rounded-full font-semibold transition-all duration-300",
                loading && "opacity-90 shadow-lg shadow-primary/20",
              )}
              onClick={onPay}
              disabled={loading || ["signing", "pending", "broadcasting", "finalized"].includes(status)}
            >
              {loading || status !== "idle" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {statusLabel}
                </>
              ) : (
                copy.buttonLabel
              )}
            </Button>

            <p className="text-xs leading-6 text-neutral-500">
              Your wallet will ask for approval. The payer address remains private by default throughout the payment flow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <WalletConnect />
            <p className="text-xs text-center leading-6 text-neutral-500">
              Connect a supported wallet to continue. Kloak will only use the wallet to prepare and confirm the private payment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function LineItem({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span className={cn("max-w-[220px] text-right text-neutral-300", strong && "font-medium text-foreground")}>
        {strong ? <Check className="mr-2 inline h-4 w-4 text-primary" /> : null}
        {value}
      </span>
    </div>
  )
}
