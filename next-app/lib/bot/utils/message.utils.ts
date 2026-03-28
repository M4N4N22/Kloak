import { Context } from "grammy"

export async function sendOrEditMessage(
  ctx: Context,
  text: string,
  data: any,
  keyboard?: any
) {
  const chatId = ctx.chat?.id

  if (!chatId) return

  // if message exists → edit
  if (data?.messageId) {
    try {
      await ctx.api.editMessageText(
        chatId,
        data.messageId,
        text,
        {
          reply_markup: keyboard,
        }
      )
      return
    } catch (err) {
      // fallback to new message if edit fails
    }
  }

  // else send new message
  const msg = await ctx.reply(text, {
    reply_markup: keyboard,
  })

  return {
    chatId,
    messageId: msg.message_id,
  }
}