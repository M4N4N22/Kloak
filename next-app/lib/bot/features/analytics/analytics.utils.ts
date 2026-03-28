export function formatAnalyticsMessage(links: any[], payments: any[]) {
  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.active).length;
  
  // Stats Aggregation
  const stats = links.reduce((acc, l) => ({
    vol: acc.vol + Number(l.totalVolume || 0),
    views: acc.views + (l.views || 0),
    payments: acc.payments + (l.paymentsReceived || 0)
  }), { vol: 0, views: 0, payments: 0 });

  const conversionRate = stats.views > 0 
    ? ((stats.payments / stats.views) * 100).toFixed(1) 
    : 0;

  let text = `📊 *KLOAK ANALYTICS* \n`;
  text += `────────────────────\n`;
  
  // 1. High-Level Stats in a Monospaced Block for "Professional" feel
  text += `\`TOTAL VOLUME : ${stats.vol.toLocaleString()} ALEO\`\n`;
  text += `\`TOTAL PAYMENTS: ${stats.payments}\`\n`;
  text += `\`AVG CONVERSION: ${conversionRate}%\`\n\n`;

  text += `🔗 *Network Reach*\n`;
  text += `└ ${stats.views} unique views across ${totalLinks} links\n`;
  text += `└ ${activeLinks} links currently accepting shielded pay\n\n`;

  // 2. Performance Leaderboard
  if (links.length > 0) {
    text += `🏆 *Top Performing Links*\n`;
    links.slice(0, 3).forEach((link, i) => {
      const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
      text += `${icon} *${link.title || "Untitled"}*\n`;
      text += `   └ \`${Number(link.totalVolume).toFixed(2)} ${link.token}\` • ${link.paymentsReceived} sales\n`;
    });
    text += `\n`;
  }

  // 3. Activity Feed
  if (payments.length > 0) {
    text += `⏱ *Recent Shielded Activity*\n`;
    payments.forEach((p) => {
      const date = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const statusIcon = p.status === "COMPLETED" ? "✅" : "⏳";
      text += `${statusIcon} \`+${Number(p.amount)} ${p.token}\` • ${date}\n`;
    });
  } else {
    text += `_No recent transactions detected._\n`;
  }

  text += `────────────────────`;
  return text;
}