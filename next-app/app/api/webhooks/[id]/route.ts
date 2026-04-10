import { NextResponse } from "next/server"

import { deleteWebhookEndpoint } from "@/lib/services/webhook.service"
import {
  CREATOR_WEBHOOKS_WRITE_SCOPE,
  isCreatorAccessError,
  verifyCreatorAccessRequest,
} from "@/lib/creator-access"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const creator = await verifyCreatorAccessRequest(body, CREATOR_WEBHOOKS_WRITE_SCOPE)

    const result = await deleteWebhookEndpoint(id, creator)

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete webhook" },
      { status: 500 }
    )
  }
}
