import { EyeOff, Link2, ShieldCheck } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"

const truths = [
  {
    title: "Private by default",
    body: "Payer identity stays hidden.",
    icon: EyeOff,
  },
  {
    title: "Selective by design",
    body: "Reveal only the statement.",
    icon: ShieldCheck,
  },
  {
    title: "Shareable request",
    body: "The link can stay public.",
    icon: Link2,
  },
]

export function LandingPrivacySection() {
  return (
    <section id="privacy-boundary" className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeading
          eyebrow="Privacy boundary"
          title="Privacy, without vague promises."
          description="The link can be visible. The sensitive parts stay in the user's control."
          centered
        />

        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2.5rem] border  p-7">
            <p className="text-[10px] font-bold uppercase text-primary">What Kloak means</p>
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-zinc-400">
              <p>Share the payment link.</p>
              <p>Keep payer identity private by default.</p>
              <p>Reveal only what the situation requires.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {truths.map((truth) => {
              const Icon = truth.icon
              return (
                <div key={truth.title} className="rounded-[2rem] border  p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-foreground/10 bg-black/30 text-zinc-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{truth.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">{truth.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
