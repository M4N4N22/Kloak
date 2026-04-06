import { NextResponse } from "next/server"
import { listSelectiveDisclosureProofs } from "@/lib/services/selective-disclosure.service"
import {
  COMPLIANCE_READ_SCOPE,
  isComplianceAccessError,
  verifyComplianceAccessRequest,
} from "@/lib/compliance-access"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const viewer = await verifyComplianceAccessRequest(body, COMPLIANCE_READ_SCOPE)

    const proofs = await listSelectiveDisclosureProofs(viewer)
    return NextResponse.json({ proofs })
  } catch (error: unknown) {
    console.error("Proof list error:", error)

    if (isComplianceAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to load proofs" }, { status: 500 })
  }
}
