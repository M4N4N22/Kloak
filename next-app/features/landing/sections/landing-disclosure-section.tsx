import { Fingerprint, Scale } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"

const proofs = [
  { title: "Basic", body: "Confirm a payment happened." },
  { title: "Amount", body: "Reveal the exact amount." },
  { title: "Threshold", body: "Reveal a minimum only." },
]

export function LandingDisclosureSection() {
  return (
    <section id="selective-disclosure" className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeading
          eyebrow="Selective disclosure"
          title="Share less. Prove more."
          description="Choose the statement. Keep the rest private."
          centered
        />

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr] items-center">
          <div className="rounded-[2.5rem] border backdrop-blur-xl  p-7">
            <div className="space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-primary/10 text-primary">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-semibold tracking-tight text-foreground">Create a proof when you need one.</h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  Start from a payment, choose what you want to show, and keep the rest private.
                </p>
              </div>

              <div className="rounded-3xl border border-foreground/5 bg-black/25 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">Still private</p>
                <div className="mt-3 space-y-2 text-sm text-neutral-400">
                  <p>Most payment details</p>
                  <p>Payer identity</p>
                  <p>Unrelated wallet history</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {proofs.map((proof) => (
              <div key={proof.title} className="rounded-[2rem] border flex items-center gap-4  p-6 backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-full  bg-primary/10 text-neutral-100">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{proof.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">{proof.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
