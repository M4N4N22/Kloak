import { Context } from "grammy"

export function getTelegramId(ctx: Context): string {
  if (!ctx.from) {
    throw new Error("Missing ctx.from")
  }
  return String(ctx.from.id)
}