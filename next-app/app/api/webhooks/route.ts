import { NextResponse } from "next/server"

import {
  createWebhookEndpoint,
  getWebhookEndpoints,
} from "@/lib/services/webhook.service"
import {
  CREATOR_WEBHOOKS_READ_SCOPE,
  CREATOR_WEBHOOKS_WRITE_SCOPE,
  isCreatorAccessError,
  verifyCreatorAccessRequest,
} from "@/lib/creator-access"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const viewerAddress = searchParams.get("viewerAddress") || undefined
    const scope = searchParams.get("scope") || undefined
    const issuedAt = searchParams.get("issuedAt") || undefined
    const signature = searchParams.get("signature") || undefined

    const creator = await verifyCreatorAccessRequest(
      {
        viewerAddress,
        scope,
        issuedAt,
        signature,
      },
      CREATOR_WEBHOOKS_READ_SCOPE,
    )

    const webhooks = await getWebhookEndpoints(creator)

    return NextResponse.json(webhooks)
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch webhooks" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const creator = await verifyCreatorAccessRequest(body, CREATOR_WEBHOOKS_WRITE_SCOPE)

    const webhook = await createWebhookEndpoint({
      creatorAddress: creator,
      url: body.url,
      secret: body.secret,
    })

    return NextResponse.json(webhook)
  } catch (error: unknown) {
    if (isCreatorAccessError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create webhook" },
      { status: 500 }
    )
  }
}
