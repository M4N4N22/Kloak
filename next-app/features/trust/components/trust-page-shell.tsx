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
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
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

      <section className="rounded-[2rem] border border-foreground/8 bg-black/20 px-6 py-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Need the full product flow?</p>
            <p className="text-sm text-zinc-400">
              Start with docs, then move into Payment Links or Compliance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-4 py-2 text-sm text-foreground transition-colors hover:bg-foreground/[0.07]"
            >
              Open Docs
            </Link>
            <Link
              href="/payment-links"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
        <TrustLinksRow className="mt-5 justify-start" />
      </section>
    </div>
  )
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className=" px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  )
}
