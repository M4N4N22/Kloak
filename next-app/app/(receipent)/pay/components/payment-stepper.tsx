"use client"

import { cn } from "@/lib/utils"

type Status =
    | "idle"
    | "scanning"
    | "consolidating"
    | "signing"
    | "pending" // Added to match the ZK proof generation phase
    | "broadcasting"
    | "finalized"
    | "error"

export default function PaymentStepper({
    status,
    compact = false,
    orientation = "vertical",
}: {
    status: Status
    compact?: boolean
    orientation?: "vertical" | "horizontal"
}) {
    // Mapping internal status to the 4 visual steps
    const currentStep =
        ["idle", "scanning", "consolidating"].includes(status)
            ? 1
            : status === "signing"
                ? 2
                : ["pending", "broadcasting"].includes(status)
                    ? 3
                    : status === "finalized"
                        ? 4
                        : 1

    const steps = [
        {
            n: 1,
            label: "Wallet Preparation",
            desc: status === "consolidating" ? "Merging small records..." : "Scanning private balance",
            done: ["signing", "pending", "broadcasting", "finalized"].includes(status),
        },
        {
            n: 2,
            label: "Transaction Signing",
            desc: "Authorize payment in wallet",
            done: ["pending", "broadcasting", "finalized"].includes(status),
        },
        {
            n: 3,
            label: "ZK Proof & Broadcast",
            desc: status === "pending" ? "Generating Zero-Knowledge proof" : "Submitting to Aleo Network",
            done: status === "finalized",
        },
        {
            n: 4,
            label: "Confirmation",
            desc: "Payment finalized on-chain",
            done: status === "finalized",
        },
    ]

    if (orientation === "horizontal") {
        return (
            <div className=" px-4 py-4 backdrop-blur-xl sm:px-6 bg-zinc-950/50 rounded-full sticky top-4 z-10 shadow-lg ">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {steps.map((s, index) => (
                        <div key={s.n} className="flex min-w-60 flex-1 items-center gap-3">
                            <div className="flex min-w- flex-1 items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500",
                                        status === "error" && currentStep === s.n
                                            ? "bg-red-500 text-foreground"
                                            : currentStep === s.n
                                                ? "bg-flagship-gradient text-primary-foreground ring-4 ring-primary/20"
                                                : s.done
                                                    ? "bg-flagship-gradient text-primary-foreground"
                                                    : "bg-foreground/10 text-foreground/50"
                                    )}
                                >
                                    {s.done ? "✓" : s.n}
                                </div>
                                <div className="min-w-60 ">
                                    <p
                                        className={cn(
                                            "text-xs font-bold transition-colors",
                                            currentStep === s.n ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {s.label}
                                    </p>
                                    <p
                                        className={cn(
                                            "mt-1 text-[11px] leading-5 transition-all",
                                            currentStep === s.n ? "text-primary/80 font-medium" : "text-muted-foreground"
                                        )}
                                    >
                                        {s.desc}
                                    </p>
                                </div>
                            </div>

                            {index < steps.length - 1 ? (
                                <div
                                    className={cn(
                                        "hidden h-px flex-1 lg:block",
                                        s.done ? "bg-flagship-gradient" : "bg-neutral-800"
                                    )}
                                />
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("space-y-8 max-w-xs", compact && "max-w-none space-y-5")}>
            {/* Header */}
            {!compact ? (
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Secure Payment
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        Complete the private payment flow using Aleo shielded transactions.
                    </p>
                </div>
            ) : null}

            {/* Stepper */}
            <nav className="space-y-0"> {/* Adjusted spacing */}
                {steps.map((s) => (
                    <div key={s.n} className="flex gap-4">
                        {/* Step Icon */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                                    compact && "h-7 w-7 text-[11px]",
                                    status === "error" && currentStep === s.n
                                        ? "bg-red-500 text-foreground"
                                        : currentStep === s.n
                                            ? "bg-flagship-gradient text-primary-foreground ring-4 ring-primary/20 animate-in fade-in zoom-in"
                                            : s.done
                                                ? "bg-flagship-gradient text-primary-foreground"
                                                : "bg-foreground/10 text-foreground/50"
                                )}
                            >
                                {s.done ? "✓" : s.n}
                            </div>

                            {s.n !== steps.length && (
                                <div
                                    className={cn(
                                        "w-0.5 h-10 my-1 transition-colors duration-500",
                                        compact && "h-8",
                                        s.done
                                            ? "bg-flagship-gradient"
                                            : "bg-neutral-800"
                                    )}
                                />
                            )}
                        </div>

                        {/* Step Text */}
                        <div className="pt-1">
                            <p
                                className={cn(
                                    "text-xs font-bold uppercase tracking-widest transition-colors",
                                    compact && "text-[10px]",
                                    currentStep === s.n
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {s.label}
                            </p>

                            <p className={cn(
                                "text-[11px] transition-all",
                                compact && "text-[10px]",
                                currentStep === s.n ? "text-primary/80 font-medium" : "text-muted-foreground"
                            )}>
                                {s.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    )
}
