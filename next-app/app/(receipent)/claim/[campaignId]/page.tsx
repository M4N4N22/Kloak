import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ClaimClient from "./claim-client"

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params

  if (!campaignId) notFound()

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId }
  })

  if (!campaign) notFound()

  const safeCampaign = {
    ...campaign,
    totalBudget: Number(campaign.totalBudget),
    claimedAmount: Number(campaign.claimedAmount),
    poolAmount: Number(campaign.poolAmount),
  }

  if (campaign.expiry && new Date(campaign.expiry) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-zinc-500/10 p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Campaign Expired</h2>
          <p className="text-sm text-muted-foreground">
            This reward campaign has expired.
          </p>
        </div>
      </div>
    )
  }

  if (campaign.status !== "FUNDED" && campaign.status !== "CREATED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-[2.5rem] border bg-zinc-500/10 p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Campaign Not Active</h2>
          <p className="text-sm text-muted-foreground">
            This campaign is not currently claimable.
          </p>
        </div>
      </div>
    )
  }

  return <ClaimClient campaign={safeCampaign} />
}