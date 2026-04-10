import { Check } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PricingComparisonRow } from "@/features/pricing/lib/pricing-content"

type PricingComparisonTableProps = {
  rows: PricingComparisonRow[]
}

export function PricingComparisonTable({ rows }: PricingComparisonTableProps) {
  return <>
    <div className=" px-6 py-5 sm:px-8 text-center">
      <div className="space-y-2 ">
        <p className="text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-7xl">
          Compare plans
        </p>
        <h2 className=" text-foreground/50">
          Pay for leverage, not for basic access
        </h2>
      </div>

    </div>
    <Card className="p-0 ">

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.5fr_0.75fr_0.75fr] gap-4 border-b  ">
            <div className="text-xs font-semibold  text-neutral-500 p-8 sm:px-7 bg-neutral-950/50">
              Features
            </div>

            <PlanColumnHeader
              label="Free"
              note=""
            />

            <PlanColumnHeader
              label="Pro"
              note=""
              featured
            />
          </div>

          <div className="divide-y divide-foreground/6">
            {rows.map((row) => {
              const Icon = row.icon

              return (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.5fr_0.75fr_0.75fr] gap-4  transition-colors hover:bg-foreground/[0.02] "
                >
                  <div className="pr-3 bg-neutral-950/50  p-4 sm:px-7">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full  bg-foreground/[0.03] text-neutral-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1 ">
                        <div className="font-medium text-foreground">{row.label}</div>
                        <p className="text-sm leading-6 text-neutral-500">{row.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <PlanValue value={row.free} />
                  </div>

                  <div className="flex items-center justify-center ">
                    <PlanValue value={row.pro} featured />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  </>

}

function PlanColumnHeader({
  label,
  note,
  featured = false,
}: {
  label: string
  note: string
  featured?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-2xl  text-center text-xs font-semibold  text-neutral-500 p-8 sm:px-7 ",
        featured && ""
      )}
    >
      <div className={cn("text-sm font-semibold", featured ? "text-primary" : "text-neutral-200")}>
        {label}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
        {note}
      </div>
    </div>
  )
}

function PlanValue({
  value,
  featured = false,
}: {
  value: boolean | string
  featured?: boolean
}) {
  if (typeof value === "boolean") {
    if (value) {
      return (
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full ",
            featured
              ? "border-primary/20 text-primary"
              : "border-foreground/10  text-neutral-100"
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full  px-3 py-1.5 text-xs font-medium text-neutral-500">

        Not included
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full  px-3 py-1.5 text-xs font-medium",
        featured
          ? " text-primary"
          : " text-neutral-300"
      )}
    >
      {value}
    </span>
  )
}
