import type { Metadata } from "next"

import { DocsArticleShell } from "@/features/docs/components/docs-article-shell"
import { DocsBulletList } from "@/features/docs/components/docs-bullet-list"
import { DocsCallout } from "@/features/docs/components/docs-callout"
import { DocsCodeBlock } from "@/features/docs/components/docs-code-block"
import { DocsSection } from "@/features/docs/components/docs-section"
import { DocsTable } from "@/features/docs/components/docs-table"

export const metadata: Metadata = {
  title: "Payment Links Docs | Kloak",
  description: "How Kloak payment links work, from creation and templates to expiry, analytics, and payer experience.",
}

const toc = [
  { id: "what-it-is", label: "What it is" },
  { id: "creation-flow", label: "Creation flow" },
  { id: "templates", label: "Templates" },
  { id: "payer-experience", label: "Payer experience" },
  { id: "status-analytics", label: "Status and analytics" },
] as const

const checkoutSnippet = `{
  "template": "checkout",
  "title": "Pro plan",
  "amount": 49,
  "token": "ALEO",
  "successMessage": "Payment received. Thanks for upgrading.",
  "redirectUrl": "https://yourapp.com/billing/success"
}`

export default function PaymentLinksDocsPage() {
  return (
    <DocsArticleShell
      breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: "Payment Links" }]}
      eyebrow="Payment Links"
      title="Create and share payment links"
      description="Set up a payment link, share it with anyone, and track payments. This guide explains what you configure, what the payer sees, and how links behave over time."
      toc={[...toc]}
      primaryAction={{ label: "Open Payment Links", href: "/payment-links" }}
      secondaryAction={{ label: "Privacy model", href: "/docs/privacy-model" }}
    >
      <DocsSection
        id="what-it-is"
        title="What a payment link is"
        description="A payment link lets you request a payment and share it with anyone."
      >

        <DocsBulletList
          items={[
            "Create a payment link in the web app and share it anywhere.",
            "The page can be public, but payment details stay private by default.",
            "Each link lets you track payments, trigger webhooks, and use automation.",
          ]}
        />
      </DocsSection>

      <DocsSection
        id="creation-flow"
        title="Creation flow"
        description="The create flow is stepped on purpose so creators can move through setup without cognitive overload."
      >
        <div className="space-y-5">
          <DocsBulletList
            items={[
              "Step 1: Choose a template to start with the right defaults.",
              "Step 2: Add payment details like title, amount, and token.",
              "Step 3: Set options like expiry, success message, and redirect URL.",
            ]}
          />
          <DocsCodeBlock code={checkoutSnippet} language="json" title="Example checkout-style link config" />
        </div>
      </DocsSection>

      <DocsSection
        id="templates"
        title="Templates"
        description="Templates change how the page looks and behaves, but all links work the same underneath."
      >
        <DocsTable
          headers={["Template", "Use this for", "What's different"]}
          rows={[
            ["Invoice", "Bills and fixed payments", "More formal wording and invoice-style layout"],
            ["Freelance Payment", "Services and contract work", "Clear payment-due messaging"],
            ["Tip Jar / Donation", "Flexible or optional payments", "Suggested amounts and easy custom input"],
            ["Checkout", "Products and purchases", "Redirect after payment and purchase-style flow"],
            ["Custom", "Anything else", "Simple layout with neutral wording"],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="payer-experience"
        title="Payer experience"
        description="The payment page is clean and simple, with small differences based on the template."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DocsCallout title="Invoices and freelance payments">
            Feels like a bill or service payment instead of a casual request.
          </DocsCallout>
          <DocsCallout title="Tip jars and donations">
            Suggested amounts help people choose quickly, while still allowing custom amounts.
          </DocsCallout>
          <DocsCallout title="Checkout links">
            After payment, users can be redirected back to your app or website.
          </DocsCallout>
          <DocsCallout title="Trust">
            Clear links to privacy, terms, and support help users feel confident paying.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection
        id="status-analytics"
        title="Status and analytics"
        description="Track the status of each link and understand how it&apos;s performing."
      >
        <DocsBulletList
          items={[
            "A live link is active and can accept payments.",
            "An expired link can no longer be used.",
            "A capped link has reached its maximum number of payments.",
            "Each link shows key details like title, status, amount, and expiry.",
            "Analytics show traffic and payments without revealing payer identity.",
          ]}
        />
      </DocsSection>
    </DocsArticleShell>
  )
}
