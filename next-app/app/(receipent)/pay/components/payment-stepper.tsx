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
}: {
    status: Status
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

    return (
        <div className="space-y-8 max-w-xs">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Secure Payment
                </h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Complete the private payment flow using Aleo shielded transactions.
                </p>
            </div>

            {/* Stepper */}
            <nav className="space-y-0"> {/* Adjusted spacing */}
                {steps.map((s) => (
                    <div key={s.n} className="flex gap-4">
                        {/* Step Icon */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
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
                                    currentStep === s.n
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {s.label}
                            </p>

                            <p className={cn(
                                "text-[11px] transition-all",
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