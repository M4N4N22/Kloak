import { NextRequest, NextResponse } from "next/server"
import {
  COMPLIANCE_READ_SCOPE,
  isComplianceAccessError,
  verifyComplianceAccessRequest,
} from "@/lib/compliance-access"
import {
  isSelectiveDisclosureError,
  revokeSelectiveDisclosureProof,
} from "@/lib/services/selective-disclosure.service"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ proofId: string }> },
) {
  try {
    const { proofId } = await params
    const body = await req.json()
    const actorAddress = await verifyComplianceAccessRequest(body, COMPLIANCE_READ_SCOPE)

    const proof = await revokeSelectiveDisclosureProof({
      proofId,
      actorAddress,
    })

    return NextResponse.json(proof)
  } catch (error: unknown) {
    console.error("Proof revoke error:", error)

    if (isComplianceAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isSelectiveDisclosureError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to revoke proof" }, { status: 500 })
  }
}
