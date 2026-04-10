"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"
import {
    Briefcase,
    Building2,
    CheckCircle2,
    Copy,
    Globe,
    Heart,
    Infinity,
    Loader2,
    Receipt,
    Share2,
    ShoppingBag,
    SlidersHorizontal,
    X,
    Zap,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
    getPaymentLinkTemplate,
    PAYMENT_LINK_TEMPLATES,
    PAYMENT_LINK_TEMPLATE_TO_DB,
    type PaymentLinkTemplateId,
} from "@/features/payment-links/lib/templates"

type CreateStatus = "idle" | "signing" | "proving" | "broadcasting" | "finalizing" | "saving"
type FormStep = 1 | 2 | 3

const TOKEN_TO_ASSET: Record<string, string> = {
    ALEO: "0u8",
    USDCX: "1u8",
    USAD: "2u8",
}

const FORM_STEPS: Array<{ id: FormStep; label: string; description: string }> = [
    { id: 1, label: "Template", description: "Pick the kind of link you want to create." },
    { id: 2, label: "Details", description: "Add the payment details people will see." },
    { id: 3, label: "Settings", description: "Choose what happens after payment and how the link behaves." },
]

const EXPIRY_OPTIONS = [
    {
        label: "Quick payment",
        icon: Zap,
        items: [
            { value: "15m", label: "15 minutes" },
            { value: "30m", label: "30 minutes" },
            { value: "1h", label: "1 hour", pro: true },
        ],
    },
    {
        label: "Standard",
        icon: Receipt,
        items: [
            { value: "24h", label: "24 hours" },
            { value: "3d", label: "3 days" },
            { value: "7d", label: "7 days" },
        ],
    },
    {
        label: "Business",
        icon: Building2,
        items: [
            { value: "14d", label: "14 days", pro: true },
            { value: "30d", label: "30 days", pro: true },
        ],
    },
    {
        label: "Advanced",
        icon: Infinity,
        items: [{ value: "never", label: "No expiry", pro: true }],
    },
]

const TEMPLATE_ICONS = {
    invoice: Receipt,
    freelance: Briefcase,
    "tip-jar": Heart,
    checkout: ShoppingBag,
    custom: SlidersHorizontal,
} satisfies Record<PaymentLinkTemplateId, typeof Receipt>

export default function CreateLinkForm() {
    const [loading, setLoading] = useState(false)
    const { address, connected, executeTransaction, transactionStatus } = useWallet()

    const [txId, setTxId] = useState<string | null>(null)
    const [successOpen, setSuccessOpen] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [generatedLink, setGeneratedLink] = useState("")
    const [status, setStatus] = useState<CreateStatus>("idle")

    const [templateId, setTemplateId] = useState<PaymentLinkTemplateId | null>(null)
    const [currentStep, setCurrentStep] = useState<FormStep>(1)
    const [previewOpen, setPreviewOpen] = useState(true)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("0.1")
    const [token, setToken] = useState("ALEO")
    const [allowCustomAmount, setAllowCustomAmount] = useState(false)
    const [maxPayments, setMaxPayments] = useState("")
    const [expiration, setExpiration] = useState("24h")
    const [successMessage, setSuccessMessage] = useState("")
    const [redirectUrl, setRedirectUrl] = useState("")
    const [suggestedAmountsInput, setSuggestedAmountsInput] = useState("5, 10, 25")

    const selectedTemplate = getPaymentLinkTemplate(templateId ?? "custom")
    const isAmountValid = allowCustomAmount || Number(amount) > 0
    const isBasicsValid = title.trim().length > 0 && isAmountValid
    const isRedirectRequired = selectedTemplate.id === "checkout"
    const isRedirectValid =
        !redirectUrl.trim() ||
        (() => {
            try {
                const value = new URL(redirectUrl.trim())
                return value.protocol === "http:" || value.protocol === "https:"
            } catch {
                return false
            }
        })()
    const isSettingsValid = !isRedirectRequired || redirectUrl.trim().length > 0

    const previewDescription =
        description ||
        selectedTemplate.suggestedDescription ||
        "Add a short description so people know what they are paying for."
    const previewAmount = allowCustomAmount ? "Enter amount" : amount || "0.00"
    const previewLink = useMemo(() => {
        const suffix = title.trim()
            ? title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 12)
            : "preview"
        return `kloak.vercel.app/pay/${suffix || "preview"}`
    }, [title])

    function applyTemplate(nextTemplateId: PaymentLinkTemplateId) {
        const template = getPaymentLinkTemplate(nextTemplateId)
        setTemplateId(nextTemplateId)
        setAllowCustomAmount(template.defaultAllowCustomAmount)
        setExpiration(template.defaultExpiration)
        setFormError(null)

        if (nextTemplateId === "tip-jar") {
            setSuggestedAmountsInput("5, 10, 25")
        }
    }

    function computeExpiration() {
        if (expiration === "never") return null

        const now = new Date()
        const map: Record<string, number> = {
            "15m": 15 * 60,
            "30m": 30 * 60,
            "1h": 60 * 60,
            "24h": 24 * 60 * 60,
            "3d": 3 * 24 * 60 * 60,
            "7d": 7 * 24 * 60 * 60,
            "14d": 14 * 24 * 60 * 60,
            "30d": 30 * 24 * 60 * 60,
        }

        const secondsToAdd = map[expiration]
        if (!secondsToAdd) return null
        return new Date(now.getTime() + secondsToAdd * 1000)
    }

    function parseSuggestedAmounts() {
        if (selectedTemplate.id !== "tip-jar" || !allowCustomAmount) {
            return null
        }

        const parsed = suggestedAmountsInput
            .split(",")
            .map((value) => Number(value.trim()))
            .filter((value) => Number.isFinite(value) && value > 0)

        return parsed.length > 0 ? parsed.slice(0, 5) : null
    }

    function validateCurrentStep(step: FormStep) {
        if (step === 1 && !templateId) {
            setFormError("Choose a starting point so we can shape the rest of the form around it.")
            return false
        }

        if (step === 2) {
            if (!title.trim()) {
                setFormError("Add a title so people know what this payment is for.")
                return false
            }

            if (!isAmountValid) {
                setFormError("Enter a valid amount, or turn on custom amount if people should choose it themselves.")
                return false
            }
        }

        if (step === 3) {
            if (isRedirectRequired && !redirectUrl.trim()) {
                setFormError("Add a redirect URL so checkout buyers can return to your website after payment.")
                return false
            }

            if (redirectUrl.trim() && !isRedirectValid) {
                setFormError("Enter a full URL that starts with http:// or https://.")
                return false
            }
        }

        setFormError(null)
        return true
    }

    function goToNextStep() {
        if (!validateCurrentStep(currentStep)) return
        setCurrentStep((currentStep + 1) as FormStep)
    }

    function goToPreviousStep() {
        setFormError(null)
        setCurrentStep((currentStep - 1) as FormStep)
    }

    const getButtonLabel = () => {
        switch (status) {
            case "signing":
                return "Check wallet..."
            case "proving":
                return "Generating proof..."
            case "broadcasting":
                return "Broadcasting..."
            case "finalizing":
                return "Waiting for finality..."
            case "saving":
                return "Saving link..."
            default:
                return "Generate payment link"
        }
    }

    async function handleCreateLink() {
        if (!validateCurrentStep(3) || !isBasicsValid || loading || !connected) return

        setLoading(true)
        setFormError(null)

        try {
            const { Field } = await import("@provablehq/sdk")
            const requestId = Field.random().toString()
            setStatus("signing")

            const txPromise = executeTransaction({
                program: "kloak_protocol_v10.aleo",
                function: "create_payment_request",
                inputs: [
                    requestId,
                    TOKEN_TO_ASSET[token],
                    `${allowCustomAmount ? 0 : Math.floor(Number(amount) * 1_000_000)}u64`,
                    allowCustomAmount ? "true" : "false",
                ],
                privateFee: false,
            })

            const provingTimer = setTimeout(() => setStatus("proving"), 2000)
            const result = await txPromise
            clearTimeout(provingTimer)

            if (!result?.transactionId) throw new Error("Transaction rejected")

            let currentTxId = result.transactionId
            setTxId(currentTxId)
            setStatus("broadcasting")

            const finalStates = ["Finalized", "Accepted", "Completed"]
            let finalized = false

            while (!finalized) {
                const res = await transactionStatus(currentTxId)
                const onChainId = res.transactionId

                if (onChainId && onChainId !== currentTxId) {
                    currentTxId = onChainId
                    setTxId(onChainId)
                }

                setStatus("finalizing")

                if (finalStates.includes(res.status)) {
                    finalized = true
                }

                if (res.status === "Failed" || res.status === "Rejected") {
                    throw new Error("Transaction failed")
                }

                await new Promise((resolve) => setTimeout(resolve, 3000))
            }

            setStatus("saving")
            const res = await fetch("/api/payment-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    creatorAddress: address,
                    requestId,
                    title,
                    description,
                    amount: allowCustomAmount ? null : Number(amount),
                    token,
                    template: PAYMENT_LINK_TEMPLATE_TO_DB[selectedTemplate.id],
                    successMessage: successMessage.trim() || null,
                    redirectUrl: redirectUrl.trim() || null,
                    suggestedAmounts: parseSuggestedAmounts(),
                    allowCustomAmount,
                    maxPayments: maxPayments ? Number(maxPayments) : null,
                    expiresAt: computeExpiration(),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "We couldn't save this request after the wallet transaction finished.")
            }

            if (!data?.id) {
                throw new Error("The request was created on-chain, but Kloak did not return a usable link yet.")
            }

            setGeneratedLink(`${window.location.origin}/pay/${data.id}`)
            setSuccessOpen(true)
            setStatus("idle")
        } catch (err) {
            console.error(err)
            setFormError(err instanceof Error ? err.message : "We couldn't create this request. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="grid gap-1 md:grid-cols-3 rounded-full p-6 ">
                {FORM_STEPS.map((step) => {
                    const active = currentStep === step.id
                    const complete = currentStep > step.id

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                " transition-colors ",
                                active ? "" : " ",
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-full  text-[11px] font-semibold",
                                        complete
                                            ? " bg-primary/10 text-primary"
                                            : active
                                                ? " bg-primary/10 text-primary"
                                                : "bg-foreground/5 text-muted-foreground",
                                    )}
                                >
                                    {complete ? "OK" : step.id}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start">

                <Card className="min-w-0 flex-1">
                    <CardHeader className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-1">
                                <CardDescription className="text-xs text-muted-foreground/70">
                                    Step {currentStep} of {FORM_STEPS.length}
                                </CardDescription>
                                <p className="max-w-xl text-sm text-muted-foreground">
                                    Build the link in a few smaller steps so you can focus on one choice at a time.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setPreviewOpen((open) => !open)}
                            >
                                {previewOpen ? "Hide preview" : "Show preview"}
                            </Button>
                        </div>


                    </CardHeader>

                    <CardContent className="space-y-6">
                        {formError ? (
                            <Alert variant="destructive">
                                <AlertDescription className="text-sm leading-6">{formError}</AlertDescription>
                            </Alert>
                        ) : null}

                        {currentStep === 1 ? (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <Label>Choose a template</Label>
                                    <p className="text-xs text-muted-foreground ml-2">
                                        Pick the flow that feels closest. You can still change all the details after this.
                                    </p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {PAYMENT_LINK_TEMPLATES.map((template) => {
                                        const Icon = TEMPLATE_ICONS[template.id]
                                        const active = templateId === template.id

                                        return (
                                            <button
                                                key={template.id}
                                                type="button"
                                                onClick={() => applyTemplate(template.id)}
                                                className={cn(
                                                    "rounded-[1.5rem] border  p-4 text-left transition-all",
                                                    active
                                                        ? "border-transparent bg-primary/8"
                                                        : " bg-black/10 hover:border-foreground/15 hover:bg-foreground/5",
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={cn(
                                                            "rounded-2xl  p-2.5",
                                                            active
                                                                ? " bg-primary/10 text-primary"
                                                                : " bg-black/20 text-muted-foreground",
                                                        )}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-foreground">{template.label}</div>
                                                        <p className="text-xs leading-5 text-muted-foreground">{template.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={goToNextStep} disabled={!templateId}>
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        ) : null}

                        {currentStep === 2 ? (
                            <div className="space-y-6 min-w-2xl">
                                <div className="flex items-center justify-between rounded-full border border-foreground/8 bg-black/10 p-2 pl-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Selected template</p>
                                        <p className="text-sm font-medium text-foreground">{selectedTemplate.label}</p>
                                    </div>
                                    <Button variant="secondary" type="button" onClick={() => setCurrentStep(1)}>
                                        Change template
                                    </Button>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-[1fr_180px] items-center">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <Label>Title *</Label>
                                            <Input
                                                placeholder={selectedTemplate.suggestedTitle || "Enter a title"}
                                                value={title}
                                                onChange={(event) => setTitle(event.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Description</Label>
                                            <Textarea
                                                placeholder={selectedTemplate.suggestedDescription || "Add a short description"}
                                                value={description}
                                                onChange={(event) => setDescription(event.target.value)}
                                                className="h-28 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-[1.5rem] h-fit border-dotted border bg-black/10 p-4 ">
                                        <Label className="text-xs ml-0 text-muted-foreground">Popular Use Cases</Label>
                                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{selectedTemplate.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label>Amount *</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            type="number"
                                            placeholder={allowCustomAmount ? "Amount chosen by payer" : "0.00"}
                                            min="0.1"
                                            value={amount}
                                            disabled={allowCustomAmount}
                                            onChange={(event) => {
                                                const value = event.target.value
                                                if (Number(value) < 0) return
                                                setAmount(value)
                                            }}
                                        />

                                        <Select value={token} onValueChange={setToken}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALEO">ALEO</SelectItem>
                                                <SelectItem value="USDCX">USDCx</SelectItem>
                                                <SelectItem value="USAD">USAD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedTemplate.id === "tip-jar"
                                            ? "Tip links work best with custom amount turned on in the next step."
                                            : "Use a fixed amount unless the payer should choose the amount themselves."}
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="outline" type="button" onClick={goToPreviousStep}>

                                        Back
                                    </Button>
                                    <Button type="button" onClick={goToNextStep}>
                                        Continue

                                    </Button>
                                </div>
                            </div>
                        ) : null}

                        {currentStep === 3 ? (
                            <div className="space-y-6">
                                <div className="flex flex-col gap-6">
                                    <div className="space-y-1">
                                        <Label className="text-primary">Payment settings</Label>
                                        <p className="text-xs text-muted-foreground ml-2">
                                            Choose how flexible the link is once people open it.
                                        </p>
                                    </div>
                                    <div className="space-y-6 rounded-[1.5rem] border border-foreground/8 bg-black/10 p-5">


                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Allow custom amount</Label>
                                                <p className="ml-2 text-xs text-muted-foreground">
                                                    Let people choose their own amount instead of paying a fixed one.
                                                </p>
                                            </div>
                                            <Switch checked={allowCustomAmount} onCheckedChange={setAllowCustomAmount} />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="space-y-1 w-1/2">
                                                <Label>Max payments</Label>
                                                <Input
                                                    min="0"
                                                    type="number"
                                                    placeholder="Unlimited"
                                                    value={maxPayments}
                                                    onChange={(event) => {
                                                        const value = event.target.value
                                                        if (Number(value) < 0) return
                                                        setMaxPayments(value)
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-1 w-1/2">
                                                <Label>Link expiration</Label>
                                                <Select value={expiration} onValueChange={setExpiration}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select expiration" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EXPIRY_OPTIONS.map((group) => {
                                                            const Icon = group.icon

                                                            return (
                                                                <div key={group.label} className="p-4">
                                                                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <Icon className="h-3.5 w-3.5" />
                                                                        <span>{group.label}</span>
                                                                    </div>

                                                                    {group.items.map((item) => (
                                                                        <SelectItem key={item.value} value={item.value} className="flex items-center justify-between">
                                                                            <span>{item.label}</span>
                                                                            {item.pro ? (
                                                                                <span className="ml-2 rounded-full bg-linear-to-br from-purple-600 to-rose-600 px-2 py-0.5 text-xs font-medium">
                                                                                    PRO
                                                                                </span>
                                                                            ) : null}
                                                                        </SelectItem>
                                                                    ))}
                                                                </div>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {selectedTemplate.id === "tip-jar" && allowCustomAmount ? (
                                            <div className="space-y-1">
                                                <Label>Suggested amounts</Label>
                                                <Input
                                                    placeholder="5, 10, 25"
                                                    value={suggestedAmountsInput}
                                                    onChange={(event) => setSuggestedAmountsInput(event.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground ">
                                                    Add a few quick choices to make it easier for supporters to pick an amount.
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-primary">After payment</Label>
                                        <p className="text-xs text-muted-foreground ml-2">
                                            Decide what people see next after their payment goes through.
                                        </p>
                                    </div>
                                    <div className="space-y-6 rounded-[1.5rem] border border-foreground/8 bg-black/10 p-5">


                                        <div className="space-y-1">
                                            <Label>Success message</Label>
                                            <Textarea
                                                placeholder="Thanks for your payment."
                                                value={successMessage}
                                                onChange={(event) => setSuccessMessage(event.target.value)}
                                                className="h-24 resize-none"
                                            />
                                            <p className="text-xs text-muted-foreground ml-2">
                                                Optional. A short message shown on the success screen.
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <Label>
                                                Redirect URL
                                                {isRedirectRequired ? <span className="ml-1 text-destructive">*</span> : null}
                                            </Label>
                                            <Input
                                                placeholder={selectedTemplate.id === "checkout" ? "https://yourstore.com/thank-you" : "https://yourapp.com/next-step"}
                                                value={redirectUrl}
                                                onChange={(event) => setRedirectUrl(event.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground ml-2">
                                                {selectedTemplate.id === "checkout"
                                                    ? "After a successful checkout, buyers will be sent back to this page automatically."
                                                    : "Optional. Send people to a thank-you page, order page, or next step after payment."}
                                            </p>
                                            {redirectUrl.trim() && !isRedirectValid ? (
                                                <p className="text-xs text-destructive">Enter a full URL that starts with http:// or https://.</p>
                                            ) : null}
                                        </div>

                                        <div className="rounded-[1.25rem] border border-foreground/8 bg-black/20 p-4">
                                            <p className="text-xs text-muted-foreground">Summary</p>
                                            <div className="mt-3 space-y-2 text-sm text-foreground">
                                                <p>{allowCustomAmount ? "Payer chooses the amount" : `Fixed amount in ${token}`}</p>
                                                <p>
                                                    {expiration === "never"
                                                        ? "No expiry"
                                                        : `Expires in ${EXPIRY_OPTIONS.flatMap((group) => group.items).find((item) => item.value === expiration)?.label ?? expiration}`}
                                                </p>
                                                <p>{maxPayments ? `Stops after ${maxPayments} payments` : "No payment cap"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <Button variant="outline" type="button" onClick={goToPreviousStep}>
                                        Back
                                    </Button>

                                    <Button
                                        onClick={handleCreateLink}
                                        disabled={!isBasicsValid || !isSettingsValid || !isRedirectValid || loading}
                                        className="w-full sm:w-auto"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>{getButtonLabel()}</span>
                                            </div>
                                        ) : (
                                            "Generate payment link"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <div
                    className={cn(
                        "min-w-0 overflow-hidden transition-all duration-300 ease-out xl:sticky xl:top-28",
                        previewOpen
                            ? "max-h-[1200px] opacity-100 xl:w-[380px] xl:translate-x-0"
                            : "pointer-events-none max-h-0 opacity-0 xl:w-0 xl:translate-x-8",
                    )}
                >
                    <div className="space-y-3 rounded-[2rem]  p-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Live preview</Label>
                            <button
                                type="button"
                                onClick={() => setPreviewOpen(false)}
                                className="rounded-full border border-foreground/8 p-1 text-muted-foreground transition hover:border-foreground/15 hover:text-foreground"
                                aria-label="Hide preview"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="rounded-[2rem] border border-foreground/8 bg-foreground/5 p-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Image src="/kloak_logo.png" alt="Kloak" height={36} width={36} priority className="rounded-full object-cover" />
                                        <div className="flex flex-col">
                                            <span className="text-sm">Kloak</span>
                                            <span className="text-xs opacity-50">Powered by Aleo</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-40">
                                        <div className="h-2 w-2 rounded-full bg-foreground" />
                                        <div className="h-2 w-2 rounded-full bg-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{selectedTemplate.label}</p>
                                    <h3 className="truncate text-xl font-bold leading-tight">{title || "Untitled payment link"}</h3>
                                    <p className="line-clamp-3 text-sm text-muted-foreground">{previewDescription}</p>
                                </div>

                                <div className="border-t border-dashed border-foreground/20" />

                                <div className="space-y-3">
                                    <span className="block text-xs text-muted-foreground">{selectedTemplate.previewAmountLabel}</span>
                                    <div className="text-3xl font-bold tracking-tight">
                                        {previewAmount}
                                        <span className="ml-2 text-sm font-medium uppercase text-muted-foreground">{token}</span>
                                    </div>

                                    {selectedTemplate.id === "tip-jar" && allowCustomAmount && parseSuggestedAmounts()?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {parseSuggestedAmounts()?.map((suggestedAmount) => (
                                                <div key={suggestedAmount} className="rounded-full border border-foreground/10 bg-black/30 px-3 py-1.5 text-xs text-muted-foreground">
                                                    {suggestedAmount} {token}
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="w-full rounded-full bg-foreground px-4 py-3 text-center font-bold text-background">
                                    {selectedTemplate.previewButtonLabel}
                                </div>

                                {redirectUrl.trim() ? (
                                    <div className="rounded-[1.25rem] border border-foreground/8 bg-black/30 p-3">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">After payment</p>
                                        <p className="mt-2 text-xs text-foreground">Redirect to {redirectUrl.trim()}</p>
                                    </div>
                                ) : null}

                                <div className="flex items-center justify-center gap-1.5 opacity-40">
                                    <Globe className="h-3 w-3" />
                                    <span className="text-[10px] font-mono tracking-tight">{previewLink}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
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
                            <Button
                                className="flex-1"
                                variant="secondary"
                                onClick={() => navigator.clipboard.writeText(generatedLink)}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy link
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
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}
