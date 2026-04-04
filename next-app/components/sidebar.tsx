"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState } from "react"

import {
  LayoutDashboard,
  Link2,
  ShieldCheck,
  Wallet,
  Bot,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type SidebarItem = {
  name: string
  href: string
  disabled?: boolean
}

type SidebarSection = {
  heading: string
  icon: LucideIcon
  badge?: string
  items: SidebarItem[]
}

const sections: SidebarSection[] = [
  {
    heading: "Overview",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "Private Payments",
    icon: Link2,
    badge: "Featured",
    items: [
      { name: "Payment Links", href: "/payment-links" },
    ],
  },
  {
    heading: "Automation",
    icon: Bot,
    items: [
      { name: "Telegram Bot", href: "/bots" },
      { name: "Webhooks", href: "/webhooks" },
      { name: "Integrations", href: "/automation" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Compliance",
    icon: ShieldCheck,
    badge: "Featured",
    items: [
      { name: "Selective Disclosure", href: "/compliance" },
      { name: "Salary proof", href: "/salary-proof", disabled: true },
      { name: "Tax reporting", href: "/tax-reporting", disabled: true },
      { name: "DAO auditing", href: "/dao-auditing", disabled: true },
      { name: "Grant verification", href: "/grant-verification", disabled: true },
    ],
  },
  {
    heading: "System",
    icon: Wallet,
    items: [
      { name: "Wallet", href: "/wallet", disabled: true },
      { name: "Settings", href: "/settings", disabled: true },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 h-screen p-2  w-1/5  flex flex-col  shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)]  overflow-hidden bg-black">

      {/* Brand Header */}
      <Link href="/">
        <div className=" flex items-center p-5 shrink-0">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-br from-primary via-green-400 to-emerald-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Image
              src="/kloak_logo.png"
              alt="Kloak"
              height={32}
              width={32}
              className="relative rounded-full border border-white/10"
            />
          </div>
          <span className="font-bold tracking-tight text-3xl  text-white">
            loak
          </span>
        </div></Link>

      {/* Navigation Scroll Area */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
        {sections.map((section) => (
          <SidebarGroup
            key={section.heading}
            section={section}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Dynamic Footer Status */}
      <div className="p-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 ">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-linear-to-br from-primary via-green-400 to-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-linear-to-br from-primary via-green-400 to-emerald-400"></span>
          </div>
          <span className="text-[10px]  tracking-widest text-foreground">
            <span className="text-primary">Aleo</span>  Testnet
          </span>
        </div>
      </div>
    </aside>
  )
}

function SidebarGroup({ section, pathname }: { section: SidebarSection, pathname: string }) {
  const hasActive = section.items.some(item => item.href === pathname)
  const [open, setOpen] = useState(hasActive)
  const Icon = section.icon
  const badgeStyles: Record<string, string> = {
    Featured: "text-primary ",
    Flagship: "text-fuchsia-400 ",
    Soon: "text-muted-foreground ",
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="space-y-1"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full px-1 py-2 rounded-xl transition-all duration-200  group text-left">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            hasActive ? "bg-flagship-gradient text-primary-foreground" : "bg-transparent text-muted-foreground group-hover:text-foreground"
          )}>
            <Icon size={18} strokeWidth={hasActive ? 2 : 1.8} />
          </div>
          <span className={cn(
            "text-sm font-medium tracking-wide transition-colors",
            hasActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {section.heading}
          </span>
          {section.badge && (
            <span
              className={cn(
                "text-[8px]  rounded-md font-bold uppercase tracking-wide mt-1",
                badgeStyles[section.badge] || badgeStyles.Soon
              )}
            >
              {section.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-foreground/50 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)]",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
        <div className="ml-4.5 mt-1 space-y-1 relative border-l-2 border-white/10 px-6">
          {section.items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative block text-sm py-2 px-3 rounded-xl transition-all duration-200 ",
                  item.disabled ? "opacity-30 cursor-not-allowed" : "hover:translate-x-1",
                  active
                    ? "text-primary-foreground font-medium bg-linear-to-br from-primary via-green-400 to-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    : "text-muted-foreground hover:text-white"
                )}
              >

                {item.name}
              </Link>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
