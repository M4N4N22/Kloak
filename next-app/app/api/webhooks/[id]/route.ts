import { NextResponse } from "next/server"

import { deleteWebhookEndpoint } from "@/lib/services/webhook.service"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const creator = searchParams.get("creator")

    if (!creator) {
      return NextResponse.json(
        { error: "Missing creator address" },
        { status: 400 }
      )
    }

    const result = await deleteWebhookEndpoint(id, creator)

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete webhook" },
      { status: 500 }
    )
  }
}
