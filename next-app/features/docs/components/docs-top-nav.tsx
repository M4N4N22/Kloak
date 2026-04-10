"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Command, Github, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DOCS_NAV_ITEMS } from "@/features/docs/lib/docs-nav"
import { KLOAK_FAQ_ITEMS } from "@/features/trust/lib/faq"

const quickLinks = [
  { label: "Get Started", href: "/docs" },
  { label: "Verification", href: "/docs/verification" },
  { label: "Ops", href: "/docs/operations" },
] as const

export function DocsTopNav() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) {
      return {
        guides: DOCS_NAV_ITEMS.filter((item) => item.href !== "/docs").slice(0, 5),
        faq: KLOAK_FAQ_ITEMS.slice(0, 4),
      }
    }

    return {
      guides: DOCS_NAV_ITEMS.filter((item) =>
        `${item.title} ${item.description}`.toLowerCase().includes(trimmed),
      ),
      faq: KLOAK_FAQ_ITEMS.filter((item) =>
        `${item.question} ${item.answer}`.toLowerCase().includes(trimmed),
      ).slice(0, 6),
    }
  }, [query])

  return (
    <section className="sticky top-16 z-30 rounded-[2rem] border border-foreground/8 bg-black/70 px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/docs" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-foreground/10 bg-zinc-950 text-[11px] font-bold tracking-[0.24em] text-primary">
              KL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">Kloak Docs</p>
              <p className="text-[11px] text-zinc-500">Guides, trust model, and verification</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[160px] justify-between rounded-full border-foreground/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search docs
                  </span>
                  <span className="hidden items-center gap-1 rounded-full border border-foreground/10 px-2 py-0.5 text-[11px] text-zinc-500 sm:flex">
                    <Command className="h-3 w-3" />K
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl gap-5 p-0">
                <div className="border-b border-foreground/8 p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Search docs</DialogTitle>
                    <DialogDescription>
                      Find guides, topics, and common answers across the Kloak docs surface.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search payment links, proofs, verification, webhooks..."
                    className="mt-4 h-12 rounded-2xl border-foreground/10 bg-white/[0.03]"
                  />
                </div>

                <div className="grid gap-6 px-6 pb-6 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Guides</p>
                    <div className="space-y-2">
                      {searchResults.guides.map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            setOpen(false)
                            setQuery("")
                            router.push(item.href)
                          }}
                          className="w-full rounded-[1.25rem] border border-foreground/8 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-foreground/12 hover:bg-white/[0.04]"
                        >
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">{item.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Popular questions</p>
                    <div className="space-y-2">
                      {searchResults.faq.map((item) => (
                        <button
                          key={item.question}
                          type="button"
                          onClick={() => {
                            setOpen(false)
                            setQuery("")
                            router.push("/docs#faq")
                          }}
                          className="w-full rounded-[1.25rem] border border-foreground/8 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-foreground/12 hover:bg-white/[0.04]"
                        >
                          <p className="text-sm font-medium text-foreground">{item.question}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{item.answer}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="https://github.com/M4N4N22/Kloak" target="_blank" rel="noreferrer" className="hidden sm:block">
              <Button variant="outline" className="rounded-full border-foreground/10 bg-white/[0.03]">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-full text-black">
                Open app
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full border-foreground/10 bg-white/[0.03] text-zinc-300">
            April 2026 docs
          </Badge>
          <Badge variant="secondary" className="rounded-full border-foreground/10 bg-white/[0.03] text-zinc-300">
            Chain-first verification
          </Badge>
          <Badge variant="secondary" className="rounded-full border-foreground/10 bg-white/[0.03] text-zinc-300">
            Private settlement
          </Badge>
        </div>
      </div>
    </section>
  )
}
