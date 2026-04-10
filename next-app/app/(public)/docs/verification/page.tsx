import type { Metadata } from "next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocsArticleShell } from "@/features/docs/components/docs-article-shell"
import { DocsBulletList } from "@/features/docs/components/docs-bullet-list"
import { DocsCallout } from "@/features/docs/components/docs-callout"
import { DocsCodeBlock } from "@/features/docs/components/docs-code-block"
import { DocsSection } from "@/features/docs/components/docs-section"

export const metadata: Metadata = {
  title: "Verification Docs",
  description: "How Kloak proof verification works across package checks, public Aleo references, and Kloak record status.",
}

const toc = [
  { id: "order", label: "Verification order" },
  { id: "chain-checks", label: "Public chain checks" },
  { id: "record-status", label: "Kloak record status" },
  { id: "share-formats", label: "Share formats" },
] as const

const packageExample = `{
  "kind": "kloak.selective-disclosure-proof",
  "version": 1,
  "program": "kloak_protocol_v10.aleo",
  "proofId": "sdp...",
  "subject": {
    "ownerAddress": "aleo...",
    "proverAddress": "aleo..."
  },
  "statement": {
    "actorRole": "receiver",
    "proofType": "existence",
    "disclosedAmount": null,
    "thresholdAmount": null,
    "constraints": {
      "requestId": "1293..."
    }
  },
  "chain": {
    "paymentTxHash": "at1...",
    "disclosureTxHash": "at1...",
    "requestId": "129...",
    "commitment": "760..."
  },
  "proofDigest": "dba...",
  "verificationGuide": {
    "primaryTrustSignal": "public-chain",
    "secondaryTrustSignals": [
      "kloak-record",
      "revocation-status",
      "payment-history"
    ],
    "checks": [
      {
        "id": "package-integrity",
        "label": "Proof package was intact",
        "source": "package"
      },
      {
        "id": "payment-transaction",
        "label": "Payment transaction was found on Aleo",
        "source": "public-chain"
      },
      {
        "id": "disclosure-transaction",
        "label": "Proof transaction was found on Aleo",
        "source": "public-chain"
      },
      {
        "id": "disclosure-match",
        "label": "Proof transaction matched the shared statement",
        "source": "public-chain"
      },
      {
        "id": "kloak-record",
        "label": "Kloak found the proof record",
        "source": "kloak"
      },
      {
        "id": "revocation-status",
        "label": "Kloak checked revocation status",
        "source": "kloak"
      },
      {
        "id": "payment-history",
        "label": "Kloak re-checked payment history",
        "source": "kloak"
      }
    ],
    "note": "Kloak verifies the shared package first, then tries to confirm the proof from public Aleo transactions. Kloak record checks add revocation and history status on top when available."
  }
}`

const verifyLinkExample = `https://kloak.app/compliance/verify?proofId=proof_123&guide=chain-first`

export default function VerificationDocsPage() {
  return (
    <DocsArticleShell
      breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: "Proof Verification" }]}
      eyebrow="Verification"
      title="How proof verification works today"
      description="Kloak verification is intentionally layered. The goal is to rely less on Kloak alone over time and more on the package itself plus public Aleo evidence."
      toc={[...toc]}
      primaryAction={{ label: "Open verify page", href: "/compliance/verify" }}
      secondaryAction={{ label: "Support", href: "/support" }}
    >
      <DocsSection
        id="order"
        title="Verification order"
        description="The order matters because a proof package should fail fast if it was changed before any deeper checks happen."
      >
        <DocsBulletList
          items={[
            "First, Kloak checks the proof package structure and digest integrity.",
            "Second, Kloak checks public Aleo references such as the payment transaction and the disclosure transaction.",
            "Third, Kloak checks its own proof record status for support signals like revocation and stored history.",
          ]}
        />
      </DocsSection>

      <DocsSection
        id="chain-checks"
        title="Public chain checks"
        description="The public chain layer is treated as the primary confidence signal in the verify experience."
      >
        <div className="space-y-5">
          <DocsBulletList
            items={[
              "It checks whether the payment transaction exists.",
              "It checks whether the disclosure transaction exists.",
              "It checks whether the disclosure transaction called the expected proof function.",
              "If the public chain says the references do not match, Kloak should not silently treat the proof as valid.",
            ]}
          />
          <DocsCallout title="Why this matters">
            This is what reduces dependence on Kloak alone. A valid package plus confirmed public Aleo references carries more weight than a database row by itself.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="record-status"
        title="Kloak record status"
        description="Kloak should not be the only trust layer, but it still plays an important support role."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DocsCallout title="Revocation">
            Kloak record status helps determine whether a proof has been revoked and should no longer be trusted.
          </DocsCallout>
          <DocsCallout title="History and operator context">
            Kloak record status helps explain whether the proof is still active in Kloak and whether supporting history is available.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="share-formats"
        title="Share formats"
        description="Kloak supports both verify links and portable proof packages, and each is useful in a slightly different situation."
      >
        <Tabs defaultValue="package">
          <TabsList variant="line">
            <TabsTrigger value="package">Proof package JSON</TabsTrigger>
            <TabsTrigger value="link">Verify link</TabsTrigger>
          </TabsList>
          <TabsContent value="package" className="space-y-4">
            <p className="text-sm leading-7 text-neutral-400">
              Best when a reviewer wants the actual portable proof payload and its shared statement directly.
            </p>
            <DocsCodeBlock code={packageExample} language="json" title="Portable proof package" />
          </TabsContent>
          <TabsContent value="link" className="space-y-4">
            <p className="text-sm leading-7 text-neutral-400">
              Best for most reviewers because it is the simplest handoff into Kloak’s verify flow.
            </p>
            <DocsCodeBlock code={verifyLinkExample} language="txt" title="Verify link" />
          </TabsContent>
        </Tabs>
      </DocsSection>
    </DocsArticleShell>
  )
}
