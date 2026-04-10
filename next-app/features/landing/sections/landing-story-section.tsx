import { FileCode2, Link2, ShieldCheck } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"

const steps = [
  {
    step: "01",
    title: "Request",
    body: "Start with a payment link.",
    icon: Link2,
  },
  {
    step: "02",
    title: "Settle",
    body: "Keep the payment private.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Disclose",
    body: "Share only the proof you need.",
    icon: FileCode2,
  },
]

export function LandingStorySection() {
  return (
    <section id="story" className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeading
          eyebrow="The story"
          title="One simple flow."
          description="Request. Settle. Disclose."
          centered
        />

        <div className="grid gap-4 xl:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.step} className="rounded-[2.5rem] border p-7 text-center backdrop-blur-xl">
                <div className="flex flex-col items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-black/30 text-neutral-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase  text-primary">Step {item.step}</p>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-neutral-400">{item.body}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
