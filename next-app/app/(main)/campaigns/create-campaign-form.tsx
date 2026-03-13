"use client"

import { useState } from "react"
import {
  Card, CardContent, CardHeader, CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  ChevronDown, ChevronUp, Upload,
  Loader2, Database, Wallet, AlertCircle, FileText, Download, XCircle
} from "lucide-react";
import { Copy, Share2, CheckCircle2, Check } from "lucide-react"

import { useCreateCampaign } from "@/hooks/use-create-campaign"
import { useFundCampaign } from "@/hooks/use-fund-campaign"

import CampaignCreationStepper from "./components/CampaignCreationStepper"
import { useRouter } from "next/navigation"

type CampaignStatus = "idle" | "calculating" | "registering" | "funding" | "completed";

type Status =
  | "idle"
  | "calculating"
  | "registering"
  | "finalizing_create"
  | "funding"
  | "finalizing_fund"
  | "completed"
  | "error"

interface CsvRow {
  address: string;
  amount: number;
  isValid: boolean;
  error?: string;
}

export default function CreateCampaignForm() {
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [asset, setAsset] = useState("aleo");
  const router = useRouter()
  // Data State
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [recipients, setRecipients] = useState(0);
  const [budget, setBudget] = useState(0);

  // Logic State
  const [status, setStatus] = useState<CampaignStatus>("idle");
  const [successOpen, setSuccessOpen] = useState(false);

  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [createTxId, setCreateTxId] = useState<string | null>(null)
  const [fundTxId, setFundTxId] = useState<string | null>(null)
  const [generatedLink, setGeneratedLink] = useState("")

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const {
    createCampaign,
    status: createStatus,
    error: createError
  } = useCreateCampaign()

  const {
    fundCampaign,
    status: fundStatus,
    error: fundError
  } = useFundCampaign()

  // UX Pattern A: Template Downloader
  const downloadTemplate = () => {
    const content = "address,amount\naleo1sh9bfzc7l6kzts06y... , 50\naleo166qw66u... , 125.5";
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kloak_template.csv";
    a.click();
  };

  // UX Pattern B: Header-Agnostic Parser
  const handleCSVUpload = async (file: File) => {
    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return;

    const headers = lines[0].toLowerCase().split(",");

    // Smart Index Detection
    const addrIdx = headers.findIndex(h => h.includes("address") || h.includes("wallet") || h.includes("recipient"));
    const amtIdx = headers.findIndex(h => h.includes("amount") || h.includes("payout") || h.includes("value") || h.includes("credits"));

    const finalAddrIdx = addrIdx !== -1 ? addrIdx : 0;
    const finalAmtIdx = amtIdx !== -1 ? amtIdx : 1;

    let total = 0;
    const parsed = lines.slice(1).map((line) => {
      const parts = line.split(",");
      const rawAddr = parts[finalAddrIdx]?.trim() || "";

      // Convert 0.1 ALEO string to 100,000 u64 number immediately
      const rawAmtHuman = parseFloat(parts[finalAmtIdx]?.trim()) || 0;
      const payoutMicro = Math.round(rawAmtHuman * 1_000_000);

      const isValid = rawAddr.startsWith("aleo1") && rawAddr.length === 63;
      if (isValid) total += payoutMicro; // Budget is now in microcredits

      return {
        address: rawAddr,
        amount: payoutMicro, // Store the integer 100000 here
        isValid,
        error: !isValid ? "Invalid Aleo Address" : undefined
      };
    });

    setCsvRows(parsed);
    setRecipients(parsed.filter(r => r.isValid).length);
    setBudget(total); // Budget is now e.g. 400,000

    setCsvRows(parsed);
    setRecipients(parsed.filter(r => r.isValid).length);
    setBudget(total);
  };

  const handleCreateCampaign = async () => {
    if (recipients === 0 || budget <= 0) return

    const validRows = csvRows.filter(r => r.isValid)

    try {

      /* ---------- CREATE CAMPAIGN ---------- */

      const createResult = await createCampaign({
        name,
        description,
        asset: asset === "aleo" ? 0 : 1,
        rows: validRows
      })

      setCampaignId(createResult.campaignId)
      setCreateTxId(createResult.txId)

      /* ---------- FUND CAMPAIGN ---------- */

      const fundResult = await fundCampaign({
        campaignId: createResult.campaignId,
        amount: budget
      })
      console.log("campaign id:", campaignId)
      setFundTxId(fundResult.txId)

      /* ---------- SUCCESS ---------- */

      const link = `${window.location.origin}/claim/${createResult.campaignId}`

      setGeneratedLink(link);

      setSuccessOpen(true)

    } catch (error) {

      console.error("Campaign Creation Failed:", error)

    }
  }

  const unifiedStatus: Status = (() => {

    /* ---------- ERROR ---------- */

    if (createStatus === "error" || fundStatus === "error") {
      return "error"
    }

    /* ---------- CREATE PHASE ---------- */

    if (createStatus === "calculating") {
      return "calculating"
    }

    if (createStatus === "registering") {
      return "registering"
    }

    if (createStatus === "finalizing") {
      return "finalizing_create"
    }

    /* ---------- FUND PHASE ---------- */

    if (
      fundStatus === "signing" ||
      fundStatus === "broadcasting"
    ) {
      return "funding"
    }

    if (fundStatus === "finalizing") {
      return "finalizing_fund"
    }

    if (fundStatus === "completed") {
      return "completed"
    }

    return "idle"

  })()

  const claimLink = campaignId
    ? `${window.location.origin}/campaigns/${campaignId}/claim`
    : ""

  return (
    <div className="  justify-between flex p-">

      <div className="w-1/2">
        <Card>
          <CardHeader>
            <CardDescription className="text-xs">
              Create a private reward distribution recipients can claim using zero-knowledge proofs.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g. Privacy Hackathon Rewards"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50"
                  disabled={status !== "idle"}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the purpose of this campaign..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none bg-background/50 h-24"
                  disabled={status !== "idle"}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-500/10 space-y-4">
              <Label className="text-muted-foreground uppercase text-[10px] tracking-widest">
                Reward Asset
              </Label>
              <Select value={asset} onValueChange={setAsset} disabled={status !== "idle"}>
                <SelectTrigger className="bg-background w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aleo">ALEO</SelectItem>
                  <SelectItem value="usdcx" disabled>USDCx (Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CSV Section with Pattern A & C */}
            <div className="p-4 rounded-xl bg-zinc-500/10 space-y-4">
              <div className="flex justify-between items-end">
                <Label className="text-muted-foreground uppercase text-[10px] tracking-widest">
                  Distribution CSV
                </Label>
                <button
                  onClick={downloadTemplate}
                  className="text-[10px] text-primary flex items-center gap-1 hover:underline"
                >
                  <Download className="h-3 w-3" /> Download Template
                </button>
              </div>

              <div className="border border-dashed rounded-xl p-6 text-center bg-background/30">
                <Upload className="h-6 w-6 mx-auto mb-2 opacity-60" />
                <p className="text-sm text-muted-foreground">Drop CSV here</p>
                <Input
                  type="file"
                  accept=".csv"
                  className="mt-4"
                  disabled={status !== "idle"}
                  onChange={(e) => e.target.files?.[0] && handleCSVUpload(e.target.files[0])}
                />
              </div>

              {/* UX Pattern C: Visual Validation Table */}
              {csvRows.length > 0 && (
                <div className="space-y-3">
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-white/5 bg-background/60">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-white/5 sticky top-0">
                        <tr>
                          <th className="p-2">Address</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className={`border-t border-white/5 ${!row.isValid ? "bg-red-500/10 text-red-400" : ""}`}>
                            <td className="p-2 font-mono truncate max-w-[120px]">
                              {row.address || "EMPTY"}
                            </td>
                            <td className="p-2 text-right font-mono">
                              {(Number(row.amount) / 1_000_000).toLocaleString(undefined, {
                                maximumFractionDigits: 6,
                              })} {asset.toUpperCase()}
                              {!row.isValid && <XCircle className="h-3 w-3 inline ml-1" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvRows.length > 5 && (
                      <p className="text-[9px] text-center py-1 opacity-50">
                        + {csvRows.length - 5} more recipients
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper & Button */}
            {status !== "idle" && status !== "completed" && (
              <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                <div className={`flex items-center gap-3 text-xs ${status === "registering" ? "text-primary font-bold" : "opacity-50"}`}>
                  <Database className={`h-4 w-4 ${status === "registering" ? "animate-spin" : ""}`} />
                  1. Register Metadata
                </div>
                <div className={`flex items-center gap-3 text-xs ${status === "funding" ? "text-primary font-bold" : "opacity-50"}`}>
                  <Wallet className={`h-4 w-4 ${status === "funding" ? "animate-bounce" : ""}`} />
                  2. Deposit   {(Number(budget) / 1_000_000).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })} {asset.toUpperCase()}
                </div>
              </div>
            )}

            {recipients > 0 && status === "idle" && (
              <div className="p-4 rounded-xl border bg-muted/30 space-y-4">

                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  Campaign Summary
                </p>

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign</span>
                    <span className="font-medium">{name || "Untitled Campaign"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipients</span>
                    <span className="font-medium">{recipients}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-medium">
                      {(Number(budget) / 1_000_000).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })} {asset.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merkle Tree Depth</span>
                    <span className="font-medium">10</span>
                  </div>

                </div>

                <div className="border-t border-dashed border-white/10 pt-3 space-y-2 text-xs text-muted-foreground">

                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 mt-[2px]" />
                    <span>
                      Ensure your wallet has at least <b>   {(Number(budget) / 1_000_000).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })} {asset.toUpperCase()}</b> in
                      private balance before launching the campaign.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 mt-[2px]" />
                    <span>
                      Campaign funds are deposited into the protocol escrow and cannot be
                      withdrawn once the campaign is funded.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 mt-[2px]" />
                    <span>
                      Only recipients with valid proofs will be able to claim rewards.
                    </span>
                  </div>

                </div>

              </div>
            )}

            <Button
              className="w-full h-12 text-md font-semibold"
              disabled={status !== "idle" || recipients === 0}
              onClick={handleCreateCampaign}
            >
              {status === "idle" &&
                `Create & Fund (${(Number(budget) / 1_000_000).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })} ${asset.toUpperCase()})`}
              {status !== "idle" && status !== "completed" && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Launching Campaign...
                </>
              )}

              {status === "completed" && (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Campaign Live
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6 sticky top-0 self-start">
        <CampaignCreationStepper
          status={unifiedStatus}
          errorMessage={createError || fundError}
        />

        <div className="text-xs text-muted-foreground space-y-2 max-w-xs">
          <p>• Distribution is secured with Aleo zero-knowledge proofs.</p>
          <p>• Recipient identities never appear on-chain.</p>
          <p>• Funds remain private during distribution.</p>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">

          {/* Header */}

          <DialogHeader className="items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-primary mb-2" />

            <DialogTitle>
              Campaign Successfully Launched
            </DialogTitle>

            <DialogDescription>
              Your private reward distribution is now live on the Aleo network.
            </DialogDescription>
          </DialogHeader>


          {/* Campaign Info */}

          <div className="space-y-3 bg-white/5 rounded-xl p-4 mt-4">

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Campaign</span>
              <span className="font-medium truncate max-w-40">
                {name || "Untitled Campaign"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recipients</span>
              <span className="font-medium">
                {recipients}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="font-medium">
                {budget} {asset.toUpperCase()}
              </span>
            </div>

          </div>


          {/* Creation Transaction */}

          {createTxId && (
            <div className="space-y-2">

              <p className="text-xs text-muted-foreground">
                Campaign Creation TX
              </p>

              <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted/20">

                <span className="text-xs font-mono flex-1 truncate">
                  {createTxId.slice(0, 8)}...{createTxId.slice(-6)}
                </span>

                <button
                  onClick={() => navigator.clipboard.writeText(createTxId)}
                  className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                >
                  Copy
                </button>

              </div>

            </div>
          )}


          {/* Funding Transaction */}

          {fundTxId && (
            <div className="space-y-2">

              <p className="text-xs text-muted-foreground">
                Funding Transaction
              </p>

              <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted/20">

                <span className="text-xs font-mono flex-1 truncate">
                  {fundTxId.slice(0, 8)}...{fundTxId.slice(-6)}
                </span>

                <button
                  onClick={() => navigator.clipboard.writeText(fundTxId)}
                  className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                >
                  Copy
                </button>

              </div>

            </div>
          )}

          {/* Claim Link */}

          <div className="space-y-2">
            <Input className="pr-16 truncate" value={generatedLink} readOnly />
          </div>

          {/* Actions */}

          <div className="flex gap-4 pt-2">

            <Button
              className="flex-1"
              variant="secondary"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              className="flex-1"
              onClick={() =>
                navigator.share?.({
                  title: "Payment Link",
                  url: generatedLink,
                })
              }
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

          </div>

        </DialogContent>
      </Dialog>
    </div>
  )
}