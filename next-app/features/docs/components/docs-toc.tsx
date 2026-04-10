"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type DocsTocItem = {
  id: string
  label: string
}

export function DocsToc({ items }: { items: DocsTocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node))

    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-120px 0px -65% 0px",
        threshold: [0, 1],
      },
    )

    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [items])

  return (
    <aside className="">
      <div className="sticky top-24 rounded-[2rem]  p-4 backdrop-blur-xl">
        <p className="px-2 text-[11px] font-semibold  text-zinc-500">On this page</p>
        <nav className="mt-3 space-y-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm transition-colors",
                activeId === item.id
                  ? " text-primary"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
