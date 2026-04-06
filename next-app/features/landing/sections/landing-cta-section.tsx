import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingCtaSection() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2.75rem]   p-8 text-center sm:p-12">
          <div className="space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Build with Kloak</p>
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Private settlement.
              <br />
              Selective disclosure.
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Start with a link. Stay in control after the payment arrives.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="w-full rounded-full px-6 text-black sm:w-auto">
                Open dashboard
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/payment-links">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-foreground/10 bg-black/20 text-foreground hover:bg-black/30 sm:w-auto"
              >
                Create payment link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
