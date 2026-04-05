"use client"

import { CheckCircle2, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

type ProofPreviewProps = {
  disclosedItems: string[]
  hiddenItems: string[]
}

export function ProofPreview({ disclosedItems, hiddenItems }: ProofPreviewProps) {
  return (
    <div className="relative overflow-hidden  rounded-3xl">
     
      
      <div className="relative space-y-8">
       

        <div className="flex flex-col gap-4 relative">
          {/* SHARED WITH VERIFIER */}
          <div className="relative flex flex-col rounded-3xl  p-6 transition-all  bg-neutral-900/50">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                <Eye className="h-4 w-4" />
                Public Disclosure
              </div>
             
            </div>

            <div className="space-y-4">
              {disclosedItems.map((item) => (
                <div key={item} className="group flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium leading-snug text-neutral-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KEPT PRIVATE */}
          <div className="relative flex flex-col rounded-3xl border border-foreground/5 bg-black/40 p-6 opacity-60 transition-all hover:opacity-100">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                <EyeOff className="h-4 w-4" />
                Private (Shielded)
              </div>
              <Lock className="h-3.5 w-3.5 text-neutral-400" />
            </div>

            <div className="space-y-4">
              {hiddenItems.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-1 w-1 shrink-0 rounded-full bg-neutral-800" />
                  <span className="text-sm font-medium text-neutral-400 line-through decoration-neutral-800/50">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-foreground/[0.02] p-4 border border-foreground/5">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-primary/40" />
              </div>
            ))}
          </div>
          <p className="text-[11px] font-medium text-neutral-500">
            Your private data remains encrypted on-chain. This proof only reveals the logical truth of the statements above.
          </p>
        </div>
      </div>
    </div>
  )
}