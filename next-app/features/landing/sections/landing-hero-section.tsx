import Link from "next/link"
import { Bot, Link2, ShieldCheck, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const heroStats = [
  { label: "Core", value: "Payment links + proofs" },
  { label: "Settlement", value: "Private by default" },
  { label: "Tools", value: "Telegram, webhooks, automation" },
]

export function LandingHeroSection() {
  return (
    <section className="px-6 pb-18 pt-14 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs border text-primary">
            Live on Aleo testnet
          </div>

          <div className="space-y-5">
            <h1 className="mx-auto max-w-5xl text-5xl font-light tracking-tighter text-foreground sm:text-7xl xl:text-[6.2rem]">
              Settle Privately.
              <br />
              <span className="opacity-50">Disclose Selectively.</span>
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-neutral-400 sm:text-lg">
              Create a payment link, get paid privately, and share a proof only when you need to.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/payment-links">
              <Button size="lg" className="w-full  sm:w-auto">
                Create payment link

              </Button>
            </Link>
            <Link href="/compliance">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Explore selective disclosure
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 z-20 bg-gradient-to-t from-background via-background to-transparent" />
          <div className="rounded-[2rem]  bg-flagship-gradient  ">
            <div className="relative overflow-hidden rounded-[2rem] border-8  ">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 " />
              <Image
                src="/landing/dashboard1.png"
                alt="Private payments dashboard preview"
                width={1600}
                height={1000}
                priority
                className="h-auto w-full object-cover transition-transform duration-700 ease-out   "
              />

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
