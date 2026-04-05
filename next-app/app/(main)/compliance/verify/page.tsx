import { ComplianceAccessGate } from "@/features/compliance/components/compliance-access-gate"
import { VerifyProofSection } from "@/features/compliance/sections/verify-proof-section"

export default function ComplianceVerifyPage() {
  return (
    <ComplianceAccessGate>
      <VerifyProofSection />
    </ComplianceAccessGate>
  )
}
