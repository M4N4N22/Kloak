import { PaymentLinkDetailSection } from "@/features/payment-links/sections/payment-link-detail-section"

export default async function PaymentLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PaymentLinkDetailSection linkId={id} />
}
