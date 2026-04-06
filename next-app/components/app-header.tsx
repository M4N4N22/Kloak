"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { WalletConnect } from "@/components/wallet-connect"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

/* ------------------ NAV CONFIG ------------------ */

const NAV_ITEMS = [
  { href: "/payment-links", label: "Payment Links" },
  { href: "/compliance", label: "Compliance Ledger" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/bots", label: "Telegram Bot" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/automation", label: "Automation" },
  { href: "/pricing", label: "Pricing" },
]

/* ------------------ REUSABLE ITEM ------------------ */

function NavItem({
  href,
  label,
  pathname,
}: {
  href: string
  label: string
  pathname: string
}) {
  const active = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        className={cn(
          navigationMenuTriggerStyle(),
          active && "bg-transparent text-primary"
        )}
      >
        <Link className="" href={href}>{label}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

/* ------------------ HEADER ------------------ */

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 inset-x-0 z-50  ">
      <div className="mx-auto flex  items-center justify-between gap-4  bg-gradient-to-b from-black via-black/70 to-transparent  py-3 px-8 ">

        {/* LOGO */}
        <Link href="/" className="flex items-center shrink-0">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-linear-to-br from-primary via-green-400 to-emerald-400 blur opacity-25 group-hover:opacity-50" />
            <Image
              src="/kloak_logo.png"
              alt="Kloak"
              height={36}
              width={36}
              className="relative rounded-full border border-foreground/10"
            />
          </div>
          <span className="text-3xl font-bold tracking-tight">loak</span>
        </Link>

        {/* NAV */}
        <div className="hidden lg:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList>

              {/* AUTO-GENERATED NAV ITEMS */}
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                />
              ))}

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          <WalletConnect />
        </div>

      </div>
    </header>
  )
}
