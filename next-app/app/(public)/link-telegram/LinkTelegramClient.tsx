"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2, Globe } from "lucide-react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"

type Status = "idle" | "linking" | "success" | "error"

export default function LinkTelegramClient({
  token,
}: {
  token?: string
}) {
  const { connected, address } = useWallet()

  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const handleLink = async () => {
    if (!address || !token) return

    try {
      setStatus("linking")
      setError(null)

      const res = await fetch("/api/link-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          walletAddress: address,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to link wallet")
      }

      setStatus("success")
    } catch (err: any) {
      setError(err.message)
      setStatus("error")
    }
  }

  return (
    <div className="flex items-center justify-center p-6">
      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl w-full items-start">

        {/* LEFT SIDE */}

        <div className="space-y-6 max-w-xs">

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Link Wallet
            </h2>

            <p className="text-sm text-muted-foreground">
              Connect your wallet to manage payment links directly from Telegram.
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-2">
            <p>• Your wallet will be linked to your Telegram account</p>
            <p>• No transactions or signatures will be performed</p>
            <p>• This only enables bot-based link management</p>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              {error}
            </div>
          )}

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
                  Link wallet to Telegram
                </span>
              </div>

            </div>

            <div className="flex gap-1 opacity-40">
              <div className="h-2 w-2 rounded-full bg-foreground" />
              <div className="h-2 w-2 rounded-full bg-foreground" />
            </div>
          </div>

          {/* CONTENT */}

          {!token && (
            <div className="text-sm text-red-400 text-center">
              Invalid or missing token
            </div>
          )}

          {token && (
            <>
              {!connected ? (
                <WalletConnect />
              ) : status === "success" ? (
                <div className="flex flex-col items-center gap-4 text-center py-6">

                  <span className="ring-8 ring-primary/20 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-flagship-gradient text-primary-foreground">
                    ✓
                  </span>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold">
                      Wallet Linked
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You can now return to Telegram and use /inbox
                    </p>
                  </div>

                </div>
              ) : (
                <div className="space-y-4 mt-4">

                  <div className="text-sm text-muted-foreground text-center">
                    Connected wallet
                  </div>

                  <div className="text-center font-mono text-sm">
                    {address?.slice(0, 10)}...{address?.slice(-6)}
                  </div>

                  <Button
                    className="w-full h-12 rounded-full font-semibold"
                    onClick={handleLink}
                    disabled={status === "linking"}
                  >
                    {status === "linking" ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Linking...
                      </>
                    ) : (
                      "Link Wallet"
                    )}
                  </Button>

                </div>
              )}
            </>
          )}

          {/* FOOTER */}

          <div className="flex items-center justify-center gap-1.5 opacity-40 pt-2">

            <Globe className="h-3 w-3" />

            <span className="text-[10px] font-mono">
              kloak.app/link-telegram
            </span>

          </div>

        </div>

      </div>
    </div>
  )
}