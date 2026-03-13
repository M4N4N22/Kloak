"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { Copy, Check, ExternalLink, Users, PieChart } from "lucide-react"

import { cn } from "@/lib/utils"

export type Campaign = {
  id: string
  name: string
  asset: string
  budget: number
  claimed: number
  recipients: number
  status: "active" | "closed"
}

export default function CampaignList() {

  const { address } = useWallet()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)



  /* ---------------- FETCH CAMPAIGNS ---------------- */

  useEffect(() => {

    if (!address) return

    const fetchCampaigns = async () => {

      try {

        const res = await fetch(`/api/campaigns/get?creator=${address}`)

        const data = await res.json()

        const formatted: Campaign[] = data.campaigns.map((c: any) => ({
          id: c.id,
          name: c.name,
          asset: c.asset === 0 ? "ALEO" : "TOKEN",
          budget: Number(c.totalBudget) / 1_000_000,
          claimed: Number(c.claimedAmount) / 1_000_000,
          recipients: c.totalRecipients,
          status: "active"
        }))

        setCampaigns(formatted)

      } catch (err) {

        console.error("Failed to fetch campaigns:", err)

      } finally {

        setLoading(false)

      }

    }

    fetchCampaigns()

  }, [address])


  /* ---------------- COPY LINK ---------------- */

  const copy = (id: string) => {

    const url = `${window.location.origin}/claim/${id}`

    navigator.clipboard.writeText(url)

    setCopyingId(id)

    setTimeout(() => {
      setCopyingId(null)
    }, 2000)

  }

  /* ---------------- EMPTY STATE ---------------- */

  if (!loading && campaigns.length === 0) {

    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border p-20 text-center transition-colors hover:border-primary/20 space-y-6">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <PieChart className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-xl font-bold text-foreground">
          No campaigns found
        </h3>

        <p className="text-muted-foreground max-w-xs">
          Start distributing rewards privately on Aleo. Create your first campaign to see it here.
        </p>
      </div>
    )

  }

  /* ---------------- LIST ---------------- */

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Your Campaigns
        </h2>

        <Badge
          variant="outline"
          className="rounded-lg px-3 py-1 bg-foreground/5 border-foreground/10"
        >
          {campaigns.length} Total
        </Badge>

      </div>

      <div className="grid gap-6">

        {campaigns.map((campaign) => {
          const generatedLink = `${window.location.origin}/claim/${campaign.id}`
          const progress =
            campaign.budget === 0
              ? 0
              : (campaign.claimed / campaign.budget) * 100

          const isCopying = copyingId === campaign.id

          return (

            <Card
              key={campaign.id}
              className=""
            >

              <CardContent className="p-0">

                <div className="p-6">

                  {/* HEADER */}

                  <div className="flex items-start justify-between mb-6">

                    <div className="space-y-1">

                      <h3 className="text-lg font-bold text-foreground">
                        {campaign.name}
                      </h3>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">

                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {campaign.recipients} recipients
                        </span>

                        <span>•</span>

                        <span className="font-mono text-[10px] uppercase tracking-wider bg-foreground/5 px-2 py-0.5 rounded">
                          {campaign.id.slice(0, 8)}...
                        </span>

                      </div>

                    </div>

                    <Badge
                      className=""
                      variant="secondary"
                    >
                      active
                    </Badge>

                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6">

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                        Budget
                      </p>

                      <p className="text-lg font-bold text-foreground">
                        {campaign.budget}
                        <span className="text-xs font-medium text-muted-foreground ml-1">
                          {campaign.asset}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                        Claimed
                      </p>

                      <p className="text-lg font-bold text-foreground">
                        {campaign.claimed}
                        <span className="text-xs font-medium text-muted-foreground ml-1">
                          {campaign.asset}
                        </span>
                      </p>
                    </div>

                    <div className="md:col-span-2 flex flex-col justify-end">

                      <div className="flex justify-between items-end mb-2">

                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ">
                          Distribution Progress
                        </p>

                        <span className="text-sm font-bold text-primary">
                          {Math.round(progress)}%
                        </span>

                      </div>

                      <Progress
                        value={progress}
                        className="h-2 bg-foreground/5"
                      />

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="bg-foreground/2 border-t border-foreground/5 px-6 py-3 flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => copy(campaign.id)}
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    <span className="font-bold text-xs uppercase tracking-wider">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                  <Button variant="secondary" onClick={() =>
                    navigator.share?.({
                      title: "Payment Link",
                      url: generatedLink,
                    })
                  } > Share </Button>
                </div>
              </CardContent>
            </Card>

          )

        })}

      </div>

    </div>

  )

}