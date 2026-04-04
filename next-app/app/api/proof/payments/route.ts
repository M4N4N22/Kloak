import { NextRequest, NextResponse } from "next/server"
import { listCompliancePayments } from "@/lib/services/selective-disclosure.service"

export async function GET(req: NextRequest) {
  try {
    const viewer = req.nextUrl.searchParams.get("viewer")?.trim()

    if (!viewer) {
      return NextResponse.json({ error: "viewer is required" }, { status: 400 })
    }

    const payments = await listCompliancePayments(viewer)
    return NextResponse.json(payments)
  } catch (error: unknown) {
    console.error("Compliance payments list error:", error)
    return NextResponse.json({ error: "Failed to load compliance payments" }, { status: 500 })
  }
}
