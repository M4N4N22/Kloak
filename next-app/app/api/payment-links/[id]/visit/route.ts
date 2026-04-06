import { recordVisit } from "@/lib/services/visit.service"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const userAgent = req.headers.get("user-agent") || "unknown"
  const ip = req.headers.get("x-forwarded-for") || "unknown"

  await recordVisit(id, ip, userAgent)

  return NextResponse.json({ ok: true })
}
