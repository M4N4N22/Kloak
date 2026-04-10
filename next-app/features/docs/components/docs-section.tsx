import Link from "next/link"
import { Link2 } from "lucide-react"
import type { ReactNode } from "react"

type DocsSectionProps = {
  id?: string
  title: string
  description?: string
  children: ReactNode
}

export function DocsSection({ id, title, description, children }: DocsSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 p-4">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
          
        </div>
        {description ? <p className="max-w-3xl mt-1 text-sm leading-7 text-neutral-400">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}
