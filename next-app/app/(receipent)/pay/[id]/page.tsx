import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PayClient from "./pay-client"
import type { Metadata } from "next"

// =========================
// 🔥 METADATA (OG + SHARE)
// =========================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  const link = await prisma.paymentLink.findUnique({
    where: { id },
  })

  if (!link) {
    return {
      title: "Kloak Payment",
      description: "Secure private payment via Kloak",
    }
  }

  const amount = link.allowCustomAmount
    ? "Custom"
    : `${Number(link.amount)} ${link.token}`

  const title = `Pay ${amount} via Kloak`
  const description =
    link.description ||
    link.title ||
    "Secure private payment via Kloak"

  const url = `${process.env.APP_URL}/pay/${link.id}`

  const ogImage = `${process.env.APP_URL}/api/og?title=${encodeURIComponent(
    link.title || "Payment"
  )}&amount=${encodeURIComponent(
    link.allowCustomAmount ? "Custom" : Number(link.amount).toString()
  )}&token=${encodeURIComponent(link.token)}`

  return {
    metadataBase: new URL(process.env.APP_URL || 'https://kloak.vercel.app'),
    title,
    description,

    openGraph: {
      title,
      description,
      url,
      siteName: "Kloak",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

// =========================
// 💳 PAGE
// =========================

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id) notFound()

  const link = await prisma.paymentLink.findUnique({
    where: { id },
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
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-neutral-500/10 p-8 text-center space-y-3">
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
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-neutral-500/10 p-8 text-center space-y-3">
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
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-neutral-500/10 p-8 text-center space-y-3">
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