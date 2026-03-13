"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

import { Copy, Share2, CheckCircle2 } from "lucide-react"
import { ChevronDown, ChevronUp, Globe, Loader2 } from "lucide-react"

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"

type CreateStatus = "idle" | "signing" | "proving" | "broadcasting" | "finalizing" | "saving";

export default function CreateLinkForm() {
    const [loading, setLoading] = useState(false)
    const { address, connected, executeTransaction, transactionStatus } = useWallet()
    const [txId, setTxId] = useState<string | null>(null)
    const [successOpen, setSuccessOpen] = useState(false)
    const [generatedLink, setGeneratedLink] = useState("")
    const [status, setStatus] = useState<CreateStatus>("idle");
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("0.1")
    const [token, setToken] = useState("ALEO")

    const [allowCustomAmount, setAllowCustomAmount] = useState(false)

    const [showAdvanced, setShowAdvanced] = useState(false)
    const [maxPayments, setMaxPayments] = useState("")
    const [expiration, setExpiration] = useState("never")

    const isFormValid =
        title.trim().length > 0 &&
        (allowCustomAmount || Number(amount) > 0)

    function computeExpiration() {
        if (expiration === "never") return null

        const now = new Date()

        if (expiration === "24h") {
            now.setHours(now.getHours() + 24)
            return now
        }

        if (expiration === "7d") {
            now.setDate(now.getDate() + 7)
            return now
        }

        return null
    }


    const getButtonLabel = () => {
        switch (status) {
            case "signing": return "Check Wallet...";
            case "proving": return "Generating ZK Proof...";
            case "broadcasting": return "Broadcasting to Aleo...";
            case "finalizing": return "Waiting for Finality...";
            case "saving": return "Generating Link...";
            default: return "Generate Payment Link";
        }
    };

    async function handleCreateLink() {
        if (!isFormValid || loading || !connected) return

        setLoading(true)

        try {
            /* 1️⃣ generate request id */
            const { Field } = await import("@provablehq/sdk");
            const requestId = Field.random().toString()
            setStatus("signing");

            /* 2️⃣ execute on-chain request creation */

            /* 2️⃣ Execution & Proving */
            const txPromise = executeTransaction({
                program: "kloak_protocol_v5.aleo",
                function: "create_payment_request",
                inputs: [
                    requestId,
                    token === "ALEO" ? "0u8" : "1u8",
                    `${allowCustomAmount ? 0 : Math.floor(Number(amount) * 1_000_000)}u64`,
                    allowCustomAmount ? "true" : "false"
                ],
                privateFee: false
            });

            // After 2s, if it's still running, we're in the ZK proof generation phase
            const provingTimer = setTimeout(() => setStatus("proving"), 2000);

            const result = await txPromise;
            clearTimeout(provingTimer);

            if (!result?.transactionId) throw new Error("Transaction rejected");

            // This might be the temporary 'shield_...' ID
            let currentTxId = result.transactionId;
            setTxId(currentTxId);

            /* 3️⃣ Network Wait */
            setStatus("broadcasting");

            const finalStates = ["Finalized", "Accepted", "Completed"]
            let finalized = false

            while (!finalized) {
                const res = await transactionStatus(currentTxId)

                // --- ID UPGRADE LOGIC ---
                // Extract the at1... ID if the wallet initially gave us a shield_... ID
                const onChainId = res.transactionId;
                if (onChainId && onChainId !== currentTxId) {
                    console.log("Upgrading to real TxID:", onChainId);
                    currentTxId = onChainId; // Update local variable for next poll
                    setTxId(onChainId);      // Update state for UI/Explorer links
                }
                // -------------------------

                setStatus("finalizing");
                if (finalStates.includes(res.status)) {
                    finalized = true
                }

                if (res.status === "Failed" || res.status === "Rejected") {
                    throw new Error("Transaction failed")
                }

                await new Promise((r) => setTimeout(r, 3000))
            }

            /* 4️⃣ store link in DB */
            setStatus("saving");
            const res = await fetch("/api/payment-links", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    creatorAddress: address,
                    requestId,
                    title,
                    description,
                    amount: allowCustomAmount ? null : Number(amount),
                    token,
                    allowCustomAmount,
                    maxPayments: maxPayments ? Number(maxPayments) : null,
                    expiresAt: computeExpiration(),
                }),
            })

            const data = await res.json()

            const link = `${window.location.origin}/pay/${data.id}`

            setGeneratedLink(link);
            setSuccessOpen(true);
            setStatus("idle");

        } catch (err) {
            console.error(err)
            alert("Failed to create payment link")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* FORM */}
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardDescription className="text-xs">
                        Configure your payment details and share the link with your clients.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                            placeholder="Freelance Design Services"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Add details about the service..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="resize-none h-24"
                        />
                    </div>

                    {/* Amount */}
                    <div className="p-4 rounded-xl bg-zinc-500/10 space-y-4">

                        <Label className="text-muted-foreground uppercase text-[10px] tracking-widest">
                            Enter Amount
                        </Label>

                        <div className="flex gap-3">
                            <Input
                                type="number"
                                placeholder="0.00"
                                min="0.1"
                                value={amount}
                                disabled={allowCustomAmount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Prevent manual entry of negative numbers
                                    if (Number(val) < 0) return;
                                    setAmount(val);
                                }}
                            />

                            <Select value={token} onValueChange={setToken}>
                                <SelectTrigger className="w-40"> {/* Widened slightly to fit text */}
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="ALEO">ALEO</SelectItem>

                                    {/* USDCx is visible but unclickable */}
                                    <SelectItem value="USDCX" disabled>
                                        <div className="flex flex-col">
                                            <span className="opacity-50">USDCx</span>
                                            <span className="text-[10px] text-primary font-medium leading-none mt-1">
                                                Coming Soon
                                            </span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <Label className="text-sm">Allow custom amount</Label>
                                <p className="text-xs text-muted-foreground ml-2">
                                    Customers can pay what they want
                                </p>
                            </div>

                            <Switch
                                checked={allowCustomAmount}
                                onCheckedChange={setAllowCustomAmount}
                            />
                        </div>
                    </div>

                    {/* Advanced */}
                    <div
                        className="flex justify-between ml-2 cursor-pointer"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <span className="text-sm font-medium">Advanced Configuration</span>
                        {showAdvanced ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {showAdvanced && (
                        <div className="space-y-4 p-4 border rounded-xl">

                            <div className="space-y-2">
                                <Label>Max Payments</Label>
                                <Input
                                    min="0"
                                    type="number"
                                    placeholder="Unlimited"
                                    value={maxPayments}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Prevent manual entry of negative numbers
                                        if (Number(val) < 0) return;
                                        setMaxPayments(val);
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Link Expiration</Label>

                                <Select value={expiration} onValueChange={setExpiration}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="never">Never</SelectItem>
                                        <SelectItem value="24h">24 hours</SelectItem>
                                        <SelectItem value="7d">7 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        onClick={handleCreateLink}
                        disabled={!isFormValid || loading}
                        className="w-full "
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                <span className="animate-in fade-in slide-in-from-bottom-1">
                                    {getButtonLabel()}
                                </span>
                            </div>
                        ) : (
                            "Generate Payment Link"
                        )}
                    </Button>

                </CardContent>
            </Card>

            <div className="lg:col-span-2 relative">
                <div className="sticky top-32 space-y-1 flex flex-col justify-center items-center">
                    <Label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Live Preview</Label>
                    <div className=" w-full  mx-auto bg-zinc-500/10 border rounded-[2.5rem] p-6 flex flex-col justify-between overflow-hidden relative ">
                        <div className="space-y-6"> {/* Fake Mobile Header */}
                            <div className="flex justify-between items-center ">
                                <div className="flex gap-3 items-center">
                                    <Image src="/kloak_logo.png" alt="Aurora background" height={36} width={36} priority className="object-cover rounded-full" /> <div className="flex flex-col"> <span className="text-sm">Kloak</span> <span className="text-xs opacity-50">Powered by Aleo</span></div></div> <div className="flex gap-1 opacity-40"> <div className="h-2 w-2 rounded-full bg-foreground" /> <div className="h-2 w-2 rounded-full bg-foreground" /> </div> </div> <div className="mt-12"> <h3 className="text-xl font-bold truncate leading-tight"> {title || "Untitled Link"} </h3> <p className="text-sm text-muted-foreground mt-2 line-clamp-3"> {description || "No description provided."} </p> </div> <div className="border-t border-dashed border-white/30 "></div> <div className=""> <div className=""> <span className="text-xs text-muted-foreground block mb-1">Total to pay</span> <div className="text-3xl font-bold tracking-tight"> {allowCustomAmount ? "—" : amount || "0.00"} <span className="text-sm ml-2 font-medium text-muted-foreground uppercase">{token}</span> </div> </div> <div className="w-full h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold mt-6"> Pay Now </div> <div className="flex items-center justify-center gap-1.5 opacity-40 mt-6"> <Globe className="h-3 w-3" /> <span className="text-[10px] font-mono tracking-tight">kloak.vercel.app/pay/preview123</span> </div> </div> </div> </div> </div> </div>

            {/* SUCCESS MODAL */}
            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <DialogContent className="sm:max-w-md">

                    <DialogHeader className="items-center text-center">
                        <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                        <DialogTitle>Payment Link Created</DialogTitle>
                        <DialogDescription>
                            Share this link with your client to receive payment.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Payment Link */}

                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Payment Link</p>
                        <Input className="pr-16 truncate" value={generatedLink} readOnly />
                    </div>

                    {/* Transaction ID */}

                    {txId && (
                        <div className="space-y-2">

                            <p className="text-xs text-muted-foreground">
                                Transaction ID
                            </p>

                            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted/20">

                                <span className="text-xs font-mono flex-1 truncate">
                                    {txId?.slice(0, 8)}...{txId?.slice(-6)}
                                </span>

                                <button
                                    onClick={() => navigator.clipboard.writeText(txId)}
                                    className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                                >
                                    Copy
                                </button>

                            </div>

                        </div>
                    )}

                    {/* Actions */}

                    <div className="flex gap-4 pt-2">

                        <Button
                            className="flex-1"
                            variant="secondary"
                            onClick={() => navigator.clipboard.writeText(generatedLink)}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
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