import type { ReactNode } from "react"

import { DocsSidebar } from "@/features/docs/components/docs-sidebar"
import { DocsTopNav } from "@/features/docs/components/docs-top-nav"

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
   
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-3rem)]">
          <DocsSidebar />
        </div>
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  )
}
