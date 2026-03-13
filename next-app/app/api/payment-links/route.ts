import { NextResponse } from "next/server"
import { createPaymentLink, getPaymentLinks } from "@/lib/services/paymentLink.service"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const link = await createPaymentLink(body)
    return NextResponse.json(link)

  } catch (error: any) {
    console.error("POST Error Details:", {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
      prismaEngine: error.clientVersion
    })

    return NextResponse.json(
      { error: error.message || "Failed to create payment link" },
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

  } catch (error: any) {
    console.error("GET Error Details:", error.message)

    return NextResponse.json(
      { error: "Failed to fetch payment links" },
      { status: 500 }
    )
  }
}