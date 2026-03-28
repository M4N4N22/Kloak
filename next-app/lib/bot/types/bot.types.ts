export type RequestCommandInput = {
  amount: number
  token: string
  targetUsername: string
  note?: string
  requestedBy: {
    telegramId: number
    username?: string
  }
}