"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { DOCS_NAV_ITEMS } from "@/features/docs/lib/docs-nav"
import { cn } from "@/lib/utils"

export function DocsSidebar() {
  const pathname = usePathname()
  const groupedItems = DOCS_NAV_ITEMS.reduce<Record<string, typeof DOCS_NAV_ITEMS>>((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = []
    }
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <aside className=" p-4 backdrop-blur-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto ">

      <nav className="space-y-5">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <p className="px-2 text-xs text-zinc-500">{group}</p>
            <div className="space-y-2">
              {items.map((item) => {
               
                const active = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-[1.5rem] text-foreground px-2 py-1 transition-colors",
                      active
                        ? " text-primary"
                        : " text-primary",
                    )}
                  >
                    <div className="flex items-start gap-3">
                     
                      <div className="space-y-1">
                        <p className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>
                          {item.title}
                        </p>
                      
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
