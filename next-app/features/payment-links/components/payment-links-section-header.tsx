import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

export function PaymentLinksSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-3">
        <Badge variant={"secondary"}>{eyebrow}</Badge>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">{description}</p>
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
