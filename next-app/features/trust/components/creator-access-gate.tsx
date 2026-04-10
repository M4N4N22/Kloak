"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import type { LucideIcon } from "lucide-react"
import { Fingerprint, LockKeyhole, ShieldCheck, Wallet } from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CREATOR_READ_SCOPE,
  getCachedCreatorAccessPayload,
  getOrCreateCreatorAccessPayload,
} from "@/lib/creator-access"

function getHumanAccessError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ""

  if (
    message.includes("cancel") ||
    message.includes("reject") ||
    message.includes("denied") ||
    message.includes("declined")
  ) {
    return "You cancelled the wallet check, so we kept this page locked. Nothing was submitted."
  }

  if (
    message.includes("close") ||
    message.includes("disconnect") ||
    message.includes("not connected")
  ) {
    return "Your wallet closed before the check finished. Reopen it and try again."
  }

  if (message.includes("sign")) {
    return "We couldn't finish the wallet check. Please try again and approve the request in your wallet."
  }

  return "We couldn't confirm that this wallet owns these creator settings yet. Please try again."
}

type AccessPoint = {
  icon: LucideIcon
  title: string
  description: string
}

const DEFAULT_ACCESS_POINTS: AccessPoint[] = [
  {
    icon: Fingerprint,
    title: "Quick identity check",
    description: "This only confirms that you control the wallet tied to this workspace.",
  },
  {
    icon: ShieldCheck,
    title: "No funds move",
    description: "Nothing is paid, sent, or posted on-chain during this step.",
  },
  {
    icon: Wallet,
    title: "Needed for private settings",
    description: "It protects creator dashboards, link settings, and automations from opening under the wrong wallet.",
  },
]

export function CreatorAccessGate({
  children,
  disconnectedFallback,
  eyebrow,
  title,
  description,
  actionLabel,
  dialogTitle,
  dialogDescription,
  accessPoints = DEFAULT_ACCESS_POINTS,
}: {
  children: ReactNode
  disconnectedFallback?: ReactNode
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  dialogTitle: string
  dialogDescription: string
  accessPoints?: AccessPoint[]
}) {
  const { connected, address, signMessage } = useWallet()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [authorizing, setAuthorizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessGranted, setAccessGranted] = useState(false)

  const viewerAddress = address?.trim() || ""
  const hasCachedAccess = useMemo(
    () =>
      viewerAddress
        ? Boolean(getCachedCreatorAccessPayload(CREATOR_READ_SCOPE, viewerAddress))
        : false,
    [viewerAddress],
  )

  useEffect(() => {
    setError(null)
    setDialogOpen(false)
    setAccessGranted(hasCachedAccess)
  }, [viewerAddress, hasCachedAccess])

  if (!connected) {
    return disconnectedFallback ? <>{disconnectedFallback}</> : <WalletConnect />
  }

  const requestAccess = async () => {
    if (!viewerAddress) {
      setError("Connect the wallet that owns this workspace first.")
      return
    }

    try {
      setAuthorizing(true)
      setError(null)

      await getOrCreateCreatorAccessPayload({
        scope: CREATOR_READ_SCOPE,
        viewerAddress,
        signMessage,
      })

      setAccessGranted(true)
      setDialogOpen(false)
    } catch (accessError: unknown) {
      setError(getHumanAccessError(accessError))
    } finally {
      setAuthorizing(false)
    }
  }

  if (!accessGranted) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-18rem)] items-center justify-center">
          <div className="w-full max-w-2xl rounded-[2.5rem] border p-8 text-left shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-primary">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-xs text-primary/80">{eyebrow}</p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
                <p className="max-w-xl text-sm leading-6 text-neutral-400">{description}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-neutral-300 md:grid-cols-3">
              {accessPoints.map((item) => (
                <div key={item.title} className="rounded-3xl border p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{item.description}</p>
                </div>
              ))}
            </div>

            {error ? <div className="mt-5 ml-2 text-sm text-red-500">{error}</div> : null}

            <div className="mt-6 flex flex-col items-center gap-3">
              <Button onClick={() => setDialogOpen(true)}>{actionLabel}</Button>
              <p className="text-xs text-neutral-500">
                You&apos;ll review the request before the wallet opens.
              </p>
            </div>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => !authorizing && setDialogOpen(open)}>
          <DialogContent className="min-w-xl max-w-xl bg-neutral-950/50 p-0" showCloseButton={!authorizing}>
            <DialogHeader className="px-8 pt-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">{dialogTitle}</DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-neutral-400">
                {dialogDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="px-8 pb-6 pt-2 text-sm text-neutral-300">
              <div className="rounded-[1.75rem] border border-foreground/5 bg-foreground/[0.02] p-5">
                <p className="font-medium text-foreground">What happens next</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                  <li>Your wallet will ask you to approve a message.</li>
                  <li>No money moves and no network fee is charged.</li>
                  <li>If you close the wallet or say no, this page stays locked and you can try again anytime.</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="border-t border-foreground/5 bg-foreground/[0.02] px-6 py-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={authorizing}>
                Not now
              </Button>
              <Button onClick={() => void requestAccess()} disabled={authorizing}>
                {authorizing ? "Waiting for wallet..." : "Continue in wallet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return <>{children}</>
}
