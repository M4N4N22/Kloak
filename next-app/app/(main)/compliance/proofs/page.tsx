import { ComplianceAccessGate } from "@/features/compliance/components/compliance-access-gate"
import { GeneratedProofsSection } from "@/features/compliance/sections/generated-proofs-section"

export default function ComplianceProofsPage() {
  return (
    <ComplianceAccessGate requiresSignedAccess>
      <GeneratedProofsSection />
    </ComplianceAccessGate>
  )
}
