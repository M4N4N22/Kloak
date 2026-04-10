import type { Metadata } from "next"

import { TrustPageShell } from "@/features/trust/components/trust-page-shell"

export const metadata: Metadata = {
  title: "Privacy | Kloak",
  description: "How Kloak handles payment links, private settlement, wallet-held receipts, and selective disclosure.",
}

const sections = [
  {
    title: "What stays private",
    points: [
      "Who paid stays private by default.",
      "Settlement happens through Aleo private records and wallet-held receipts.",
      "Compliance proofs reveal only the statement the proof owner chooses to share.",
    ],
  },
  {
    title: "What is public by design",
    points: [
      "Payment-link request pages are shareable, so some request details such as title, amount, and merchant-facing request terms can be public.",
      "A proof transaction happening on-chain can still be visible as an event, even when the hidden payment facts are not.",
    ],
  },
  {
    title: "What Kloak stores",
    points: [
      "Kloak stores the minimum needed to run payment links, analytics, proof history, and product operations.",
      "Sensitive proof payloads and webhook secrets are encrypted at rest.",
      "Wallet-held receipts remain the source of truth for hidden payment facts used in selective disclosure.",
    ],
  },
] as const

export default function PrivacyPage() {
  return (
    <TrustPageShell
      eyebrow="Privacy"
      title="Private settlement. Clear boundaries."
      description="Kloak is designed to keep settlement private and disclosure selective, while staying honest about what a public payment request page still exposes by design."
      owner="Kloak product and privacy team"
      lastUpdated="April 10, 2026"
      purpose="Use this page to understand what stays private, what is public by design, and what Kloak stores to operate the product."
    >
      {sections.map((section) => (
        <section
          key={section.title}
          className=" py-2 backdrop-blur-xl"
        >
          <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
          <div className="mt-2 space-y-1">
            {section.points.map((point) => (
              <p key={point} className="text-sm leading-7 text-zinc-400">
                {point}
              </p>
            ))}
          </div>
        </section>
      ))}
    </TrustPageShell>
  )
}
