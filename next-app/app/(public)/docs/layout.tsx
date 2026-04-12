import type { ReactNode } from "react"

import { DocsSidebar } from "@/features/docs/components/docs-sidebar"

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full px-6"> {/* add horizontal padding instead of centering */}
      <div className="grid items-start gap-8 lg:grid-cols-[240px_1fr]">
        
        <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-3rem)]">
          <DocsSidebar />
        </div>

        {/* Main content */}
  <div className="min-w-0 w-full space-y-6">
  {children}
</div>
      </div>
    </div>
  )
}
