// /app/(public)/link-telegram/page.tsx

import LinkTelegramClient from "./LinkTelegramClient"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams

  return <LinkTelegramClient token={params.token} />
}