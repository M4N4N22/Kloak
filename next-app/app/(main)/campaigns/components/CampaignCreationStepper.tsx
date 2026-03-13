"use client"

import { cn } from "@/lib/utils"

type Status =
    | "idle"
    | "calculating"
    | "registering"
    | "finalizing_create"
    | "funding"
    | "finalizing_fund"
    | "completed"
    | "error"

export default function CampaignCreationStepper({
    status,
    errorMessage
}: {
    status: Status
    errorMessage?: string | null
}) {

    const currentStep =
        ["idle", "calculating"].includes(status)
            ? 1
            : ["registering", "finalizing_create"].includes(status)
                ? 2
                : ["funding", "finalizing_fund"].includes(status)
                    ? 3
                    : status === "completed"
                        ? 4
                        : 1

    const steps = [
        {
            n: 1,
            label: "Prepare Distribution",
            desc:
                status === "calculating"
                    ? "Generating secrets and commitments"
                    : "Building Merkle tree from CSV",
            done: ["registering", "finalizing_create", "funding", "finalizing_fund", "completed"].includes(status)
        },
        {
            n: 2,
            label: "Register Campaign",
            desc:
                status === "finalizing_create"
                    ? "Waiting for Aleo confirmation"
                    : "Broadcasting campaign metadata",
            done: ["funding", "finalizing_fund", "completed"].includes(status)
        },
        {
            n: 3,
            label: "Fund Campaign",
            desc:
                status === "funding"
                    ? "Preparing private balance record"
                    : status === "finalizing_fund"
                        ? "Confirming funding transaction"
                        : "Depositing campaign funds",
            done: status === "completed"
        },
        {
            n: 4,
            label: "Campaign Live",
            desc: "Distribution ready for recipients",
            done: status === "completed"
        }
    ]

    return (
        <div className="space-y-8 max-w-xs mt-8">
            {/* Stepper */}

            <nav className="space-y-0">
                {steps.map((s) => (
                    <div key={s.n} className="flex gap-4">

                        {/* Step Icon */}

                        <div className="flex flex-col items-center">

                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                                    status === "error" && currentStep === s.n
                                        ? "bg-red-500 text-white"
                                        : currentStep === s.n
                                            ? "bg-flagship-gradient text-primary-foreground ring-4 ring-primary/20 animate-in fade-in zoom-in "
                                            : s.done
                                                ? "bg-flagship-gradient text-primary-foreground "
                                                : "bg-white/10 text-foreground/50 "
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
                                            : "bg-zinc-800"
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

                            <p
                                className={cn(
                                    "text-[11px] transition-all",
                                    currentStep === s.n
                                        ? "text-primary/80 font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                {s.desc}
                            </p>

                        </div>

                    </div>
                ))}
            </nav>

            {/* Error message */}

            {status === "error" && errorMessage && (
                <div className="bg-black/70 border text-red-400 text-xs p-3 rounded-lg">
                    {errorMessage}
                </div>
            )}

            {/* Privacy Note */}

            <div className="p-4 bg-black/80 rounded-xl border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                    Privacy Guarantee
                </p>

                <p className="text-xs text-muted-foreground leading-normal">
                    Recipient identities and payouts remain private. Only a cryptographic commitment
                    to the distribution is stored on-chain.
                </p>
            </div>

        </div>
    )
}