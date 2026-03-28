export function formatLinksMessage(links: any[], page: number, total: number) {
    const PAGE_SIZE = 5

    const start = page * PAGE_SIZE + 1
    const end = start + links.length - 1
    const totalPages = Math.ceil(total / PAGE_SIZE)

    let text = `💳 *Payment Dashboard* \`[${page + 1}/${totalPages}]\`\n`
    text += `───────────────────\n\n`

    links.forEach((link, i) => {
        const index = start + i
        const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()

        // Status
        let statusIcon = "🟢"
        let statusText = "Active"

        if (isExpired) {
            statusIcon = "⌛"
            statusText = "Expired"
        } else if (!link.active) {
            statusIcon = "⚪"
            statusText = "Paused"
        }

        const amountStr = link.allowCustomAmount
            ? `Any ${link.token}`
            : `*${Number(link.amount)} ${link.token}*`

        text += `${index}. ${statusIcon} ${link.title || "Untitled Link"}\n`
        text += `   💰 ${amountStr}  •  _${statusText}_\n\n`
    })

    if (links.length === 0) {
        text += `_No links found in this view._\n\n`
    }

    text += `───────────────────\n`
    text += `Showing ${start}-${end} of ${total} links\n\n`

    // 🔥 UX Instruction (IMPORTANT)
    text += `👉 *Tap a number below to share that link with a recipient*\n`

    return text
}


const PAGE_SIZE = 5

export function buildKeyboard(links: any[], page: number, total: number) {
    const rows: any[] = []

    // 🔢 Action Row (global numbering)
    const actionRow = links.map((link, i) => {
        const index = page * PAGE_SIZE + i + 1

        return {
            text: `${index}`,
            switch_inline_query: `share_${link.id}`,
        }
    })

    rows.push(actionRow)

    // 🔄 Navigation Row
    const navRow: any[] = []

    if (page > 0) {
        navRow.push({
            text: "⬅️ Back",
            callback_data: `inbox_${page - 1}`,
        })
    }

    navRow.push({
        text: "🔄 Refresh",
        callback_data: `inbox_${page}`,
    })

    if ((page + 1) * PAGE_SIZE < total) {
        navRow.push({
            text: "Next ➡️",
            callback_data: `inbox_${page + 1}`,
        })
    }

    rows.push(navRow)

    // 🏠 Main Menu Row (NEW)
    rows.push([
        {
            text: "🏠 Main Menu",
            callback_data: "menu",
        },
    ])

    return { inline_keyboard: rows }
}