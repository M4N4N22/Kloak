import { NextRequest, NextResponse } from "next/server"

import { getDashboardOverview } from "@/lib/services/dashboard.service"

export async function GET(req: NextRequest) {
  try {
    const creator = req.nextUrl.searchParams.get("creator")?.trim()

    if (!creator) {
      return NextResponse.json({ error: "creator is required" }, { status: 400 })
    }

    const overview = await getDashboardOverview(creator)
    return NextResponse.json(overview)
  } catch (error: unknown) {
    console.error("Dashboard overview error:", error)
    return NextResponse.json({ error: "Failed to load dashboard overview" }, { status: 500 })
  }
}
