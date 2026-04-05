import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const title = searchParams.get("title") || "Payment Request"
  const amount = searchParams.get("amount") || "Custom"
  const token = searchParams.get("token") || ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "black",
          color: "foreground",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Branding */}
        <div style={{ fontSize: 32, opacity: 0.6 }}>
          Kloak
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700 }}>
            {amount} {token}
          </div>

          <div style={{ fontSize: 36, opacity: 0.9 }}>
            {title}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 24, opacity: 0.5 }}>
          Pay securely via Kloak
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}