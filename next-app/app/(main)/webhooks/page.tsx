"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import PayloadFormat from "./PayloadFormat"
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Info,
  Lock,
  Plus,
  Repeat,
  Shield,
  Trash2,
  AlertTriangle,
  Zap,
} from "lucide-react"

import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type Webhook = {
  id: string
  url: string
  secret?: string | null
  isActive: boolean
  lastDelivery?: string | null
  deliveryStatus?: "success" | "failed" | null
}

export default function WebhooksPage() {
  const { connected, address } = useWallet()

  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [newWebhook, setNewWebhook] = useState({ url: "", secret: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!connected || !address) {
      setLoading(false)
      return
    }

    async function fetchWebhooks(addr: string) {
      setLoading(true)
      setErrorMessage(null)

      try {
        const res = await fetch(
          `/api/webhooks?creator=${encodeURIComponent(addr)}`
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch webhooks")
        }

        setWebhooks(data)
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to load webhooks")
      } finally {
        setLoading(false)
      }
    }

    fetchWebhooks(address)
  }, [connected, address])

  const handleAddWebhook = async () => {
    if (!address || !newWebhook.url || saving) return

    setSaving(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorAddress: address,
          url: newWebhook.url,
          secret: newWebhook.secret,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create webhook")
      }

      setWebhooks((current) => [
        {
          id: data.id,
          url: data.url,
          secret: data.secret,
          isActive: data.active,
          lastDelivery: null,
          deliveryStatus: null,
        },
        ...current,
      ])
      setNewWebhook({ url: "", secret: "" })
      setIsDialogOpen(false)
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create webhook")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!address || deletingId) return

    setDeletingId(id)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/webhooks/${id}?creator=${encodeURIComponent(address)}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete webhook")
      }

      setWebhooks((current) => current.filter((webhook) => webhook.id !== id))
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete webhook")
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleSecret = (id: string) => {
    setShowSecret((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (!connected) {
    return (
      <div className="rounded-[2.5rem] border-2 border-dashed border-foreground/5 bg-foreground/2 p-20 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Connect Shield Wallet
        </h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          Connect your wallet to manage creator-level webhook endpoints.
        </p>
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-7xl tracking-tighter font-bold">Webhooks</h1>
              <p className="text-muted-foreground max-w-md">
                Creator-level endpoints receive `payment.success` events from all of your payment links.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">All Links</Badge>
              <Badge variant="secondary">Real-time Delivery</Badge>
              <Badge variant="secondary">Secure Signing</Badge>
              <Badge variant="secondary">Backend Automation</Badge>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className=" "
              >
                <Plus className="mr-2" size={18} />
                Add Webhook
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-140 p-0 overflow-hidden border-border/50 ">

              {/* HEADER */}
              <div className="bg-muted/30 p-6 border-b border-border/50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Add Webhook Endpoint
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Receive real-time payment events on your backend. Events are sent for all links created by this wallet.
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-8 h-96 overflow-y-scroll">

                {/* URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-1">
                      <Globe size={14} className="text-muted-foreground" />
                      Endpoint URL <span className="text-primary">*</span>
                    </Label>

                    <Badge
                      variant="outline"

                    >
                      HTTPS Recommended
                    </Badge>
                  </div>

                  <Input
                    placeholder="https://api.yourdomain.com/webhooks/kloak"
                    className="pl-4 py-6 bg-muted/20 border-border/50 focus:bg-background transition-all"
                    value={newWebhook.url}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, url: e.target.value })
                    }
                  />

                  <div className="flex items-center gap-1 text-xs text-muted-foreground  ml-1">
                    <Info size={14} className=" text-primary shrink-0" />
                    <p>
                      Kloak sends <span className="font-mono text-primary">POST</span> requests here whenever a payment succeeds.
                    </p>
                  </div>
                </div>

                {/* SECRET */}
                <div className="space-y-2">

                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Lock size={14} className="text-muted-foreground" />
                    Webhook Signing (Optional)
                  </Label>

                  <Input
                    type="password"
                    placeholder="Shared secret for request verification"
                    className="pl-4 py-6 bg-muted/20 border-border/50 focus:bg-background transition-all"
                    value={newWebhook.secret}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, secret: e.target.value })
                    }
                  />

                  {/* EXPLANATION */}
                  <div className="space-y-2 text-xs text-muted-foreground  border py-8 px-4 rounded-3xl">

                    <p>
                      If provided, all webhook requests will be signed using HMAC SHA-256.
                    </p>

                    <p>
                      Your server should verify the signature using:
                    </p>

                    <div className="bg-black/50 rounded-md px-3 py-2 font-mono text-[11px] text-primary border border-foreground/10">
                      HMAC_SHA256(secret, {`"${"{timestamp}.{body}"}"`})
                    </div>

                    <p>
                      Compare this value with the{" "}
                      <span className="font-mono text-primary">x-kloak-signature</span>{" "}
                      header.
                    </p>

                  </div>

                  {/* WARNING */}
                  <div className="flex items-center gap-1 text-[11px] text-orange-500 bg-orange-500/10 p-3 rounded-3xl ">
                    <AlertTriangle size={14} className=" shrink-0" />
                    <p>
                      Without a secret, webhook requests are not verified. Recommended for production use.
                    </p>
                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <DialogFooter className="p-6">
                <Button
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleAddWebhook}
                  disabled={saving || !newWebhook.url.trim()}
                  className="flex-1"
                >
                  {saving ? "Creating..." : "Create Webhook"}
                </Button>
              </DialogFooter>

            </DialogContent>
          </Dialog>
        </div>

        {errorMessage && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
            {errorMessage}
          </div>
        )}



        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Webhooks</h2>

          {loading ? (
            <Card className="p-12 text-center space-y-3">
              <p className="text-muted-foreground">Loading webhooks...</p>
            </Card>
          ) : webhooks.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <p className="text-muted-foreground">No webhooks configured</p>
              <p className="text-sm text-muted-foreground">
                Add one to receive payment events from all of your payment links.
              </p>
            </Card>
          ) : (
            webhooks.map((webhook) => (
              <Card key={webhook.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <code className="flex-1 bg-black/50 rounded-full px-4 py-3 text-sm font-mono border border-foreground/10 break-all">
                        {webhook.url}
                      </code>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(webhook.url, webhook.id)}
                      >
                        {copied === webhook.id ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>

                    {webhook.secret && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Secret</Label>

                        <div className="flex items-center gap-3">
                          <code className="flex-1 bg-black/50 rounded-full px-4 py-3 text-sm font-mono border border-foreground/10">
                            {showSecret[webhook.id]
                              ? webhook.secret
                              : "•".repeat(webhook.secret.length)}
                          </code>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => toggleSecret(webhook.id)}
                          >
                            {showSecret[webhook.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">
                        {webhook.isActive ? "Active" : "Inactive"}
                      </Badge>

                      {webhook.lastDelivery && (
                        <span>
                          Last delivery: {new Date(webhook.lastDelivery).toLocaleString()}
                        </span>
                      )}

                      {webhook.deliveryStatus === "success" && (
                        <Badge className="bg-primary/20 text-emerald-400 border-emerald-400/30">
                          Success
                        </Badge>
                      )}

                      {webhook.deliveryStatus === "failed" && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(webhook.id)}
                    disabled={deletingId === webhook.id}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <PayloadFormat />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">How Webhooks Work</h2>
          <Card className="p-8 space-y-6">


            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              <div className="p-6 rounded-3xl bg-foreground/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Real-time</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Instant payment notifications for every link under this creator wallet.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-foreground/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Secure</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Validate the request with `x-kloak-signature` when you set a secret.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-foreground/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Delivery Logs</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each delivery attempt is stored so you can see the latest status per endpoint.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
