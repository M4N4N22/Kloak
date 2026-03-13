import { recordPayment } from "@/lib/services/payment.service"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const body = await req.json()

  const payment = await recordPayment(id, body)

  return NextResponse.json(payment)
}