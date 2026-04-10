import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bot,
  ChartColumnBig,
  FileCheck2,
  Link2,
  ShieldCheck,
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
  "Aleo testnet access",
  "No charges during testnet",
  "Chain-first verification",
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
      "Private payments and payer privacy by default",
      "Core selective disclosure and proof verification",
      "Standard Telegram and webhook workflows",
      "Enough history and controls for normal usage",
      "A strong default plan, not a crippled one",
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
      "Multiple webhook endpoints for different workflows",
      "Deeper automation and advanced Telegram workflows",
      "Richer analytics, reporting, and longer history",
      "Advanced link controls and policy-style settings",
      "More powerful compliance and proof workflows",
    ],
  },
]

export const comparisonRows: PricingComparisonRow[] = [
  {
    icon: Link2,
    label: "Unlimited payment links",
    description: "Create and share as many links as you need.",
    free: true,
    pro: true,
  },
  {
    icon: ShieldCheck,
    label: "Private payments",
    description: "Private settlement and payer privacy by default.",
    free: true,
    pro: true,
  },
  {
    icon: FileCheck2,
    label: "Selective disclosure",
    description: "Generate and verify payment proofs when you need them.",
    free: true,
    pro: true,
  },
  {
    icon: Webhook,
    label: "Webhook endpoints",
    description: "Route payment events into your backend systems.",
    free: "1 endpoint",
    pro: "Multiple",
  },
  {
    icon: Workflow,
    label: "Automation depth",
    description: "Turn payment events into more advanced workflows over time.",
    free: "Core",
    pro: "Advanced",
  },
  {
    icon: Bot,
    label: "Telegram workflows",
    description: "Manage alerts and payment workflows inside Telegram.",
    free: "Standard",
    pro: "Advanced",
  },
  {
    icon: ChartColumnBig,
    label: "Analytics and history",
    description: "Track performance, activity, and longer-running usage.",
    free: "Core",
    pro: "Deeper",
  },
  {
    icon: Activity,
    label: "Advanced link controls",
    description: "Apply stronger policies and more operational controls to links.",
    free: false,
    pro: true,
  },
  {
    icon: FileCheck2,
    label: "Deeper proof workflows",
    description: "Better fit for repeat reviewers and heavier compliance needs.",
    free: false,
    pro: true,
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
