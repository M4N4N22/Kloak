"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import { Fingerprint, LockKeyhole, ShieldCheck, Wallet } from "lucide-react"

import { ComplianceDisconnectedState } from "@/app/(main)/compliance/components/compliance-disconnected-state"
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
  buildComplianceAccessMessage,
  bytesToBase64,
  COMPLIANCE_READ_SCOPE,
  getCachedComplianceAccessPayload,
  setCachedComplianceAccessPayload,
} from "@/lib/compliance-access"

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

  return "We couldn't confirm that this wallet owns these records yet. Please try again."
}

export function ComplianceAccessGate({
  children,
  requiresSignedAccess = false,
}: {
  children: ReactNode
  requiresSignedAccess?: boolean
}) {
  const { connected, address, signMessage } = useWallet()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [authorizing, setAuthorizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessGranted, setAccessGranted] = useState(false)

  const viewerAddress = address?.trim() || ""
  const hasCachedAccess = useMemo(
    () =>
      requiresSignedAccess && viewerAddress
        ? Boolean(getCachedComplianceAccessPayload(COMPLIANCE_READ_SCOPE, viewerAddress))
        : false,
    [requiresSignedAccess, viewerAddress],
  )

  useEffect(() => {
    setError(null)
    setDialogOpen(false)
    setAccessGranted(hasCachedAccess)
  }, [viewerAddress, hasCachedAccess])

  if (!connected) {
    return <ComplianceDisconnectedState />
  }

  const requestAccess = async () => {
    if (!viewerAddress) {
      setError("Connect the wallet that owns these payments or proofs first.")
      return
    }

    try {
      setAuthorizing(true)
      setError(null)

      const issuedAt = Date.now().toString()
      const message = buildComplianceAccessMessage({
        scope: COMPLIANCE_READ_SCOPE,
        viewerAddress,
        issuedAt,
      })
      const signatureBytes = await signMessage(new TextEncoder().encode(message))

      if (!signatureBytes) {
        throw new Error("Wallet did not return a signature.")
      }

      setCachedComplianceAccessPayload({
        viewerAddress,
        scope: COMPLIANCE_READ_SCOPE,
        issuedAt,
        signature: bytesToBase64(signatureBytes),
      })

      setAccessGranted(true)
      setDialogOpen(false)
    } catch (accessError: unknown) {
      setError(getHumanAccessError(accessError))
    } finally {
      setAuthorizing(false)
    }
  }

  if (requiresSignedAccess && !accessGranted) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-18rem)] items-center justify-center">
          <div className="w-full max-w-2xl rounded-[2.5rem] border p-8 text-left shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-primary">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-xs  text-primary/80">
                  Sensitive Workspace
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Unlock your compliance records
                </h2>
                <p className="max-w-xl text-sm leading-6 text-neutral-400">
                  These pages show payments and proof records tied to your wallet. Before we show them, we ask your wallet to confirm that this is really you.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-neutral-300 md:grid-cols-3">
              <AccessPoint
                icon={Fingerprint}
                title="Quick identity check"
                description="This only confirms that you control the wallet tied to these records."
              />
              <AccessPoint
                icon={ShieldCheck}
                title="No funds move"
                description="Nothing is paid, sent, or posted on-chain during this step."
              />
              <AccessPoint
                icon={Wallet}
                title="Needed for private records"
                description="It protects sent and received payment history from being opened by the wrong wallet."
              />
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col items-center gap-3">
              <Button onClick={() => setDialogOpen(true)}>Unlock compliance records</Button>
              <p className="text-xs text-neutral-500">
                You&apos;ll review the request before the wallet opens.
              </p>
            </div>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => !authorizing && setDialogOpen(open)}>
          <DialogContent className="max-w-xl min-w-xl bg-zinc-950/50 p-0" showCloseButton={!authorizing}>
            <DialogHeader className="px-8 pt-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Confirm it&apos;s you
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-neutral-400">
                We&apos;re about to ask your wallet for a quick confirmation so we can open payments and proofs that belong to this wallet. This is just an access check.
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

function AccessPoint({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Fingerprint
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border  p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
    </div>
  )
}
