import { NextRequest, NextResponse } from "next/server"
import { listSelectiveDisclosureProofs } from "@/lib/services/selective-disclosure.service"

export async function GET(req: NextRequest) {
  try {
    const viewer = req.nextUrl.searchParams.get("viewer")?.trim()

    if (!viewer) {
      return NextResponse.json({ error: "viewer is required" }, { status: 400 })
    }

    const proofs = await listSelectiveDisclosureProofs(viewer)
    return NextResponse.json({ proofs })
  } catch (error: unknown) {
    console.error("Proof list error:", error)
    return NextResponse.json({ error: "Failed to load proofs" }, { status: 500 })
  }
}
