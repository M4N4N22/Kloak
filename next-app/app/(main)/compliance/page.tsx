import { ComplianceAccessGate } from "@/features/compliance/components/compliance-access-gate"
import { OverviewSection } from "@/features/compliance/sections/overview-section"

export default function ComplianceOverviewPage() {
  return (
    <ComplianceAccessGate>
      <OverviewSection />
    </ComplianceAccessGate>
  )
}
