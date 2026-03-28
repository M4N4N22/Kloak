import { NextResponse } from "next/server"

import {
  createWebhookEndpoint,
  getWebhookEndpoints,
} from "@/lib/services/webhook.service"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const creator = searchParams.get("creator")

    if (!creator) {
      return NextResponse.json(
        { error: "Missing creator address" },
        { status: 400 }
      )
    }

    const webhooks = await getWebhookEndpoints(creator)

    return NextResponse.json(webhooks)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch webhooks" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const webhook = await createWebhookEndpoint(body)

    return NextResponse.json(webhook)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create webhook" },
      { status: 500 }
    )
  }
}
