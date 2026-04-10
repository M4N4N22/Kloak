import type { PaymentLinkTemplateId } from "@/features/payment-links/lib/templates"

export type PayClientLink = {
  id: string
  requestId: string
  title: string
  description: string | null
  template: PaymentLinkTemplateId
  successMessage: string | null
  redirectUrl: string | null
  suggestedAmounts: number[] | null
  amount: number | null
  token: "ALEO" | "USDCX" | "USAD"
  allowCustomAmount: boolean
}

export type PayPageCopy = {
  eyebrow: string
  amountLabel: string
  buttonLabel: string
  helper: string
}
