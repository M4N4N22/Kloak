import { prisma } from "@/lib/prisma"
import { validatePaymentTransactionForLink } from "@/lib/payment-chain-validation"
import { recordPayment } from "@/lib/services/payment.service"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const body = await req.json().catch(() => ({}))
  const link = await prisma.paymentLink.findUnique({
    where: { id },
    select: {
      id: true,
      requestId: true,
      creatorAddress: true,
      amount: true,
      allowCustomAmount: true,
      token: true,
    },
  })

  if (!link) {
    return NextResponse.json({ error: "Payment link not found." }, { status: 404 })
  }

  const txHash = typeof body?.txHash === "string" ? body.txHash : ""
  const validation = await validatePaymentTransactionForLink({
    txHash,
    link,
    submittedToken: body?.token,
    submittedAmount: body?.amount,
  })

  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: validation.status })
  }

  const payment = await recordPayment(id, {
    merchantAddress: validation.merchantAddress,
    amount: validation.amount,
    token: validation.token,
    txHash: validation.txHash,
    receiptCommitment:
      typeof body?.receiptCommitment === "string" && body.receiptCommitment.trim()
        ? body.receiptCommitment.trim()
        : null,
  })

  return NextResponse.json(payment)
}
