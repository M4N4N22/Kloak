import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAmount, formatDateTime, shortHash } from "@/features/payment-links/lib/presentation"

type LinkPayment = {
  id: string
  txHash: string | null
  amount: string
  token: "ALEO" | "USDCX" | "USAD"
  status: string
  createdAt: string
  payerAddress: string | null
  proofCount: number
}

export function PaymentLinkPaymentsTable({
  payments,
  requestId,
}: {
  payments: LinkPayment[]
  requestId: string
}) {
  return (
    <Card className="rounded-[2.5rem] border border-foreground/5 bg-neutral-900/40 text-foreground">
      <CardHeader className="border-b border-foreground/5">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Settlements</div>
        <CardTitle className="mt-2 text-lg">Payments through this link</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <div className="text-lg font-medium text-foreground">No payments yet</div>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Once this link receives a payment, the settlement record and proof actions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payer</th>
                  <th className="px-6 py-4">Proofs</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.04]">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-foreground/[0.02]">
                    <td className="px-6 py-5">
                      <div className="font-mono text-sm text-foreground">{formatAmount(payment.amount, payment.token)}</div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {payment.txHash ? shortHash(payment.txHash, 8, 6) : "Pending tx"} | {formatDateTime(payment.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge className="border-primary/20 bg-primary/10 text-primary">{payment.status}</Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-foreground">{payment.payerAddress ? shortHash(payment.payerAddress, 8, 6) : "Unknown payer"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-mono text-sm text-foreground">{payment.proofCount}</div>
                      <div className="mt-1 text-xs text-neutral-500">generated proofs</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        {payment.txHash ? (
                          <Link href={`/compliance/generate?txHash=${encodeURIComponent(payment.txHash)}&requestId=${encodeURIComponent(requestId)}`}>
                            <Button  >
                              Generate proof
                            </Button>
                          </Link>
                        ) : (
                          <Button  variant="outline"  disabled>
                            Waiting on tx
                          </Button>
                        )}
                        <Link href="/compliance/proofs">
                          <Button  variant="outline" >
                            Open proofs
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
