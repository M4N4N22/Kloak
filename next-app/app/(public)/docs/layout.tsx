import type { ReactNode } from "react"

import { DocsSidebar } from "@/features/docs/components/docs-sidebar"

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full  space-y-6">
   
      <div className="grid items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-3rem)]">
          <DocsSidebar />
        </div>
        <div className="min-w-0 mx-auto space-y-6 ">{children}</div>
      </div>
    </div>
  )
}
