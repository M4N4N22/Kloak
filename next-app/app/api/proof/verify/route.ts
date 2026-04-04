import { NextResponse } from "next/server"
import {
  isSelectiveDisclosureError,
  verifySelectiveDisclosureProof,
} from "@/lib/services/selective-disclosure.service"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await verifySelectiveDisclosureProof(body)
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error("Proof verify error:", error)

    if (isSelectiveDisclosureError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to verify proof" }, { status: 500 })
  }
}
