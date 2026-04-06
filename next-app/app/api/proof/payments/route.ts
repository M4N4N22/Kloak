import { NextResponse } from "next/server"
import { listCompliancePayments } from "@/lib/services/selective-disclosure.service"
import {
  COMPLIANCE_READ_SCOPE,
  isComplianceAccessError,
  verifyComplianceAccessRequest,
} from "@/lib/compliance-access"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const viewer = await verifyComplianceAccessRequest(body, COMPLIANCE_READ_SCOPE)
    const walletReceipts = Array.isArray(body.walletReceipts) ? body.walletReceipts : []

    const payments = await listCompliancePayments(viewer, walletReceipts)
    return NextResponse.json(payments)
  } catch (error: unknown) {
    console.error("Compliance payments list error:", error)

    if (isComplianceAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to load compliance payments" }, { status: 500 })
  }
}
