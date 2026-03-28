import { initBot } from "@/lib/bot/bot"

export async function POST(req: Request) {
  try {
    const update = await req.json()

    console.log("📩 Incoming update:", JSON.stringify(update))

    const bot = await initBot()

    await bot.handleUpdate(update)

    console.log("✅ Update handled")

    return new Response("OK")
  } catch (err) {
    console.error("❌ Telegram webhook error:", err)
    return new Response("Error", { status: 500 })
  }
}