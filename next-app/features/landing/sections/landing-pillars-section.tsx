import Link from "next/link"
import { ArrowUpRight, BarChart3, Link2, ShieldCheck } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"
import { cn } from "@/lib/utils"

const pillars = [
  {
    title: "Payment links",
    body: "Create a link, share it anywhere, and get paid without friction.",
    href: "/payment-links",
    icon: Link2,
    size: "large",
  },
  {
    title: "Share only what’s needed",
    body: "Prove a payment when required without revealing extra details.",
    href: "/compliance",
    icon: ShieldCheck,
    size: "small",
  },
  {
    title: "Clear analytics",
    body: "Track payments and performance while keeping payer details private.",
    href: "/dashboard",
    icon: BarChart3,
    size: "small",
  },
]

export function LandingPillarsSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Subtle Background Radial */}
 
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Core Product"
          title="The product is simple."
          description="A powerful primitive for private commerce."
          centered
        />

        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
          {pillars.map((item, index) => {
            const Icon = item.icon
            const isLarge = item.size === "large"

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "group relative overflow-hidden rounded-[2.5rem]  p-8 transition-all duration-500 backdrop-blur-xl border bg-neutral-950/30",
                  " hover:bg-neutral-950/90 ",
                  isLarge ? "lg:col-span-1 lg:row-span-2 flex-col justify-between" : "flex-row"
                )}
              >
                   <div
          className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-size-[30px_30px] opacity-70"
        />
                {/* Spotlight Reflection (Top Left Glare) */}
                <div className="pointer-events-none absolute -left-60 -top-60 h-64 w-64 rounded-full bg-primary blur-3xl transition-opacity opacity-0 group-hover:opacity-50" />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="space-y-6">
                    {/* Icon Housing: Squircle style */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-xl bg-foreground/2 text-primary shadow-inner transition-transform duration-500">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-3">
                      <h3 className={cn(
                        " tracking-tight text-white",
                        isLarge ? "text-3xl" : "text-xl"
                      )}>
                        {item.title}
                      </h3>
                      <p className="max-w-[280px] text-sm leading-relaxed text-neutral-500 transition-colors group-hover:text-neutral-400">
                        {item.body}
                      </p>
                    </div>
                  </div>

                  {/* Call to Action: Minimalist & Clean */}
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 transition-all group-hover:gap-3 group-hover:text-primary">
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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