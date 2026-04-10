import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DocsBreadcrumbs } from "@/features/docs/components/docs-breadcrumbs"
import { DocsToc, type DocsTocItem } from "@/features/docs/components/docs-toc"
import Link from "next/link"

type DocsArticleShellProps = {
  breadcrumbs: { label: string; href?: string }[]
  eyebrow: string
  title: string
  description: string
  toc: DocsTocItem[]
  children: ReactNode
  versionBadge?: string
  primaryAction?: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
}

export function DocsArticleShell({
  breadcrumbs,
  eyebrow,
  title,
  description,
  toc,
  children,
  versionBadge = "Updated April 2026",
  primaryAction,
  secondaryAction,
}: DocsArticleShellProps) {
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0 space-y-6">
        <section className=" bg-black/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <DocsBreadcrumbs items={breadcrumbs} />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">
              {versionBadge}
            </Badge>
            <Badge variant="secondary">
              {eyebrow}
            </Badge>
          </div>

          <div className="mt-5 max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
            <p className="text-sm leading-7 text-neutral-400 sm:text-base">{description}</p>
          </div>

          {(primaryAction || secondaryAction) ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {primaryAction ? (
                <Link href={primaryAction.href}>
                  <Button >{primaryAction.label}</Button>
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link href={secondaryAction.href}>
                  <Button variant="outline" >
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>

        {children}
      </div>

      <DocsToc items={toc} />
    </div>
  )
}
