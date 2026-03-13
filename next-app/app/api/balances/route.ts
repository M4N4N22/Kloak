import { NextResponse } from "next/server"

const NODE_URL = "https://api.explorer.provable.com/v1"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get("address")

    if (!address || !address.startsWith("aleo1")) {
      return NextResponse.json(
        { error: "Invalid Aleo address" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${NODE_URL}/testnet/program/credits.aleo/mapping/account/${address}`,
      {
        next: { revalidate: 5 }
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch mapping")
    }

    const raw = await res.text()

    /**
     * raw example:
     * "48758413u64"
     */

    const microcredits = Number(raw.replace(/"|u64/g, ""))

    const aleo = microcredits / 1_000_000

    return NextResponse.json(
      {
        aleo,
        usdcx: 0
      },
      {
        headers: {
          "Cache-Control": "s-maxage=5, stale-while-revalidate=30"
        }
      }
    )
  } catch {
    return NextResponse.json(
      {
        aleo: 0,
        usdcx: 0
      },
      {
        headers: {
          "Cache-Control": "s-maxage=5, stale-while-revalidate=30"
        }
      }
    )
  }
}