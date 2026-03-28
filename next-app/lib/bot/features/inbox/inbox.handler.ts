import { prisma } from "@/lib/prisma"
import { formatLinksMessage, buildKeyboard } from "./inbox.utils"
const PAGE_SIZE = 5

export async function handleInbox(ctx: any, page = 0) {
    if (!ctx.from) return

    const telegramId = String(ctx.from.id)

    const user = await prisma.telegramUser.findUnique({
        where: { telegramId },
    })

    if (!user?.walletAddress) {
        return ctx.reply("⚠️ Link your wallet first using /start")
    }

    const total = await prisma.paymentLink.count({
        where: { creatorAddress: user.walletAddress },
    })

    const links = await prisma.paymentLink.findMany({
        where: { creatorAddress: user.walletAddress },
        orderBy: { createdAt: "desc" },
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
    })

    if (links.length === 0) {
        return ctx.reply(`📭 No payment links found.`)
    }

    const text = formatLinksMessage(links, page, total);
    const keyboard = buildKeyboard(links, page, total);

    const options = {
        parse_mode: "Markdown",
        reply_markup: keyboard,
    };

    try {
        if (ctx.updateType === 'callback_query') {
            await ctx.editMessageText(text, options);
        } else {
            await ctx.reply(text, options);
        }
    } catch (e) {
        // Fallback if edit fails (e.g., content is same)
        if (ctx.updateType !== 'callback_query') await ctx.reply(text, options);
    }
}