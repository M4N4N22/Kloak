import Link from "next/link"
import { ArrowUpRight, Bot, Workflow, Webhook, Zap } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"
import { cn } from "@/lib/utils"

const surfaces = [
  {
    title: "Telegram Bot",
    body: "Share payment links and receive real-time privacy-safe alerts directly in your chat.",
    href: "/bots",
    icon: Bot,
    tag: "Native",
  },
  {
    title: "Webhooks",
    body: "The bridge to your backend. Sync payment events with your existing databases instantly.",
    href: "/webhooks",
    icon: Webhook,
    tag: "API",
  },
  {
    title: "Automation",
    body: "Connect your private payment flow to Zapier or custom internal workflows.",
    href: "/dashboard",
    icon: Workflow,
    tag: "Beta",
  },
]

export function LandingOperationsSection() {
  return (
    <section id="operations" className="relative px-6 py-24 sm:py-32">
      {/* Background Pattern: Subtle Blueprint Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Connectivity"
          title="Operate at the speed of chat."
          description="Kloak isn't a silo. It's the engine for your existing stack."
          centered
        />

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {surfaces.map((surface, index) => {
            const Icon = surface.icon
            return (
              <Link
                key={surface.title}
                href={surface.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] backdrop-blur-xl border border-foreground/5 bg-neutral-900/20 p-8 transition-all duration-500  hover:bg-neutral-900/40 hover:shadow-2xl"
              >
                {/* Schematic Corner: Indicates connectivity */}
                <div className="absolute right-0 top-0 h-16 w-16 opacity-10 transition-opacity group-hover:opacity-30">
         
               
                </div>

                <div className="space-y-8">
                  {/* Icon & Tag Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl  bg-foreground/5 text-primary shadow-inner  transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-lg bg-foreground/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300 transition-colors">
                      {surface.tag}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {surface.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-500 transition-colors group-hover:text-neutral-400">
                      {surface.body}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-12 flex items-center justify-between  pt-6 transition-colors group-hover:border-primary/10">
                
                  <ArrowUpRight className="h-4 w-4 text-neutral-700 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}