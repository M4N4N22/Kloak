import Link from "next/link"
import { ArrowUpRight, BarChart3, Link2, ShieldCheck } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"

const pillars = [
  {
    title: "Payment links",
    body: "Create a link and get paid from anywhere.",
    href: "/payment-links",
    icon: Link2,
  },
  {
    title: "Selective disclosure",
    body: "Show only the proof you need.",
    href: "/compliance",
    icon: ShieldCheck,
  },
  {
    title: "Clean analytics",
    body: "See what is working without exposing who paid.",
    href: "/dashboard",
    icon: BarChart3,
  },
]

export function LandingPillarsSection() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeading
          eyebrow="Core product"
          title="The product is simple."
          description="Payment links plus selective disclosure."
          centered
        />

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {pillars.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className={[
                  "group rounded-[2.5rem] border backdrop-blur-xl  p-7 transition-colors hover:bg-zinc-900/50",
                  index === 0 ? "xl:min-h-[20rem]" : "",
                ].join(" ")}
              >
                <div className="flex h-full flex-col justify-between gap-10">
                  <div className="space-y-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-zinc-400">{item.body}</p>
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
