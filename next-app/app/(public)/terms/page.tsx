import type { Metadata } from "next"

import { TrustPageShell } from "@/features/trust/components/trust-page-shell"

export const metadata: Metadata = {
  title: "Terms | Kloak",
  description: "Core product terms for using Kloak payment links, compliance proofs, and related automation surfaces.",
}

const sections = [
  {
    title: "Using Kloak",
    body: "Kloak gives you tools to create payment links, manage settlement flows, and generate selective-disclosure proofs. You are responsible for the payment requests you create and the proof packages you share.",
  },
  {
    title: "Wallet and custody",
    body: "Kloak is not a custodial wallet. Payments and proof actions depend on the wallet you connect, the records it holds, and the chain confirmations that follow.",
  },
  {
    title: "Acceptable use",
    body: "Do not use Kloak for fraud, abuse, unlawful transactions, or misleading proof claims. If a proof has been revoked, expired, or altered, it should not be presented as valid.",
  },
  {
    title: "Service limits",
    body: "Features may depend on Aleo network availability, wallet behavior, and supporting indexers. Some public request metadata is visible by design on shareable payment-link flows.",
  },
] as const

export default function TermsPage() {
  return (
    <TrustPageShell
      eyebrow="Terms"
      title="Simple terms for a technical product."
      description="These terms keep the product understandable: Kloak provides the tools, your wallet performs the private actions, and both come with normal network and user-responsibility limits."
      owner="Kloak product team"
      lastUpdated="April 10, 2026"
      purpose="Use this page for the core rules, responsibilities, and service limits that apply when using Kloak."
    >
      {sections.map((section) => (
        <section
          key={section.title}
          className=" py-2 backdrop-blur-xl"
        >
          <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
          <p className="mt-2 text-sm leading-7 text-neutral-400">{section.body}</p>
        </section>
      ))}
    </TrustPageShell>
  )
}
