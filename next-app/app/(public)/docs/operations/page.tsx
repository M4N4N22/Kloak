import type { Metadata } from "next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocsArticleShell } from "@/features/docs/components/docs-article-shell"
import { DocsBulletList } from "@/features/docs/components/docs-bullet-list"
import { DocsCallout } from "@/features/docs/components/docs-callout"
import { DocsCodeBlock } from "@/features/docs/components/docs-code-block"
import { DocsSection } from "@/features/docs/components/docs-section"

export const metadata: Metadata = {
  title: "Operations Docs",
  description: "How Telegram bot, webhooks, automation, and the dashboard fit into the Kloak payment flow.",
}

const toc = [
  { id: "telegram", label: "Telegram bot" },
  { id: "webhooks", label: "Webhooks" },
  { id: "automation", label: "Automation" },
  { id: "dashboard", label: "Dashboard" },
] as const

const webhookPayload = `{
  "type": "payment.success",
  "linkId": "lnk_721940a",
  "requestId": "req_0x9b2...",
  "paymentId": "pay_550e8400",
  "txHash": "0x7d1a...f2e",
  "status": "SUCCESS",
  "amount": "100",
  "token": "ALEO",
  "paidAt": "2024-03-28T12:00:00Z",
  "title": "Freelance Design Services"
`

const webhookHandler = `export async function POST(req: Request) {
  const payload = await req.json()

  if (payload.event === "payment.success") {
    // update internal order, notify team, or unlock access
  }

  return new Response("ok")
}`

export default function OperationsDocsPage() {
  return (
    <DocsArticleShell
      breadcrumbs={[{ label: "Docs", href: "/docs" }, { label: "Ops Surfaces" }]}
      eyebrow="Ops Surfaces"
      title="How to use Kloak in real workflows"
      description="Create payment links, get notified when someone pays, and connect Kloak to your backend using webhooks and automation."
      toc={[...toc]}
      primaryAction={{ label: "Open dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Webhooks", href: "/webhooks" }}
    >
      <DocsSection
        id="telegram"
        title="Telegram bot"
        description="Use Telegram to share payment links and get notified when someone pays."
      >
        <DocsBulletList
          items={[
            "Create payment links in the web app.",
            "Share them directly through Telegram.",
            "Get instant alerts when a payment is completed.",
            "If your wallet isn’t linked yet, the bot will guide you through setup.",
          ]}
        />
      </DocsSection>

      <DocsSection
        id="webhooks"
        title="Webhooks"
        description="Use webhooks to react to payments in your backend."
      >
        <DocsCallout title="Common use cases">
          Update orders, send confirmations, or unlock access when a payment succeeds.
        </DocsCallout>
        <Tabs defaultValue="payload">
          <TabsList variant="line">
            <TabsTrigger value="payload">Payload</TabsTrigger>
            <TabsTrigger value="handler">Handler example</TabsTrigger>
          </TabsList>
          <TabsContent value="payload" className="space-y-4">
            <DocsCodeBlock code={webhookPayload} language="json" title="payment.success event" />
          </TabsContent>
          <TabsContent value="handler" className="space-y-4">
            <DocsCodeBlock code={webhookHandler} language="ts" title="Minimal webhook handler" />
          </TabsContent>
        </Tabs>
      </DocsSection>

      <DocsSection
        id="automation"
        title="Automation"
        description="Automatically run actions when something happens, like a successful payment."
      >
        <DocsCallout title="When to use this">
          Use automation when you have repeat tasks like sending messages, updating records, or triggering workflows after a payment.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="dashboard"
        title="Dashboard"
        description="View your payments, activity, and system status in one place."
      >
        <DocsBulletList
          items={[
            "Track payments and link performance.",
            "See recent activity across your account.",
            "Jump into actions like creating links or reviewing details.",
            "Sensitive proof details are only shown when explicitly requested.",
          ]}
        />
      </DocsSection>
    </DocsArticleShell>
  )
}
