"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShieldCheck, FileStack, SearchCheck, Fingerprint, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/compliance", label: "Overview", icon: LayoutDashboard },
  { href: "/compliance/generate", label: "Generate Proof", icon: ShieldCheck },
  { href: "/compliance/proofs", label: "Generated Proofs", icon: FileStack },
  { href: "/compliance/verify", label: "Verify Proof", icon: SearchCheck },
]

export function ComplianceSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col p-4">
     

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="px-4 text-sm text-neutral-500 mb-4">
      Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-l from-transparent to-primary/10 text-primary shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
                  : "text-neutral-500 hover:bg-foreground/5 hover:text-neutral-200"
              )}
            >
              {/* Active Indicator Bar */}
              {active && (
                <div className="absolute left-0 h-5 w-1 rounded-r-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              )}
              
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                active ? "text-primary" : "text-neutral-600 group-hover:text-neutral-300"
              )} />
              
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info Area */}
      <div className="mt-auto space-y-4 px-2">
        <div className="rounded-2xl bg-neutral-900/50 p-4 border border-foreground/5">
          <div className="flex items-center gap-2 mb-2 text-neutral-300">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-tight">Privacy Model</span>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-500">
            Selective Disclosure v1.2.4-PROD<br />
            Circuit-level audit trails enabled.
          </p>
        </div>
        
        <div className="flex items-center justify-between px-2 text-[10px] text-neutral-600 font-mono">
          <span>v1.2.4-PROD</span>
        </div>
      </div>
    </aside>
  )
}