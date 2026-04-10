import { NextResponse } from "next/server"

import {
  CREATOR_READ_SCOPE,
  CREATOR_WRITE_SCOPE,
  isCreatorAccessError,
  verifyCreatorAccessRequest,
} from "@/lib/creator-access"
import {
  activateProPlan,
  getCreatorProfile,
} from "@/lib/services/creator-profile.service"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = await verifyCreatorAccessRequest(
      {
        viewerAddress: searchParams.get("viewerAddress") || undefined,
        scope: searchParams.get("scope") || undefined,
        issuedAt: searchParams.get("issuedAt") || undefined,
        signature: searchParams.get("signature") || undefined,
      },
      CREATOR_READ_SCOPE,
    )

    const profile = await getCreatorProfile(walletAddress)

    return NextResponse.json(profile)
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch creator profile" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const walletAddress = await verifyCreatorAccessRequest(body, CREATOR_WRITE_SCOPE)

    const profile = await activateProPlan(walletAddress)

    return NextResponse.json(profile)
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate pro plan" },
      { status: 500 }
    )
  }
}
