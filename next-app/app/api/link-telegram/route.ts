import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@/lib/prisma"
import { getBot } from "@/lib/bot/bot"

type TokenPayload = {
  telegramId: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, walletAddress } = body

    if (!token || !walletAddress) {
      return NextResponse.json(
        { error: "Missing token or walletAddress" },
        { status: 400 }
      )
    }

    let decoded: TokenPayload

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const telegramId = decoded.telegramId

    if (!telegramId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 400 }
      )
    }

    await prisma.telegramUser.upsert({
      where: { telegramId },
      update: {
        walletAddress,
      },
      create: {
        telegramId,
        walletAddress,
      },
    })

    try {
      const bot = getBot()

      await bot.api.sendMessage(
        telegramId,
        `✅ *Wallet linked successfully*

You're now ready to manage your private payment links.`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: [
              ["📥 My Links", "📊 Analytics"],
              ["🌐 Open Web App", "⚙️ Settings"], 
            ],
            resize_keyboard: true,
          },
        }
      )
    } catch (err) {
      console.error("Telegram send error:", err)
    }

    return NextResponse.json({
      success: true,
      telegramId,
      walletAddress,
    })
  } catch (err) {
    console.error("Link telegram error:", err)

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
