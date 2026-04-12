"use client"

import { CheckCircle2, Copy, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type PaymentLinkCreatedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  generatedLink: string
  txId?: string | null
}

export function PaymentLinkCreatedDialog({
  open,
  onOpenChange,
  generatedLink,
  txId,
}: PaymentLinkCreatedDialogProps) {
  const handleCopyLink = () => navigator.clipboard.writeText(generatedLink)

  const handleShare = async () => {
    if (!navigator.share) {
      await handleCopyLink()
      return
    }

    await navigator.share({
      title: "Payment Link",
      url: generatedLink,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <CheckCircle2 className="mb-2 h-10 w-10 text-primary" />
          <DialogTitle>Payment link created</DialogTitle>
          <DialogDescription>
            Share this link with the person you want to collect from.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Payment link</p>
          <Input className="truncate pr-16" value={generatedLink} readOnly />
        </div>

        {txId ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Transaction ID</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs">
                {txId.slice(0, 8)}...{txId.slice(-6)}
              </span>

              <button
                onClick={() => navigator.clipboard.writeText(txId)}
                className="rounded bg-foreground/10 px-2 py-1 text-xs hover:bg-foreground/20"
              >
                Copy
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex gap-4 pt-2">
          <Button className="flex-1" variant="secondary" onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>

          <Button className="flex-1" onClick={() => void handleShare()}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
