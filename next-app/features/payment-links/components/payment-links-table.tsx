"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowDownUp, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentLinkRecord } from "@/hooks/use-payment-links"
import { LinkStatusBadge } from "./link-status-badge"
import {
  formatAmount,
  formatDateOnly,
  formatDateTime,
  PaymentLinkStatus,
  shortHash,
} from "@/features/payment-links/lib/presentation"
import { getPaymentLinkStatus } from "@/features/payment-links/lib/presentation"

type StatusFilter = "all" | PaymentLinkStatus
type TokenFilter = "all" | PaymentLinkRecord["token"]
type SortOption =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "volume-desc"
  | "conversion-desc"
  | "expiry-asc"

export function PaymentLinksTable({
  links,
  title = "Created Links",
  description = "All payment links, with clear status, expiry, and quick actions.",
}: {
  links: PaymentLinkRecord[]
  title?: string
  description?: string
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [tokenFilter, setTokenFilter] = useState<TokenFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const result = links.filter((link) => {
      const status = getPaymentLinkStatus(link)
      const matchesQuery =
        !normalizedQuery ||
        link.title.toLowerCase().includes(normalizedQuery) ||
        (link.description || "").toLowerCase().includes(normalizedQuery) ||
        link.requestId.toLowerCase().includes(normalizedQuery) ||
        link.id.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === "all" || status === statusFilter
      const matchesToken = tokenFilter === "all" || link.token === tokenFilter

      return matchesQuery && matchesStatus && matchesToken
    })

    result.sort((left, right) => {
      switch (sortBy) {
        case "oldest":
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        case "title-asc":
          return left.title.localeCompare(right.title)
        case "title-desc":
          return right.title.localeCompare(left.title)
        case "volume-desc":
          return Number(right.totalVolume) - Number(left.totalVolume)
        case "conversion-desc": {
          const leftConversion = left.views > 0 ? (left.paymentsReceived / left.views) * 100 : 0
          const rightConversion = right.views > 0 ? (right.paymentsReceived / right.views) * 100 : 0
          return rightConversion - leftConversion
        }
        case "expiry-asc": {
          const leftExpiry = left.expiresAt ? new Date(left.expiresAt).getTime() : Number.POSITIVE_INFINITY
          const rightExpiry = right.expiresAt ? new Date(right.expiresAt).getTime() : Number.POSITIVE_INFINITY
          return leftExpiry - rightExpiry
        }
        case "newest":
        default:
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      }
    })

    return result
  }, [links, query, statusFilter, tokenFilter, sortBy])

  const summary = useMemo(() => {
    return filteredLinks.reduce(
      (acc, link) => {
        const status = getPaymentLinkStatus(link)
        acc[status] += 1
        return acc
      },
      { live: 0, expired: 0, capped: 0, inactive: 0 },
    )
  }, [filteredLinks])

  const copyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${id}`)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500)
  }

  return (
    <Card>
      <CardHeader className="border-b ">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Ledger</div>
            <CardTitle className="mt-2 text-lg">{title}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
            <p className="mt-2 text-xs text-neutral-500">
              Showing {filteredLinks.length} of {links.length} links
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <MetricPill label="Live" value={summary.live} />
            <MetricPill label="Expired" value={summary.expired} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, description, or link ID"
              className="rounded-2xl border border-foreground/8 bg-black/20 pl-11"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-full rounded-2xl border border-foreground/8 bg-black/20">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="capped">Closed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tokenFilter} onValueChange={(value) => setTokenFilter(value as TokenFilter)}>
            <SelectTrigger className="w-full rounded-2xl border border-foreground/8 bg-black/20">
              <SelectValue placeholder="Filter by token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tokens</SelectItem>
              <SelectItem value="ALEO">ALEO</SelectItem>
              <SelectItem value="USDCX">USDCX</SelectItem>
              <SelectItem value="USAD">USAD</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full rounded-2xl border border-foreground/8 bg-black/20">
              <ArrowDownUp className="mr-2 h-4 w-4 text-neutral-500" />
              <SelectValue placeholder="Sort links" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="volume-desc">Highest volume</SelectItem>
              <SelectItem value="conversion-desc">Best conversion</SelectItem>
              <SelectItem value="expiry-asc">Nearest expiry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {links.length === 0 ? (
            <div className="m-6 rounded-[2rem] border border-dashed border-foreground/10 bg-black/20 px-8 py-16 text-center">
            <div className="text-lg font-medium text-foreground">No payment links yet</div>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Create your first link to start collecting payments.
            </p>
            <Link href="/payment-links/create" className="mt-5 inline-flex">
              <Button>Create payment link</Button>
            </Link>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="m-6 rounded-[2rem] border border-dashed border-foreground/10 bg-black/20 px-8 py-16 text-center">
            <div className="text-lg font-medium text-foreground">No links match these filters</div>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Try clearing the search, changing the status filter, or switching the sort order.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setStatusFilter("all")
                  setTokenFilter("all")
                  setSortBy("newest")
                }}
              >
                Reset filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b  text-xs font-bold  text-neutral-500">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created at</th>
                  <th className="px-5 py-4">Expiry</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/[0.04]">
                {filteredLinks.map((link) => {
                  return (
                    <tr key={link.id} className="align-top hover:bg-foreground/[0.02]">
                      <td className="px-5 py-5">
                        <div className="max-w-[120px]">
                          <div className="font-mono text-sm text-neutral-500">{shortHash(link.id, 4, 4)}</div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="max-w-[280px]">
                          <div className="text-sm font-medium text-foreground">{link.title}</div>
                          <div className="mt-1 text-xs text-neutral-500">
                            {link.description || "No description"}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <LinkStatusBadge
                          active={link.active}
                          expiresAt={link.expiresAt}
                          maxPayments={link.maxPayments}
                          paymentsReceived={link.paymentsReceived}
                        />
                      </td>
                      <td className="px-5 py-5">
                        <div className="text-sm text-foreground">{formatDateTime(link.createdAt)}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {link.active ? "Ready to use" : "Turned off"}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="text-sm text-foreground">{formatDateOnly(link.expiresAt)}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {link.expiresAt ? "Scheduled expiry" : "No expiry"}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-mono text-sm text-foreground">
                          {link.allowCustomAmount ? `Variable ${link.token}` : formatAmount(link.amount, link.token)}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {link.maxPayments ? `${link.paymentsReceived}/${link.maxPayments} payments` : `${link.paymentsReceived} payments`}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => void copyLink(link.id)}>

                            {copiedId === link.id ? "Copied" : "Copy"}
                          </Button>
                          <a href={`/pay/${link.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" >Open</Button>
                          </a>
                          <Link href={`/payment-links/links/${link.id}`}>
                            <Button >
                              Details
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border  px-4 py-3 text-center">
      <div className="text-[10px] font-bold  text-neutral-500">{label}</div>
      <div className="mt-2 font-mono text-lg text-foreground">{value}</div>
    </div>
  )
}
