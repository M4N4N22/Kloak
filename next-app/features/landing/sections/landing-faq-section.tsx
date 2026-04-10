import { SectionHeading } from "@/features/landing/components/section-heading"
import { FaqList } from "@/features/trust/components/faq-list"
import { KLOAK_FAQ_ITEMS } from "@/features/trust/lib/faq"

export function LandingFaqSection() {
  return (
    <section id="faq" className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl space-y-10">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions people ask before they trust a payment product."
          description="Short answers about what stays private, how proofs work, and where the bot and docs fit in."
          centered
        />

        <FaqList items={KLOAK_FAQ_ITEMS} />
      </div>
    </section>
  )
}
