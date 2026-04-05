"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    ExternalLink,
    ArrowRight,
    CheckCircle2,
    Zap,
    Database,
    Bell,
    CreditCard,
    Users,
    Gift
} from "lucide-react"

const integrations = [
    {
        name: "n8n",
        description: "Powerful open-source workflow automation platform",
        logo: "https://cdn.simpleicons.org/n8n/FF6D5A", // n8n brand color
        features: [
            "Build no-code workflows",
            "Trigger actions on payments",
            "Connect 400+ integrations",
            "Self-hosted or cloud",
        ],
        link: "https://n8n.io",
        docs: "https://docs.n8n.io",
    },
    {
        name: "Make",
        description: "Visual workflow builder with extensive integrations",
        logo: "https://cdn.simpleicons.org/make/6C29D9", // Make brand color
        features: [
            "Drag-and-drop workflows",
            "Real-time execution",
            "1000+ integrations",
            "Advanced filtering",
        ],
        link: "https://www.make.com",
        docs: "https://www.make.com/docs",
    },
    {
        name: "Zapier",
        description: "Connect your apps and automate workflows",
        logo: "https://cdn.simpleicons.org/zapier/FF4A00", // Zapier brand color
        features: [
            "Simple automation setup",
            "5000+ integrations",
            "Built-in templates",
            "Multi-step workflows",
        ],
        link: "https://zapier.com",
        docs: "https://zapier.com/help",
    },
    {
        name: "Payload",
        description: "Modern headless CMS with workflow capabilities",
        logo: "https://cdn.simpleicons.org/payloadcms/000000/foreground", // Payload brand color (inverted for dark mode)
        features: [
            "Content management",
            "Custom workflows",
            "TypeScript-native",
            "Self-hosted ready",
        ],
        link: "https://payloadcms.com",
        docs: "https://payloadcms.com/docs",
    },
]

const useCases = [
    {
        title: "Send to Database",
        description: "Store payment data automatically",
        icon: Database,
        example: "Payment → Airtable / Sheets",
    },
    {
        title: "Notifications",
        description: "Send alerts across channels",
        icon: Bell,
        example: "Payment → Email / Slack",
    },
    {
        title: "Accounting",
        description: "Sync with accounting tools",
        icon: CreditCard,
        example: "Payment → QuickBooks",
    },
    {
        title: "CRM Updates",
        description: "Update customer records",
        icon: Users,
        example: "Payment → HubSpot",
    },
    {
        title: "Content Access",
        description: "Unlock content post-payment",
        icon: Gift,
        example: "Payment → Download link",
    },
    {
        title: "Rewards",
        description: "Trigger loyalty logic",
        icon: Zap,
        example: "Payment → Points / Badge",
    },
]

export default function AutomationPage() {
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* HERO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <h1 className="text-7xl tracking-tighter font-bold">
                                Automation
                            </h1>
                            <p className="text-muted-foreground max-w-md">
                                Connect Kloak to external tools and trigger workflows from payments
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Event-driven Workflows</Badge>
                            <Badge variant="secondary">No-code Automation</Badge>
                            <Badge variant="secondary">Real-time Triggers</Badge>
                            <Badge variant="secondary">Backend Integrations</Badge>
                            <Badge variant="secondary">Custom Pipelines</Badge>
                        </div>
                    </div>

                    <Button size="lg">
                        <a href="/webhooks">
                            <span className="flex items-center gap-2">
                                Configure Webhooks
                               
                            </span>
                        </a>
                    </Button>

                </div>

                {/* QUICK START */}
                <Card className="p-8">
                    {/* Abstract background element */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative space-y-8">
                        <div className="flex items-center gap-3">
                           
                            <h2 className="text-3xl font-bold tracking-tight">Quick Start Guide</h2>
                        </div>

                        <div className="relative space-y-0">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-primary" />

                            {[
                                { title: "Set up platform", desc: "Choose a platform like n8n or Make to receive your data." },
                                { title: "Create endpoint", desc: "Generate a unique Webhook URL within your chosen tool." },
                                { title: "Connect Kloak", desc: "Paste your URL into the Kloak dashboard to start the stream." },
                                { title: "Build logic", desc: "Design your automated actions (e.g., Send Slack alert)." },
                            ].map((step, i) => (
                                <div key={i} className="group relative flex gap-6 pb-10 last:pb-0 items-start">
                                    {/* Step Number Bubble */}
                                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border-2 border-primary text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm">
                                        {i + 1}
                                    </div>

                                    <div className="space-y-1 pt-1">
                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                            {step.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Button variant="secondary">
                                <span className="flex items-center gap-2">
                                    View Detailed Integration Guide (Coming Soon)
                                
                                </span>
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* PLATFORMS */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight">Recommended Platforms</h2>
                            <p className="text-muted-foreground text-sm">
                                Top-tier automation tools we've verified to work perfectly with our webhooks.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {integrations.map((p) => {
                            return (
                                <Card key={p.name} className="">
                                    {/* Subtle background glow on hover */}
                                    <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-4">
                                            {/* Logo Container */}
                                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50  group-hover:scale-110 transition-transform duration-300 overflow-hidden p-2">
                                                <img
                                                    src={p.logo}
                                                    alt={`${p.name} logo`}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{p.name}</h3>

                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed  line-clamp-2">
                                            {p.description}
                                        </p>

                                        <ul className="grid grid-cols-1 gap-y-2 border-y border-border/50 py-6">
                                            {p.features.map((f) => (
                                                <li key={f} className="text-sm text-muted-foreground flex items-center gap-3">
                                                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="flex items-center gap-3 pt-2">
                                            <Button variant="secondary"  >
                                                <a href={p.link} target="_blank">
                                                    Visit Site

                                                </a>
                                            </Button>

                                            <Button variant={"secondary"} >
                                                <a href={p.docs} target="_blank">
                                                    Read Docs

                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* USE CASES */}
                <div className="space-y-8">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight">Use Cases</h2>
                        <p className="text-sm text-muted-foreground">Common recipes to automate your business logic.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                        {useCases.map((u) => {
                            const Icon = u.icon

                            return (
                                <Card
                                    key={u.title}
                                    className="group relative p-6 space-y-4 overflow-hidden border-border/50  transition-all duration-300  "
                                >
                                    {/* Decorative background icon */}

                                    <div className="space-y-3 relative">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-full bg-flagship-gradient text-primary-foreground group-hover:text-primary-foreground transition-colors duration-300">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-bold text-lg tracking-tight">{u.title}</h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {u.description}
                                        </p>

                                        <div className="pt-4 mt-2 ">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Recipe</span>
                                            </div>

                                            {/* The "Action" Visualizer */}
                                            <div className="mt-2 flex items-center gap-2 font-mono text-[11px] bg-muted/50 p-2.5 rounded-full border border-border/50  transition-colors">
                                                <span className="text-primary font-bold">Payment</span>
                                                <ArrowRight size={12} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                <span className="text-foreground truncate">
                                                    {u.example.split('→')[1].trim()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>

               

                {/* CTA */}
                <div className="text-center space-y-4 py-8">
                    <h2 className="text-2xl font-bold">Start Automating</h2>

                    <Button >
                        <a href="/webhooks">
                            <span className="flex items-center gap-2">
                                Go to Webhooks
                                
                            </span>
                        </a>
                    </Button>
                </div>

            </div>
        </div>
    )
}