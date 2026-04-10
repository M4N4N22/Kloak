"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { AppHeader } from "@/components/app-header"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideHeader = pathname.startsWith("/pay/")

  return (
    <div className="relative min-h-screen">
      {!hideHeader ? <AppHeader /> : null}
      <div className={cn(!hideHeader && "pt-16")}>{children}</div>
    </div>
  )
}
