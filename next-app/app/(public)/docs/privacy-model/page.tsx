import type { Metadata } from "next"

import { DocsArticleShell } from "@/features/docs/components/docs-article-shell"
import { DocsBulletList } from "@/features/docs/components/docs-bullet-list"
import { DocsCallout } from "@/features/docs/components/docs-callout"
import { DocsSection } from "@/features/docs/components/docs-section"

export const metadata: Metadata = {
  title: "Privacy Model Docs | Kloak",
  description: "The practical privacy model behind Kloak payment links, wallet-held receipts, and selective disclosure.",
}

const toc = [
  { id: "promise", label: "What Kloak promises" },
  { id: "public", label: "What is public" },
  { id: "private", label: "What stays private" },
  { id: "receipts", label: "Why receipts matter" },
] as const

export default function PrivacyModelDocsPage() {
  return (
    <DocsArticleShell
      breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: "Privacy Model" }]}
      eyebrow="Privacy Model"
      title="What stays private, what stays public, and why" description="Kloak is built around private settlement and selective disclosure, but the most important thing is understanding the exact privacy boundary rather than assuming everything is hidden everywhere."
      toc={[...toc]}
      primaryAction={{ label: "Read privacy page", href: "/privacy" }}
      secondaryAction={{ label: "Selective disclosure", href: "/docs/selective-disclosure" }}
    >
      <DocsSection
        id="promise"
        title="What Kloak promises"
        description="Here’s what you can expect when using Kloak."
      >
        <DocsBulletList
          items={[
            "Settlement is private by default.",
            "Payer identity stays hidden by default.",
            "Wallet-held receipts are the source of truth for later proof generation.",
            "Proofs reveal only the statement the proof owner chooses to share.",
            "Public request pages and some request metadata can still be visible by design.",
          ]}
        />
      </DocsSection>

      <DocsSection
        id="public"
        title="What is public by design"
        description="Not every part of the product is intended to be hidden."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DocsCallout title="Shareable request pages">
            Payment-link request pages can be shared openly, so request title, amount, and merchant-facing request terms may be visible.
          </DocsCallout>
          <DocsCallout title="Proof events">
            A disclosure transaction happening on-chain can still be visible as an event, even when the hidden payment facts are not revealed.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="private"
        title="What stays private"
        description="These are the parts Kloak is designed to keep out of normal public view."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DocsCallout title="Payer identity">
            Merchant-facing analytics and link detail views do not expose payer identity by default.
          </DocsCallout>
          <DocsCallout title="Receipt facts">
            Hidden payment facts used for disclosure stay tied to the wallet-held receipt rather than being treated as general backend data.
          </DocsCallout>
          <DocsCallout title="Stored proof payloads">
            Proof payloads are minimized by proof type and encrypted at rest.
          </DocsCallout>
          <DocsCallout title="Secrets">
            Sensitive stored material such as webhook secrets is encrypted at rest.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="receipts"
        title="Why receipts matter"
        description="The receipt is the bridge between private settlement and later compliance proof."
      >
        <DocsBulletList
          items={[
            "A valid receipt lets the proof owner later generate a proof without turning the backend into the source of truth for hidden facts.",
            "This is why payer-side and receiver-side proof flows moved toward a wallet-first model.",
            "It is also why receipt-to-payment reconciliation matters when debugging sync issues or recovering older rows.",
          ]}
        />
      </DocsSection>
    </DocsArticleShell>
  )
}
