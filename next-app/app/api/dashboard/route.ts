import { NextRequest, NextResponse } from "next/server"
import type { Token } from "@prisma/client"

import {
  CREATOR_READ_SCOPE,
  isCreatorAccessError,
  verifyCreatorAccessRequest,
} from "@/lib/creator-access"
import { getDashboardOverview } from "@/lib/services/dashboard.service"

const VALID_TOKENS = new Set(["ALEO", "USDCX", "USAD"])

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

    const requestedToken = req.nextUrl.searchParams.get("token")
    const token: Token =
      requestedToken && VALID_TOKENS.has(requestedToken) ? (requestedToken as Token) : "ALEO"

    const overview = await getDashboardOverview(creator, token)
    return NextResponse.json(overview)
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("Dashboard overview error:", error)
    return NextResponse.json({ error: "Failed to load dashboard overview" }, { status: 500 })
  }
}
