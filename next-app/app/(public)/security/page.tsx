import type { Metadata } from "next"

import { TrustPageShell } from "@/features/trust/components/trust-page-shell"

export const metadata: Metadata = {
  title: "Security | Kloak",
  description: "How Kloak approaches private settlement, proof verification, public-chain checks, and reporting issues.",
}

const sections = [
  {
    title: "How verification works",
    body: "Kloak now verifies shared proofs in layers: the proof package itself, public Aleo chain references, and Kloak record status when available. Public-chain checks are treated as the primary confidence signal.",
  },
  {
    title: "How secrets are handled",
    body: "Webhook secrets and stored proof payloads are encrypted at rest. Hidden payment facts needed for selective disclosure stay tied to wallet-held receipts rather than being treated as general backend data.",
  },
  {
    title: "What to report",
    body: "Please report bugs that expose payment history, bypass access checks, break proof revocation, or create mismatches between wallet-held receipts and Kloak records.",
  },
] as const

export default function SecurityPage() {
  return (
    <TrustPageShell
      eyebrow="Security"
      title="Built for private payments, checked in layers."
      description="Kloak is designed around private settlement, selective disclosure, and clearer verification. This page explains the practical model rather than promising magic."
      owner="Kloak security and product team"
      lastUpdated="April 10, 2026"
      purpose="Use this page to understand how Kloak handles verification, encrypted stored secrets, and what kinds of issues should be reported."
    >
      {sections.map((section) => (
        <section
          key={section.title}
          className=" py-2 backdrop-blur-xl"
        >
          <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-400">{section.body}</p>
        </section>
      ))}
    </TrustPageShell>
  )
}
