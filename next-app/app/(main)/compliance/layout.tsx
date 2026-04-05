import type { ReactNode } from "react"

import { ComplianceShell } from "@/features/compliance/components/compliance-shell"

export default function ComplianceLayout({ children }: { children: ReactNode }) {
  return <ComplianceShell>{children}</ComplianceShell>
}
