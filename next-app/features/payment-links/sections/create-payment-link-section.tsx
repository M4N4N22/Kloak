"use client"

import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import CreateLinkForm from "@/app/(main)/payment-links/create-link-form"
import { PaymentLinksAccessGate } from "@/features/payment-links/components/payment-links-access-gate"
import { PaymentLinksSectionHeader } from "@/features/payment-links/components/payment-links-section-header"

export function CreatePaymentLinkSection() {
  const { connected } = useWallet()

  return (
    <PaymentLinksAccessGate connected={connected}>
      <div className="space-y-8  mx-auto max-w-7xl ">
        <PaymentLinksSectionHeader
          eyebrow="Create Link"
          title="Issue a new private payment request"
          description="Define the request terms on web, then distribute the link through your preferred channels, including the Telegram bot."
        />

        <CreateLinkForm />
      </div>
    </PaymentLinksAccessGate>
  )
}
