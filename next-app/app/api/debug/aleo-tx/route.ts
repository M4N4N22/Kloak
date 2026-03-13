import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {

    const { txId } = await req.json()

    if (!txId) {
      return NextResponse.json(
        { error: "Missing txId" },
        { status: 400 }
      )
    }

    const endpoints = [
      `https://api.explorer.aleo.org/v1/transactions/${txId}`,
      `https://api.explorer.aleo.org/v1/testnet/transactions/${txId}`,
      `https://api.explorer.aleo.org/v1/transaction/${txId}`,
      `https://api.explorer.aleo.org/v1/testnet/transaction/${txId}`
    ]

    const results: any[] = []

    for (const url of endpoints) {

      try {

        const res = await fetch(url)

        const text = await res.text()

        results.push({
          endpoint: url,
          status: res.status,
          body: text
        })

      } catch (err: any) {

        results.push({
          endpoint: url,
          error: err.message
        })

      }

    }

    return NextResponse.json({
      txId,
      results
    })

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { error: "Debug fetch failed" },
      { status: 500 }
    )
  }
}