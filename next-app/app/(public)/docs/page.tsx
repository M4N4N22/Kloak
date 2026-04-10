import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Bot, Link2, Shield, ShieldCheck } from "lucide-react"

import { DocsArticleShell } from "@/features/docs/components/docs-article-shell"
import { DocsBulletList } from "@/features/docs/components/docs-bullet-list"
import { DocsCallout } from "@/features/docs/components/docs-callout"
import { DocsCodeBlock } from "@/features/docs/components/docs-code-block"
import { DocsSection } from "@/features/docs/components/docs-section"
import { DOCS_NAV_ITEMS } from "@/features/docs/lib/docs-nav"
import { FaqList } from "@/features/trust/components/faq-list"
import { KLOAK_FAQ_ITEMS } from "@/features/trust/lib/faq"

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Detailed Kloak documentation for payment links, private settlement, selective disclosure, proof verification, and operational workflows.",
}

const toc = [
  { id: "getting-started", label: "Getting started" },
  { id: "system-map", label: "System map" },
  { id: "core-concepts", label: "Core concepts" },
  { id: "quickstart", label: "Quickstart" },
  { id: "faq", label: "FAQ" },
] as const

const quickstartCode = `// Kloak quickstart mental model
1. Create a payment link
2. Share the request page
3. Receive a private settlement
4. Generate a proof only if a workflow requires it
5. Verify that proof with the package + public Aleo references`

export default function DocsPage() {
  return (
    <DocsArticleShell
      breadcrumbs={[{ label: "Docs" }, { label: "Home" }]}
      eyebrow="Documentation"
      title="Everything you need to use Kloak"
      description="Create payment links, receive private payments, and verify them when needed. These guides walk you through how Kloak works in real use."
      toc={[...toc]}
      primaryAction={{ label: "Get started", href: "/docs/payment-links" }}
      secondaryAction={{ label: "Verification guide", href: "/docs/verification" }}
      versionBadge="April 2026 docs"
    >
      <DocsSection
        id="getting-started"
        title="Getting started"
        description="Start by creating a payment link, then learn how payments stay private and how to verify them when needed."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {DOCS_NAV_ITEMS.filter((item) => item.href !== "/docs").map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.75rem] border bg-foreground/[0.02] px-5 py-5 transition-colors hover:border-foreground hover:bg-foreground/[0.04]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-black/30 text-zinc-100">
                    <Icon className="h-5 w-5 " />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-400">{item.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                      Open guide
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </DocsSection>

      <DocsSection
        id="system-map"
        title="How Kloak works"
        description="Kloak helps you collect payments, keep details private, and verify them only when needed."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <DocsCallout title="Collection">
            <div className="space-y-2">

              <p>Create payment links and share them with anyone to collect payments.</p>
            </div>
          </DocsCallout>
          <DocsCallout title="Privacy">
            <div className="space-y-2">

              <p>Payment details stay private by default and aren&apos;t visible on public networks.</p>
            </div>
          </DocsCallout>
          <DocsCallout title="Proofs">
            <div className="space-y-2">

              <p>Share only the information needed to prove something about a payment.</p>
            </div>
          </DocsCallout>
          <DocsCallout title="Operations">
            <div className="space-y-2">

              <p>Share only the information needed to prove something about a payment.</p>
            </div>
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="core-concepts"
        title="Core concepts"
        description="These are the ideas that show up across almost every Kloak workflow."
      >
        <DocsBulletList
          items={[
            "You can share a payment link publicly while keeping the payment itself private.",
            "Your wallet stores the payment receipt, which you can use later if needed.",
            "You can prove different things about the same payment at different times.",
            "To verify a payment, check the proof and the public record together.",
            "Kloak keeps payments private but still lets you prove them when required.",
          ]}
        />
      </DocsSection>

      <DocsSection
        id="quickstart"
        title="Quickstart"
        description="Here&apos;s the fastest way to understand how Kloak works from start to finish."
      >
        <div className="space-y-5">
          <DocsCodeBlock code={quickstartCode} language="txt" title="Kloak flow" />
          <DocsCallout title="Start here">
            Begin with Payment Links, then learn how privacy works, and finally how to verify payments.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="faq"
        title="Frequently asked questions"
        description="Common questions about how Kloak works and how to use it."
      >
        <FaqList items={KLOAK_FAQ_ITEMS} />
      </DocsSection>
    </DocsArticleShell>
  )
}
