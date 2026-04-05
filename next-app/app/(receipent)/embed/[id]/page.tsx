import PayClient from "../../pay/[id]/pay-client"
import { headers } from "next/headers"

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params

  const headersList = await headers()
  const host = headersList.get("host")

  const protocol = process.env.NODE_ENV === "development"
    ? "http"
    : "https"

  const url = `${protocol}://${host}/api/payment-links/${id}`

  console.log("🔍 [EMBED] Fetching payment link:", {
    id,
    url
  })

  try {
    const res = await fetch(url, { cache: "no-store" })

    if (!res.ok) {
      const text = await res.text()

      console.error("❌ [EMBED] Failed to fetch link", {
        status: res.status,
        body: text
      })

      return (
        <div className="text-foreground text-sm p-4">
          Failed to load payment link <br />
          Status: {res.status}
        </div>
      )
    }

    const text = await res.text()

    if (!text) {
      console.error("❌ [EMBED] Empty response body")

      return (
        <div className="text-foreground text-sm p-4">
          Empty response from server
        </div>
      )
    }

    let link

    try {
      link = JSON.parse(text)
    } catch (err) {
      console.error("❌ [EMBED] JSON parse failed", {
        raw: text
      })

      return (
        <div className="text-foreground text-sm p-4">
          Invalid JSON response
        </div>
      )
    }

    console.log("✅ [EMBED] Link loaded successfully", link)

    return (
      <div className="">
        <PayClient link={link} />
      </div>
    )

  } catch (err) {
    console.error("❌ [EMBED] Unexpected error", err)

    return (
      <div className="text-foreground text-sm p-4">
        Unexpected error while loading
      </div>
    )
  }
}