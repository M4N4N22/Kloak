import Link from "next/link"
import { Button } from "@/components/ui/button"

import HeroImages from "@/components/hero-carousel"

import Image from "next/image"
export default function Home() {


  return (
    <div className="min-h-screen  text-foreground font-sans selection:bg-primary/30 selection:text-primary">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src="/bg-image.jpg"
          alt="Aurora background"
          fill
          priority
          className="object-cover blur-xl rotate opacity-50"
        />
      </div>


      {/* --- HERO SECTION --- */}
      <section className="relative pt-28 pb-0 px-6 ">
        <div className=" text-center mx-auto">
          <div className="flex flex-col gap-16 justify-center items-center">
            <div className="">
              <div className="inline-flex items-center gap-2  rounded-full text-xs font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-foreground/5 ">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-linear-to-br from-primary via-green-400 to-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-linear-to-br from-primary via-green-400 to-emerald-400"></span>
                  </div>
                  <span className="text-sm  tracking-widest text-foreground">
                    Live on  <span className="text-primary">Aleo</span>  Testnet
                  </span>
                </div>
              </div>


              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-foreground">
                Privacy is <br />
                <span className="text-transparent bg-clip-text bg-linear-to-b from-foreground to-foreground/40">Programmable.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                Confidential payroll, payment links, and reward distribution.
                Powered by Zero-Knowledge proofs, delivered in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button size={"lg"} >
                    Get Started
                  </Button>
                </Link>

                <a href="https://youtu.be/b1AdffOf_PM" target="_blank" rel="noopener">
                  <Button size={"lg"} variant={"secondary"} >
                    Watch Demo
                  </Button>
                </a>
              </div>

            </div>
            <HeroImages />
          </div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section id="features" className="py-24 px-6 relative bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-[0.2em] text-primary mb-2">
              Core Infrastructure
            </h2>
            <h3 className="text-4xl tracking-tight text-foreground">
              Everything you need to go private.
            </h3>
          </div>

          <div className="grid md:grid-cols-6 gap-1">

            {/* MAIN FEATURE — CAMPAIGNS */}

            <Link href={"/payment-links"} className="md:col-span-4 hover:bg-green-700 p-8 rounded-tl-[2.5rem] rounded-b-2xl rounded-tr-2xl bg-foreground/5 flex flex-col justify-between min-h-75 group hover:border-primary/50 transition-colors relative">

              <div>
                <h4 className="text-3xl text-foreground mb-2">
                 Private Payment Links
                </h4>

                <p className="text-foreground/70 max-w-sm">
                   Share a payment link and receive funds privately without exposing balances or transaction history.
                </p>
              </div>

              {/* Hover CTA */}
              <div className="absolute bottom-8 right-8 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                <span className="text-sm text-foreground flex items-center gap-2">
                  Create Payment Link
                  <span className="text-lg">↗</span>
                </span>
              </div>

            </Link>


            {/* PAYMENT LINKS */}
            <Link href={"/bots"} className="md:col-span-2 p-8 rounded-tr-[2.5rem] hover:bg-blue-700 rounded-b-2xl rounded-tl-2xl bg-foreground/5 flex flex-col justify-between group hover:border-primary/50 transition-colors relative">

              <div>
                <h4 className="text-3xl text-foreground mb-2">
                  Access Kloak Telegram Bot
                </h4>

                <p className="text-sm text-foreground/70">
                  Interact with Kloak's Telegram bot to manage your private payment links, get analytics and payment notifications.
                </p>
              </div>

              {/* Hover CTA */}
              <div className="absolute bottom-8 right-8 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                <span className="text-sm text-foreground flex items-center gap-2">
                  Open Telegram Bot
                  <span className="text-lg">↗</span>
                </span>
              </div>

            </Link>


            {/* Small Cards */}

            <div className="md:col-span-2 p-8 rounded-bl-[2.5rem] hover:bg-pink-700 rounded-tl-2xl rounded-r-2xl bg-foreground/5 group hover:border-primary/50 transition-colors flex flex-col justify-between">
              <h4 className="text-2xl text-foreground mb-12">
                Selective Disclosure
              </h4>

              <p className="text-sm text-foreground/70">
                Prove payments to auditors without revealing your entire wallet history.
              </p>
            </div>


            <div className="md:col-span-2 p-8 hover:bg-fuchsia-700 rounded-2xl bg-foreground/5 group hover:border-primary/50 transition-colors flex flex-col justify-between">
              <h4 className="text-2xl text-foreground mb-12">
                Webhooks
              </h4>

              <p className="text-sm text-foreground/70">
                Get real-time notifications of incoming payments to automate workflows and trigger actions.
              </p>
            </div>


            <div className="md:col-span-2 p-8 rounded-br-[2.5rem] hover:bg-lime-700 rounded-t-2xl rounded-bl-2xl bg-foreground/5 group hover:border-primary/50 transition-colors flex flex-col justify-between">
              <h4 className="text-2xl text-foreground mb-12">
                Automation Ready
              </h4>

              <p className="text-sm text-foreground/70">
                Programmatic APIs for bots and autonomous agents to handle finance.
              </p>
            </div>

          </div>
        </div>
      </section >
      {/* --- CTA SECTION --- */}
      < section className="py-32 px-6 bg-black/70" >
        <div className="max-w-4xl shadow-xl mx-auto p-12 rounded-[3rem]  bg-linear-to-br from-primary via-green-400 to-emerald-400 relative overflow-hidden text-center shadow-primary/20">

          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-6">
            Ready to shield your <br /> financial operations?
          </h2>
          <Link href="/dashboard">
            <Button variant={"secondary"} size="lg" className="bg-black">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </section >

      {/* --- FOOTER --- */}
      < footer className="py-20 px-6 border-t border-foreground/5 bg-black" >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tighter text-foreground">KLOAK</span>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Building the privacy layer for the future of on-chain finance on Aleo.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <FooterGroup title="Product" links={["Features", "Demo", "Dashboard"]} />
            <FooterGroup title="Developers" links={["Docs", "GitHub", "Audits"]} />
            <FooterGroup title="Legal" links={["Privacy", "Terms"]} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground">
          <p>© 2026 KLOAK LABS INC. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-2 italic">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Privacy by Default
          </p>
        </div>
      </footer >
    </div >
  )
}

function FooterGroup({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">{title}</h4>
      <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
        {links.map(l => <Link key={l} href="#" className="hover:text-primary transition-colors">{l}</Link>)}
      </div>
    </div>
  )
}
