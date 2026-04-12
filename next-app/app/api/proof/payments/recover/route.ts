import { NextResponse } from "next/server"
import { recoverCompliancePayment, isSelectiveDisclosureError } from "@/lib/services/selective-disclosure.service"
import {
  COMPLIANCE_READ_SCOPE,
  isComplianceAccessError,
  verifyComplianceAccessRequest,
} from "@/lib/compliance-access"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const viewer = await verifyComplianceAccessRequest(body, COMPLIANCE_READ_SCOPE)
    const recoveredPayment = await recoverCompliancePayment({
      viewerAddress: viewer,
      walletReceipt: body.walletReceipt ?? {},
      txHash: typeof body.txHash === "string" ? body.txHash : "",
    })

    return NextResponse.json(recoveredPayment)
  } catch (error: unknown) {
    console.error("Compliance payment recovery error:", error)

    if (isComplianceAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isSelectiveDisclosureError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to recover payment" }, { status: 500 })
  }
}
