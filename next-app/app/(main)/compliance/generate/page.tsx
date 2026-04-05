import { ComplianceAccessGate } from "@/features/compliance/components/compliance-access-gate"
import { GenerateProofSection } from "@/features/compliance/sections/generate-proof-section"

export default function ComplianceGeneratePage() {
  return (
    <ComplianceAccessGate>
      <GenerateProofSection />
    </ComplianceAccessGate>
  )
}
