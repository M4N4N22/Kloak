import Link from "next/link"
import { ArrowUpRight, Bot, Workflow, Webhook } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"

const surfaces = [
  {
    title: "Telegram bot",
    body: "Share links and get paid alerts in chat.",
    href: "/bots",
    icon: Bot,
  },
  {
    title: "Webhooks",
    body: "Send payment events to your backend.",
    href: "/webhooks",
    icon: Webhook,
  },
  {
    title: "Automation",
    body: "Connect Kloak to your existing workflows.",
    href: "/dashboard",
    icon: Workflow,
  },
]

export function LandingOperationsSection() {
  return (
    <section id="operations" className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeading
          eyebrow="Operator surfaces"
          title="Built to work with the rest of your stack."
          description="Telegram, webhooks, and automation around the payment."
          centered
        />

        <div className="grid gap-4 xl:grid-cols-3">
          {surfaces.map((surface) => {
            const Icon = surface.icon
            return (
              <Link
                key={surface.title}
                href={surface.href}
                className="group rounded-[2.5rem] border backdrop-blur-xl p-7 transition-colors hover:bg-zinc-900/5"
              >
                <div className="flex h-full flex-col justify-between gap-10">
                  <div className="space-y-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{surface.title}</h3>
                      <p className="text-sm leading-relaxed text-zinc-400">{surface.body}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase  text-zinc-400 transition-colors group-hover:text-primary">
                    Open
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
