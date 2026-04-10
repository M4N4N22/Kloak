import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  Bot,
  FileStack,
  Link2,
  Shield,
  Sparkles,
} from "lucide-react"

export type DocsNavItem = {
  group: string
  title: string
  href: string
  description: string
  icon: LucideIcon
}

export const DOCS_NAV_ITEMS: DocsNavItem[] = [
  {
    group: "Overview",
    title: "Docs Home",
    href: "/docs",
    description: "Start here for the big picture and the main paths through Kloak.",
    icon: Sparkles,
  },
  {
    group: "Product",
    title: "Payment Links",
    href: "/docs/payment-links",
    description: "How to create links, manage status, and understand the payer flow.",
    icon: Link2,
  },
  {
    group: "Trust",
    title: "Privacy Model",
    href: "/docs/privacy-model",
    description: "What stays private, what is public by design, and where receipts fit in.",
    icon: Shield,
  },
  {
    group: "Trust",
    title: "Selective Disclosure",
    href: "/docs/selective-disclosure",
    description: "How proofs are generated, what each proof type reveals, and how revocation works.",
    icon: FileStack,
  },
  {
    group: "Trust",
    title: "Proof Verification",
    href: "/docs/verification",
    description: "How package checks, public Aleo checks, and Kloak record status work together.",
    icon: BadgeCheck,
  },
  {
    group: "Operations",
    title: "Automation & Integrations",
    href: "/docs/operations",
    description: "Get notified, trigger actions, and connect payments to your workflow.",
    icon: Bot,
  },
]
