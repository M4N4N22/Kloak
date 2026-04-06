"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart3, LayoutDashboard, Link2, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { href: "/payment-links", label: "Overview", icon: LayoutDashboard },
  { href: "/payment-links/create", label: "Create Link", icon: PlusCircle },
  { href: "/payment-links/links", label: "Created Links", icon: Link2 },
  { href: "/payment-links/analytics", label: "Analytics", icon: BarChart3 },
]

export function PaymentLinksSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col p-4 ">
      <nav className="flex-1 space-y-1">
        <p className="px-4 text-sm text-neutral-500 mb-4">Menu</p>
        {items.map((item) => {
          const Icon = item.icon
          const active =
            item.href === "/payment-links"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-l from-transparent to-primary/10 text-primary shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
                  : "text-neutral-500 hover:bg-foreground/5 hover:text-neutral-200",
              )}
            >
              {active ? <div className="absolute left-0 h-5 w-1 rounded-r-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> : null}

              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-neutral-600 group-hover:text-neutral-300",
                )}
              />

              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-4 px-2">
        <div className="rounded-2xl border border-foreground/5 bg-neutral-900/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-neutral-300">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-tight">Payment Links</span>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-500">
            Create links, track performance, keep payer identity private, and turn payments into proofs when needed.
          </p>
        </div>

        <div className="flex items-center justify-between px-2 font-mono text-[10px] text-neutral-600">
          <span>links-v4</span>
          <span className="text-emerald-700">o</span>
        </div>
      </div>
    </aside>
  )
}
