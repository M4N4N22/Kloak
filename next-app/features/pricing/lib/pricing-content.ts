import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bot,
  ChartColumnBig,
  FileCheck2,
  Webhook,
  Workflow,
} from "lucide-react"

export type PricingPlanDefinition = {
  id: "free" | "pro"
  name: string
  eyebrow: string
  summary: string
  price: string
  priceNote: string
  secondaryNote?: string
  highlights: string[]
}

export type PricingComparisonRow = {
  icon: LucideIcon
  label: string
  description: string
  free: boolean | string
  pro: boolean | string
}

export const pricingTrustBadges = [
  "",
  "",

]

export const pricingPlans: PricingPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    eyebrow: "Start here",
    summary: "Useful from day one for normal usage, demos, and real product testing.",
    price: "$0",
    priceNote: "Free on testnet",
    secondaryNote: "No payment method required.",
    highlights: [
      "Unlimited payment links",
      "Private ALEO, USDCX, and USAD payments",
      "Selective disclosure proof generation and verification",
      "Link templates, redirects, and success messages",
      "Telegram connection and basic notifications",
      "Useful day one without artificial starter limits",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "Built for heavier usage",
    summary: "For teams, merchants, agencies, and builders who need more leverage as volume grows.",
    price: "Free on testnet",
    priceNote: "Expected mainnet pricing: around $29/month",
    secondaryNote: "Planned pricing is directional and may evolve as the product matures.",
    highlights: [
      "Everything in Free",
      "Multiple webhook endpoints",
      "More automation and routing flexibility",
      "Longer analytics, payment, and delivery history",
      "More configurable Telegram alert flows",
      "Better fit for higher-volume merchant usage",
    ],
  },
]

export const comparisonRows: PricingComparisonRow[] = [
  {
    icon: FileCheck2,
    label: "Unlimited payment links",
    description: "Create and share as many payment links as you need.",
    free: true,
    pro: true,
  },
  {
    icon: FileCheck2,
    label: "Private ALEO, USDCX, and USAD payments",
    description: "Use private settlement across the supported Aleo-native payment paths.",
    free: true,
    pro: true,
  },
  {
    icon: FileCheck2,
    label: "Selective disclosure proofs",
    description: "Generate payer or receiver proofs and verify shared proof packages.",
    free: true,
    pro: true,
  },
  {
    icon: FileCheck2,
    label: "Payment-link templates",
    description: "Start from invoice, freelance, tip jar, checkout, or custom link flows.",
    free: true,
    pro: true,
  },
  {
    icon: FileCheck2,
    label: "Redirects and success messages",
    description: "Control what happens after payment without needing a custom checkout build.",
    free: true,
    pro: true,
  },
  {
    icon: Bot,
    label: "Telegram connection",
    description: "Connect the bot and receive payment-aware notifications.",
    free: true,
    pro: true,
  },
  {
    icon: Webhook,
    label: "Webhook endpoints",
    description: "Send payment events into your backend, CRM, or internal tools.",
    free: "1 endpoint",
    pro: "Multiple endpoints",
  },
  {
    icon: Workflow,
    label: "Automation usage",
    description: "Run basic event-driven workflows or support heavier automation needs as volume grows.",
    free: "Basic event flows",
    pro: "Higher-volume usage",
  },
  {
    icon: Bot,
    label: "Telegram alert configuration",
    description: "Decide how much control you want over payment-aware bot notifications.",
    free: "Basic alerts",
    pro: "More configurable alerts",
  },
  {
    icon: ChartColumnBig,
    label: "Analytics history",
    description: "Look back across payment-link activity and payment performance over time.",
    free: "Recent history",
    pro: "Longer history",
  },
  {
    icon: Activity,
    label: "Webhook delivery history",
    description: "Review webhook attempts and delivery outcomes when debugging integrations.",
    free: "Recent logs",
    pro: "Longer log history",
  },
  {
    icon: FileCheck2,
    label: "Compliance recovery and proof operations",
    description: "Handle receipt recovery, proof revocation, and repeat proof work more comfortably.",
    free: "Standard usage",
    pro: "Better fit for frequent use",
  },
  {
    icon: FileCheck2,
    label: "Best fit",
    description: "Choose the plan that matches how much operational depth you need.",
    free: "Solo and light usage",
    pro: "Teams and heavier usage",
  },
]

export const audienceCards = [
  {
    title: "Free is for getting started without friction",
    body:
      "Use Free when you want to create links, receive private payments, verify proofs, and learn the product without hitting artificial walls too early.",
    bullets: [
      "Solo builders and small teams",
      "Pilots, demos, and user testing",
      "Normal usage without heavy automation needs",
    ],
  },
  {
    title: "Pro is for leverage as usage grows",
    body:
      "Use Pro when your workflows expand across teams, backend systems, agencies, or more frequent compliance and operational needs.",
    bullets: [
      "Merchants with recurring volume",
      "Agencies managing multiple flows",
      "Automation-heavy teams and operators",
    ],
  },
]

export const pricingTimeline = [
  {
    title: "Today on testnet",
    body:
      "Free and Pro are both available without charging users. The page models access levels and helps us shape plan boundaries while the product matures.",
  },
  {
    title: "How Pro works right now",
    body:
      "Pro is currently a wallet-level testnet unlock. It keeps the real activation flow in place without asking users to pay during testnet.",
  },
  {
    title: "What we expect on mainnet",
    body:
      "Pro is expected to become a paid plan on mainnet, likely around $29/month. Final pricing may evolve based on usage, product depth, and what operators actually need.",
  },
]
