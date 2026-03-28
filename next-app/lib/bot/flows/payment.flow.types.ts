export type PaymentFlowStep =
    | "idle"
    | "amount"
    | "token"
    | "note"
    | "expiry"
    | "confirm"

export const FLOW_STEPS = {
    amount: 1,
    token: 2,
    note: 3,
    expiry: 4,
    confirm: 5,
}

export const TOTAL_STEPS = 5

export type PaymentFlowData = {
    amount?: number
    token?: "ALEO" | "USDCX" | "USAD"
    note?: string
    expiry?: string

    // NEW
    chatId?: number
    messageId?: number
}