import Link from "next/link"

import { cn } from "@/lib/utils"

const TRUST_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security" },
  { label: "Support", href: "/support" },
] as const

type TrustLinksRowProps = {
  className?: string
  linkClassName?: string
  tone?: "muted" | "strong"
}

export function TrustLinksRow({
  className,
  linkClassName,
  tone = "muted",
}: TrustLinksRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs",
        tone === "muted" ? "text-zinc-500" : "text-zinc-300",
        className,
      )}
    >
      {TRUST_LINKS.map((link, index) => (
        <div key={link.href} className="flex items-center gap-4">
          <Link
            href={link.href}
            className={cn(
              "transition-colors hover:text-foreground",
              tone === "muted" ? "text-zinc-500" : "text-zinc-300",
              linkClassName,
            )}
          >
            {link.label}
          </Link>
          {index < TRUST_LINKS.length - 1 ? <span className="text-zinc-700">/</span> : null}
        </div>
      ))}
    </div>
  )
}
