import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PayClient from "./pay-client"

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id) notFound()

  const link = await prisma.paymentLink.findUnique({
    where: { id }
  })

  if (!link) notFound()

      const safeLink = {
    ...link,
    amount: link.amount ? Number(link.amount) : null,
    totalVolume: Number(link.totalVolume),
  }


  // Expiration check
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-zinc-500/10 p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Link Expired</h2>
          <p className="text-sm text-muted-foreground">
            This payment link has expired and can no longer accept payments.
          </p>
        </div>
      </div>
    )
  }

  // Max payments check
  if (
    link.maxPayments &&
    link.paymentsReceived >= link.maxPayments
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-zinc-500/10 p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Payment Limit Reached</h2>
          <p className="text-sm text-muted-foreground">
            This payment link has reached its maximum number of payments.
          </p>
        </div>
      </div>
    )
  }

  // Inactive link
  if (!link.active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-zinc-500/10 p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Link Disabled</h2>
          <p className="text-sm text-muted-foreground">
            This payment link is no longer active.
          </p>
        </div>
      </div>
    )
  }

  return <PayClient link={safeLink} />
}