import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Product Story", href: "#story" },
  { label: "Selective Disclosure", href: "#selective-disclosure" },
  { label: "Operations", href: "#operations" },
  { label: "Privacy Boundary", href: "#privacy-boundary" },
]

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/5 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-foreground/10 bg-zinc-900/80 text-[11px] font-bold tracking-[0.24em] text-primary">
            KL
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">Kloak</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Private Payment Ops
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/payment-links" className="hidden sm:block">
            <Button
              variant="outline"
              className="rounded-full border-foreground/10 bg-foreground/[0.02] text-foreground hover:bg-foreground/[0.05]"
            >
              Explore Product
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-full px-5 text-black">
              Open Dashboard
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
