import { prisma } from "@/lib/prisma"
import { formatAnalyticsMessage } from "./analytics.utils"

export async function handleAnalytics(ctx: any) {
    if (!ctx.from) return

    const telegramId = String(ctx.from.id)

    const user = await prisma.telegramUser.findUnique({
        where: { telegramId },
    })

    if (!user?.walletAddress) {
        return ctx.reply("⚠️ Link your wallet first using /start")
    }

    const links = await prisma.paymentLink.findMany({
        where: {
            creatorAddress: user.walletAddress,
        },
        orderBy: {
            totalVolume: "desc",
        },
    })

    const payments = await prisma.payment.findMany({
        where: {
            PaymentLink: {
                creatorAddress: user.walletAddress,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    })

    const message = formatAnalyticsMessage(links, payments);

    const keyboard = {
        inline_keyboard: [
            [
                { text: "📥 View All Links", callback_data: "inbox_0" },
                { text: "🔄 Refresh Stats", callback_data: "refresh_analytics" }
            ],
            [
                { text: "📈 Export CSV (Coming Soon)", callback_data: "none" }
            ]
        ]
    };

    const options = {
        parse_mode: "Markdown",
        reply_markup: keyboard,
    };

    if (ctx.updateType === 'callback_query') {
        await ctx.answerCallbackQuery();
        return await ctx.editMessageText(message, options);
    }

    await ctx.reply(message, options);
}