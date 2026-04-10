"use client"

import type { ReactNode } from "react"
import { Link2 } from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"

export function PaymentLinksAccessGate({
  connected,
  children,
}: {
  connected: boolean
  children: ReactNode
}) {
  if (connected) {
    return <>{children}</>
  }

  return (
    <div className=" bg-[radial-gradient(circle_at_top,rgba(241,246,106,0.12),transparent_30%),rgba(255,255,255,0.02)]  p-16 text-center ">
      <div className="mx-auto flex flex-col items-center gap-5">
        <div className="rounded-3xl bg-primary/10 p-4 text-primary">
          <Link2 className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Connect your wallet to create payment links</h1>
          <p className="text-sm leading-7 text-neutral-400">
            Create payment links, track payments, and move completed payments into compliance when needed, while keeping the payer private by default.
          </p>
        </div>
        <WalletConnect />
      </div>
    </div>
  )
}
