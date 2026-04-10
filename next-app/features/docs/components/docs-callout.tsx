import type { ReactNode } from "react"
import { Info } from "lucide-react"

type DocsCalloutProps = {
  title: string
  children: ReactNode
}

export function DocsCallout({ title, children }: DocsCalloutProps) {
  return (
    <div className="bg-foreground/2 border rounded-3xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className=" mt-1">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <div className="text-sm leading-7 text-neutral-300">{children}</div>
        </div>
      </div>
    </div>
  )
}
