import type { Metadata } from "next"
import Link from "next/link"

import { TrustPageShell } from "@/features/trust/components/trust-page-shell"

export const metadata: Metadata = {
  title: "Support | Kloak",
  description: "Where to go for product help, proof verification guidance, and bug reports in Kloak.",
}

const supportPaths = [
  {
    title: "Product help",
    description: "Start with the docs if you need help creating links, understanding proof types, or checking what stays private.",
    href: "/docs",
    cta: "Open docs",
  },
  {
    title: "Trust and privacy questions",
    description: "Use the privacy and security pages if you need the honest boundary around public request data, private settlement, and proof verification.",
    href: "/security",
    cta: "Read security notes",
  },
  {
    title: "Bug reports and issues",
    description: "If something is broken, privacy-sensitive, or out of sync, open an issue with the Kloak team on GitHub.",
    href: "https://github.com/M4N4N22/Kloak/issues",
    cta: "Open GitHub issues",
  },
] as const

export default function SupportPage() {
  return (
    <TrustPageShell
      eyebrow="Support"
      title="Get help without guessing."
      description="Kloak support starts with the right path: docs for how-to questions, security notes for trust questions, and GitHub issues for bugs or broken flows."
      owner="Kloak support and product team"
      lastUpdated="April 10, 2026"
      purpose="Use this page to find the right support path quickly instead of guessing between product docs, trust docs, and bug reporting."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {supportPaths.map((path) => (
          <Link
            key={path.title}
            href={path.href}
            target={path.href.startsWith("http") ? "_blank" : undefined}
            rel={path.href.startsWith("http") ? "noreferrer" : undefined}
            className="rounded-[2rem] border border-foreground/8 bg-black/20 px-6 py-6 transition-colors hover:border-foreground/14 hover:bg-black/30"
          >
            <h2 className="text-xl font-semibold text-foreground">{path.title}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{path.description}</p>
            <p className="mt-5 text-sm font-medium text-primary">{path.cta}</p>
          </Link>
        ))}
      </section>

      <section className=" py-6 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-foreground">What helps us help faster</h2>
        <div className="mt-4 space-y-1 text-sm leading-7 text-zinc-400">
          <p>Include the page you were on, what wallet you were using, and the exact message you saw.</p>
          <p>For proof issues, include whether the problem happened while generating, copying, or verifying the proof.</p>
          <p>For payment issues, include whether the payment reached the wallet, the pay page, or the Kloak history view.</p>
        </div>
      </section>
    </TrustPageShell>
  )
}
