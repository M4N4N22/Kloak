import Link from "next/link"
import { Bot, Link2, ShieldCheck, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"

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
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-zinc-400 sm:text-lg">
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

        <div className="rounded-[2.75rem] border p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="rounded-[2.2rem] border  p-5 sm:p-7">
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[2rem] border  p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase text-primary">Payment link</p>
                  <div className="rounded-full border border-foreground/10 px-3 py-1 text-xs font-semibold uppercase  text-zinc-400">
                    shareable
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Share the payment page.
                    <br />
                    Keep the payment private.
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-foreground/5 bg-foreground/[0.02] p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full  bg-primary/10 text-primary">
                          <Link2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Request</p>
                          <p className="text-xs text-zinc-500">Payment link</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-foreground/5 bg-foreground/[0.02] p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full  bg-primary/10 text-primary">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Settle</p>
                          <p className="text-xs text-zinc-500">Private</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[2rem] border border-foreground/5 bg-foreground/[0.02] p-5">
                    <p className="text-sm text-zinc-500">Proof package</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">Share only what needs to be shared.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="rounded-full border border-foreground/10 px-3 py-1 text-[10px] font-bold uppercase  text-zinc-400">Basic</div>
                      <div className="rounded-full border border-foreground/10 px-3 py-1 text-[10px] font-bold uppercase  text-zinc-400">Amount</div>
                      <div className="rounded-full border border-foreground/10 px-3 py-1 text-[10px] font-bold uppercase  text-zinc-400">Threshold</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Operator layer</p>
                    <div className="flex items-center gap-2">
                      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-2 text-zinc-300">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-2 text-zinc-300">
                        <Webhook className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    <p className="text-2xl font-semibold tracking-tight text-foreground">Works with the tools around you.</p>
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-foreground/5  px-4 py-3 text-sm text-zinc-300">Get paid alerts in Telegram</div>
                      <div className="rounded-2xl border border-foreground/5 px-4 py-3 text-sm text-zinc-300">Send payment events to your backend</div>
                      <div className="rounded-2xl border border-foreground/5  px-4 py-3 text-sm text-zinc-300">Connect your existing workflows</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border  p-6">
                  <p className="text-sm text-primary">Truthful privacy</p>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    The page can be public.
                    <br />
                    The payer does not have to be.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
