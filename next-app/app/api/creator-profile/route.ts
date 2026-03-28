import { NextResponse } from "next/server"

import {
  activateProPlan,
  getCreatorProfile,
} from "@/lib/services/creator-profile.service"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      )
    }

    const profile = await getCreatorProfile(walletAddress)

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch creator profile" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const walletAddress = body.walletAddress

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      )
    }

    const profile = await activateProPlan(walletAddress)

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to activate pro plan" },
      { status: 500 }
    )
  }
}
