import { NextResponse } from "next/server"
import { createPaymentLink, getPaymentLinks } from "@/lib/services/paymentLink.service"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const link = await createPaymentLink(body)
    return NextResponse.json(link)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create payment link"
    const stack = error instanceof Error ? error.stack : undefined
    const prismaEngine =
      typeof error === "object" &&
      error !== null &&
      "clientVersion" in error &&
      typeof (error as { clientVersion?: unknown }).clientVersion === "string"
        ? (error as { clientVersion: string }).clientVersion
        : undefined

    console.error("POST Error Details:", {
      message,
      stack: stack?.split('\n').slice(0, 3).join('\n'),
      prismaEngine,
    })

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

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

    const links = await getPaymentLinks(creator)

    return NextResponse.json(links)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch payment links"
    console.error("GET Error Details:", message)

    return NextResponse.json(
      { error: "Failed to fetch payment links" },
      { status: 500 }
    )
  }
}
