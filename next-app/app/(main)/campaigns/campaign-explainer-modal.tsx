"use client"

import { createPortal } from "react-dom"
import { X } from "lucide-react"
import CampaignPrivacyExplainer from "./CampaignPrivacyExplainer"
import Image from "next/image"

export default function CampaignExplainerModal({
  onClose,
}: {
  onClose: () => void
}) {
  if (typeof window === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center backdrop-blur-sm">

      {/* Overlay */}
      <div
        className="absolute inset-0  "
        onClick={onClose}
      />

      {/* Modal */}
<div
  className="relative w-full max-w-6xl max-h-[90vh] bg-black/60 border border-foreground/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in"
  onClick={(e) => e.stopPropagation()}
>
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/bg-image.jpg"
            alt="Aurora background"
            fill
            priority
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 backdrop-blur-xl" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-12 py-6 border-b border-foreground/10">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-1">
              How             <div className=" flex items-center  shrink-0">
                                <div className="relative group">
                                  <div className="absolute -inset-1 bg-linear-to-br from-primary via-green-400 to-emerald-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                  <Image
                                    src="/kloak_logo.png"
                                    alt="Kloak"
                                    height={28}
                                    width={28}
                                    className="relative rounded-full border border-foreground/10"
                                  />
                                </div>
                                <span className="font-bold tracking-tight   text-foreground">
                                  loak
                                </span>
                              </div> Campaigns Stay Private
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Zero-knowledge reward distribution explained.
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-8 py-8 max-h-[calc(90vh-80px)]">
          <CampaignPrivacyExplainer />
        </div>
      </div>

    </div>,
    document.body
  )
}