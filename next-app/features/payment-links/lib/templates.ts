export type PaymentLinkTemplateId = "invoice" | "freelance" | "tip-jar" | "checkout" | "custom"

export type PaymentLinkTemplatePreset = {
  id: PaymentLinkTemplateId
  label: string
  description: string
  suggestedTitle: string
  suggestedDescription: string
  defaultAllowCustomAmount: boolean
  defaultExpiration: string
  previewAmountLabel: string
  previewButtonLabel: string
}

export const PAYMENT_LINK_TEMPLATES: PaymentLinkTemplatePreset[] = [
  {
    id: "invoice",
    label: "Invoice",
    description: "For invoices, bills, and client collections.",
    suggestedTitle: "Invoice payment",
    suggestedDescription: "Payment for the invoice shared with you.",
    defaultAllowCustomAmount: false,
    defaultExpiration: "7d",
    previewAmountLabel: "Invoice total",
    previewButtonLabel: "Pay invoice",
  },
  {
    id: "freelance",
    label: "Freelance Payment",
    description: "For projects, retainers, and milestone payments.",
    suggestedTitle: "Freelance payment",
    suggestedDescription: "Payment for freelance work or a project milestone.",
    defaultAllowCustomAmount: false,
    defaultExpiration: "7d",
    previewAmountLabel: "Amount due",
    previewButtonLabel: "Pay now",
  },
  {
    id: "tip-jar",
    label: "Tip Jar / Donation",
    description: "For donations, support, and pay-what-you-want links.",
    suggestedTitle: "Support my work",
    suggestedDescription: "Choose any amount you'd like to contribute.",
    defaultAllowCustomAmount: true,
    defaultExpiration: "30d",
    previewAmountLabel: "Choose an amount",
    previewButtonLabel: "Send support",
  },
  {
    id: "checkout",
    label: "Checkout",
    description: "For simple product, event, or access payments.",
    suggestedTitle: "Checkout",
    suggestedDescription: "Complete your payment to continue.",
    defaultAllowCustomAmount: false,
    defaultExpiration: "24h",
    previewAmountLabel: "Order total",
    previewButtonLabel: "Complete payment",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Start from scratch and write everything your own way.",
    suggestedTitle: "",
    suggestedDescription: "",
    defaultAllowCustomAmount: false,
    defaultExpiration: "24h",
    previewAmountLabel: "Amount to pay",
    previewButtonLabel: "Pay now",
  },
]

export const PAYMENT_LINK_TEMPLATE_TO_DB = {
  invoice: "INVOICE",
  freelance: "FREELANCE",
  "tip-jar": "TIP_JAR",
  checkout: "CHECKOUT",
  custom: "CUSTOM",
} as const

export const PAYMENT_LINK_TEMPLATE_FROM_DB = {
  INVOICE: "invoice",
  FREELANCE: "freelance",
  TIP_JAR: "tip-jar",
  CHECKOUT: "checkout",
  CUSTOM: "custom",
} as const satisfies Record<string, PaymentLinkTemplateId>

export function getPaymentLinkTemplate(templateId: PaymentLinkTemplateId) {
  return (
    PAYMENT_LINK_TEMPLATES.find((template) => template.id === templateId) ??
    PAYMENT_LINK_TEMPLATES[0]
  )
}

export function getPaymentLinkTemplateFromDb(template: string | null | undefined): PaymentLinkTemplateId {
  if (!template) {
    return "custom"
  }

  return PAYMENT_LINK_TEMPLATE_FROM_DB[template as keyof typeof PAYMENT_LINK_TEMPLATE_FROM_DB] ?? "custom"
}
