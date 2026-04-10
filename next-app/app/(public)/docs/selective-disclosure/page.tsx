import type { Metadata } from "next"

import { DocsArticleShell } from "@/features/docs/components/docs-article-shell"
import { DocsBulletList } from "@/features/docs/components/docs-bullet-list"
import { DocsCallout } from "@/features/docs/components/docs-callout"
import { DocsSection } from "@/features/docs/components/docs-section"
import { DocsTable } from "@/features/docs/components/docs-table"

export const metadata: Metadata = {
  title: "Selective Disclosure Docs | Kloak",
  description: "How Kloak selective disclosure works, what proof types exist, and how duplicate prevention and revocation behave.",
}

const toc = [
  { id: "ownership", label: "Receipt ownership" },
  { id: "proof-types", label: "Proof types" },
  { id: "reuse", label: "Reuse and duplicates" },
  { id: "storage", label: "Stored proof data" },
] as const

export default function SelectiveDisclosureDocsPage() {
  return (
    <DocsArticleShell
      breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: "Selective Disclosure" }]}
      eyebrow="Selective Disclosure"
      title="How proof generation works in Kloak"
      description="Selective disclosure turns a wallet-held payment receipt into a shareable proof statement without forcing the proof owner to reveal more than the workflow requires."
      toc={[...toc]}
      primaryAction={{ label: "Open compliance", href: "/compliance" }}
      secondaryAction={{ label: "Verification guide", href: "/docs/verification" }}
    >
      <DocsSection
        id="ownership"
        title="Receipt ownership"
        description="Proof generation is tied to the receipt the wallet actually owns."
      >
        <DocsBulletList
          items={[
            "The wallet that holds the payer receipt can generate payer-side proofs.",
            "The wallet that holds the receiver receipt can generate receiver-side proofs.",
            "The backend no longer depends on stored payer identity to decide who can create a proof.",
          ]}
        />
      </DocsSection>

      <DocsSection
        id="proof-types"
        title="Proof types"
        description="Different workflows need different statements, so Kloak supports multiple proof shapes."
      >
        <DocsTable
          headers={["Proof type", "What it reveals", "Best fit"]}
          rows={[
            ["Basic", "That the payment exists", "General compliance checks when exact amount is not needed"],
            ["Amount", "The exact amount", "When the reviewer must see the full total"],
            ["Threshold", "That the amount met or exceeded a floor", "Minimum-spend or threshold-style checks"],
            ["Time-bound", "That the payment happened within a chosen range", "Reporting periods and timing-bound workflows"],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="reuse"
        title="Reuse, duplicates, and revocation"
        description="Proofs are reusable documents, not one-time spends."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DocsCallout title="Reusable by design">
            The same payment can support multiple different valid proof statements over time, such as a basic proof first and an amount or threshold proof later.
          </DocsCallout>
          <DocsCallout title="Duplicate guard">
            Kloak blocks only exact duplicate active proofs for the same statement. If that proof is revoked later, the same statement can be generated again.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="storage"
        title="Stored proof data"
        description="Stored proof data is minimized to avoid turning the backend into a copy of hidden payment facts."
      >
        <DocsBulletList
          items={[
            "Basic proofs do not store hidden exact amount or exact timestamp by default.",
            "Threshold proofs store the threshold statement, not the hidden exact amount.",
            "Time-bound proofs store the disclosed range, not the hidden exact timestamp.",
            "Proof payloads are encrypted at rest.",
          ]}
        />
      </DocsSection>
    </DocsArticleShell>
  )
}
