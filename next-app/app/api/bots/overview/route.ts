import { NextRequest, NextResponse } from "next/server"

import { getBotsOverview } from "@/lib/services/bots.service"

export async function GET(req: NextRequest) {
  try {
    const creator = req.nextUrl.searchParams.get("creator")?.trim()

    if (!creator) {
      return NextResponse.json({ error: "creator is required" }, { status: 400 })
    }

    const overview = await getBotsOverview(creator)
    return NextResponse.json(overview)
  } catch (error: unknown) {
    console.error("Bots overview error:", error)
    return NextResponse.json({ error: "Failed to load bot overview" }, { status: 500 })
  }
}
