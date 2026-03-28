import { Bot } from "grammy"
import { setupRouter } from "./router"

let bot: Bot | null = null
let isInitialized = false

export function getBot() {
  if (!bot) {
    bot = new Bot(process.env.BOT_TOKEN!)

    setupRouter(bot)
  }

  return bot
}

export async function initBot() {
  const bot = getBot()

  if (!isInitialized) {
    await bot.init()
    isInitialized = true
    console.log("✅ Bot initialized")
  }

  return bot
}