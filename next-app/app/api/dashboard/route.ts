import { NextRequest, NextResponse } from "next/server"

import {
  CREATOR_READ_SCOPE,
  isCreatorAccessError,
  verifyCreatorAccessRequest,
} from "@/lib/creator-access"
import { getDashboardOverview } from "@/lib/services/dashboard.service"

export async function GET(req: NextRequest) {
  try {
    const creator = await verifyCreatorAccessRequest(
      {
        viewerAddress: req.nextUrl.searchParams.get("viewerAddress") || undefined,
        scope: req.nextUrl.searchParams.get("scope") || undefined,
        issuedAt: req.nextUrl.searchParams.get("issuedAt") || undefined,
        signature: req.nextUrl.searchParams.get("signature") || undefined,
      },
      CREATOR_READ_SCOPE,
    )

    const overview = await getDashboardOverview(creator)
    return NextResponse.json(overview)
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("Dashboard overview error:", error)
    return NextResponse.json({ error: "Failed to load dashboard overview" }, { status: 500 })
  }
}
