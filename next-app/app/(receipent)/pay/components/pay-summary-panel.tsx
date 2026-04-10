import Image from "next/image"
import { Activity, EyeOff, Fingerprint, Globe } from "lucide-react"

import type { PayClientLink, PayPageCopy } from "./pay-types"

export function PaySummaryPanel({
  link,
  copy,
}: {
  link: PayClientLink
  copy: PayPageCopy
}) {
  return (
    <div className="rounded-l-[2.25rem] p-6  sm:p-8">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            src="/kloak_logo.png"
            alt="Kloak"
            height={40}
            width={40}
            className="rounded-2xl border border-foreground/10"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Kloak</p>
          <p className="text-xs text-zinc-500">Private payment checkout</p>
        </div>
      </div>

      <div className="mt-10 space-y-2">
        <p className="text-[11px] font-semibold text-primary">{copy.eyebrow}</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{link.title}</h1>
          <p className="max-w-md text-xs leading-7 text-zinc-400">
            {link.description || copy.helper}
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-[1.75rem] ">
        <div className="flex items-center justify-between gap-4">
          
          <div className="rounded-full  px-3 py-1.5 text-xs text-primary">
            Private by default
          </div>
        </div>

        <div className="mt-2 grid ">
          <SummaryRow label="Settlement" value="Private on Aleo" icon={Activity} />
          <SummaryRow label="Payer address" value="Not shown to the merchant" icon={EyeOff} />
          <SummaryRow label="Wallet-held receipt" value="Used later for selective disclosure" icon={Fingerprint} />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-zinc-500">
        <Globe className="h-4 w-4" />
        <span className="font-mono">{`kloak.vercel.app/pay/${link.id}`}</span>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Activity
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl p-2">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border bg-black/30 text-zinc-200">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs leading-6 text-zinc-500">{value}</p>
      </div>
    </div>
  )
}
