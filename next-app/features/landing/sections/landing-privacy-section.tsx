import { EyeOff, Link2, ShieldCheck, Lock, CheckCircle2 } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"
import { cn } from "@/lib/utils"

const truths = [
  {
    title: "Private by Default",
    body: "Payer identity is cryptographically shielded from the start.",
    icon: EyeOff,
  },
  {
    title: "Selective by Design",
    body: "Only disclose the specific proof the situation requires.",
    icon: ShieldCheck,
  },
  {
    title: "Public Request",
    body: "Links stay public while the underlying data stays dark.",
    icon: Link2,
  },
]

export function LandingPrivacySection() {
  return (
    <section id="privacy-boundary" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* 1. Deep Shadow Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--primary-rgb),0.03),transparent_50%)]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Privacy Boundary"
          title="Privacy, without vague promises."
          description="We built the boundary into the protocol. You control the gate."
          centered
        />

        <div className="mt-20 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          
          {/* THE "CONSOLE" CARD (The Definition) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-950 p-10 shadow-2xl">
            {/* Background Glow */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">The Kloak Standard</p>
              </div>

              <div className="space-y-6">
                {[
                  "Share the payment link openly.",
                  "Identity remains shielded.",
                  "Reveal data only with user consent."
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-primary opacity-50" />
                    <p className="text-lg font-medium tracking-tight text-zinc-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Status Indicator */}
            <div className="relative z-10 mt-12 flex items-center gap-3 rounded-2xl bg-white/[0.02] p-4 border border-white/5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Zero-Knowledge Integrity Verified</p>
            </div>
          </div>

          {/* THE "TRUTHS" MATRIX */}
          <div className="grid gap-6 md:grid-cols-3">
            {truths.map((truth, index) => {
              const Icon = truth.icon
              return (
                <div 
                  key={truth.title} 
                  className="group relative flex flex-col justify-between rounded-[2.5rem] border border-white/5 bg-zinc-900/20 p-8 transition-all duration-500 hover:bg-zinc-900/40 hover:border-white/10"
                >
                  <div className="space-y-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950 text-zinc-500 transition-all group-hover:border-primary/20 group-hover:text-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold tracking-tight text-white">{truth.title}</h3>
                      <p className="text-sm leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
                        {truth.body}
                      </p>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute bottom-6 right-8 h-1 w-1 rounded-full bg-zinc-800 transition-all group-hover:scale-[4] group-hover:bg-primary/20" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}