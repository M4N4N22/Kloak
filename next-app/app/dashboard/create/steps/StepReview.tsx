"use client";

import {
    ChevronRight,
    Shield,
    Check,
    Wallet,
    AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import {
    WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { CreateDistributionForm } from "../types";
import { saveDistribution } from "@/app/lib/storage/distributions";
import { EXPECTED_NETWORK } from "@/app/lib/aleo/config";

type Props = {
    formData: CreateDistributionForm;
    onNext: () => void;
    onBack: () => void;
};

export default function StepReview({
    formData,
    onNext,
    onBack,
}: Props) {
    const {
        connected,
        connecting,
        publicKey,
        signMessage,
        wallet,
    } = useWallet();


    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const adapterNetwork =
        (wallet?.adapter as any)?.network;

    const wrongNetwork =
        connected &&
        adapterNetwork &&
        adapterNetwork !== EXPECTED_NETWORK;

    const handleCreate = async () => {
        if (!connected || !publicKey || !signMessage) return;

        if (wrongNetwork) {
            setError("Please switch Leo Wallet to Testnet Beta.");
            return;
        }

        try {
            setIsCreating(true);
            setError(null);

            const signedMessage = `Create KLOAK distribution:
${formData.name}
${formData.deadline}`;

            const bytes = new TextEncoder().encode(signedMessage);
            const signatureBytes = await signMessage(bytes);
            const signature = new TextDecoder().decode(signatureBytes);

            saveDistribution({
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                creatorAddress: publicKey,
                network: "testnet",
                signature,
                signedMessage,
                data: formData,
            });

            onNext();
        } catch {
            setError("Failed to create distribution. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Review Card */}
            <div className="space-y-8 border border-[#eeeeee] p-8">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
                            Distribution Name
                        </p>
                        <p className="text-sm font-medium">{formData.name}</p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
                            Application Deadline
                        </p>
                        <p className="text-sm font-medium">{formData.deadline}</p>
                    </div>

                    <div className="col-span-full">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
                            Description
                        </p>
                        <p className="text-sm text-[#666666]">
                            {formData.description}
                        </p>
                    </div>

                    <div className="col-span-full">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
                            Eligibility Rules
                        </p>
                        <p className="text-sm text-[#666666]">
                            {formData.eligibilityPreview}
                        </p>
                    </div>
                </div>

                {/* Privacy */}
                <div className="pt-8 border-t border-[#eeeeee]">
                    <div className="flex gap-4 p-4 bg-[#fafafa] border-l-2 border-[#015FFD]">
                        <Shield size={18} className="text-[#015FFD]" />
                        <ul className="text-xs text-[#666666] space-y-1">
                            <li className="flex items-center gap-2">
                                <Check size={12} /> Applicant identities are never exposed.
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={12} /> Eligibility is verified privately.
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={12} /> No public applicant lists are created.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Important network hint */}
            {connected && wrongNetwork && (
                <div className="flex gap-3 p-4 bg-[#fff7ed] border border-[#fed7aa]">
                    <AlertTriangle size={16} className="text-[#f97316]" />
                    <p className="text-sm text-[#9a3412]">
                        <strong>Important:</strong> Switch your Leo Wallet to
                        <strong> Testnet Beta</strong> to create this distribution.
                    </p>
                </div>
            )}

            {/* Errors */}
            {error && (
                <div className="p-4 border border-red-200 bg-red-50 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Wallet hint */}
            {!connected && !connecting && (
                <div className="flex items-center gap-3 p-4 bg-[#fafafa] border border-[#eeeeee]">
                    <Wallet size={16} className="text-[#015FFD]" />
                    <p className="text-sm text-[#666666]">
                        Connect your wallet to create this distribution.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
                <button
                    onClick={onBack}
                    disabled={isCreating}
                    className="border px-8 py-3 text-sm disabled:opacity-50"
                >
                    Back
                </button>

                {!connected ? (
                    <WalletMultiButton />
                ) : (
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || wrongNetwork}
                        className="bg-[#015FFD] text-white px-8 py-3 text-sm
              disabled:opacity-50 flex items-center gap-2"
                    >
                        {isCreating ? "Creating…" : "Create Distribution"}
                        {!isCreating && <ChevronRight size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
}
