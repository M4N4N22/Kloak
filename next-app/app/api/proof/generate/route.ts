import { NextResponse } from "next/server"
import {
  finalizeSelectiveDisclosureProof,
  isSelectiveDisclosureError,
  prepareSelectiveDisclosureProof,
} from "@/lib/services/selective-disclosure.service"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (body.mode === "prepare") {
      const prepared = await prepareSelectiveDisclosureProof(body)
      return NextResponse.json(prepared)
    }

    if (body.mode === "finalize") {
      const proof = await finalizeSelectiveDisclosureProof(body)
      return NextResponse.json(proof)
    }

    return NextResponse.json({ error: "mode must be prepare or finalize" }, { status: 400 })
  } catch (error: unknown) {
    console.error("Proof generate error:", error)

    if (isSelectiveDisclosureError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: "Failed to generate proof" }, { status: 500 })
  }
}
