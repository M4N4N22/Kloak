import Link from "next/link"
import type { ReactNode } from "react"

import { TrustLinksRow } from "@/features/trust/components/trust-links-row"

type TrustPageShellProps = {
  eyebrow: string
  title: string
  description: string
  owner?: string
  lastUpdated?: string
  purpose?: string
  children: ReactNode
}

export function TrustPageShell({
  eyebrow,
  title,
  description,
  owner = "Kloak product and privacy team",
  lastUpdated = "April 10, 2026",
  purpose = "This page explains the current product model in plain language and will be updated as Kloak evolves.",
  children,
}: TrustPageShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="sm:py-4">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs text-primary">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
            {description}
          </p>
        </div>

        <div className="mt-8 grid gap-3 border-t border-foreground/8 pt-6 sm:grid-cols-3">
          <MetaTile label="Owned by" value={owner} />
          <MetaTile label="Last updated" value={lastUpdated} />
          <MetaTile label="What this page is for" value={purpose} />
        </div>
      </section>

      <div className="grid gap-6">{children}</div>
    </div>
  )
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className=" px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-300">{value}</p>
    </div>
  )
}
