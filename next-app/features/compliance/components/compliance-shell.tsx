import type { ReactNode } from "react"

import { ComplianceSidebar } from "./compliance-sidebar"

export function ComplianceShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-7rem)] ">
      <div className="mx-auto grid  gap-6  lg:grid-cols-[300px_minmax(0,1fr)] ">
        <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-3rem)]">
          <ComplianceSidebar />
        </div>

        <main className="min-w-0 rounded-[36px]   xl:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
