"use client"

import type { ReactNode } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PricingPlanDefinition } from "@/features/pricing/lib/pricing-content"

type PricingPlanCardProps = {
  plan: PricingPlanDefinition
  featured?: boolean
  planStateLabel?: string
  action?: ReactNode
  tone?: "blue" | "neutral" | "green"
}

export function PricingPlanCard({
  plan,
  featured = false,
  planStateLabel,
  action,
  tone = "neutral",
}: PricingPlanCardProps) {
  const toneClasses =
    tone === "blue"
      ? "before:bg-[radial-gradient(circle_at_top_left,rgba(88,101,242,0.28),transparent_42%)]"
      : tone === "green"
        ? "before:bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_42%)]"
        : "before:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_42%)]"

  return (
    <Card
      className={cn(
        "group relative flex flex-col border-0 overflow-hidden rounded-[2rem]  transition-all duration-500 p-7 before:absolute before:inset-0 before:pointer-events-none before:opacity-100",
        toneClasses,
        featured
          ? " bg-neutral-950 shadow-[0_24px_90px_rgba(0,0,0,0.36)]"
          : " bg-neutral-950/80 hover:border-foreground/12 shadow-[0_20px_70px_rgba(0,0,0,0.26)]"
      )}
    >
      <div className="relative flex h-full flex-col gap-7">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge
              className={cn(
                "rounded-full px-3 py-1 text-xs border-none transition-colors ",
                featured
                  ? "bg-indigo-500/10 text-indigo-300"
                  : "bg-foreground/5 text-neutral-400 group-hover:bg-foreground/10"
              )}
            >
              {plan.eyebrow}
            </Badge>
            {planStateLabel && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                {planStateLabel}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {plan.name}
            </h2>

          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-3xl tracking-tight text-foreground">
                {plan.price}
              </span>
              <p className="text-xs leading-6 text-neutral-500">
                {plan.summary}
              </p>

            </div>

          </div>
          {/* 3. CTA Action */}
          {action && (
            <div className="relative mt-auto pt-2">
              {action}
            </div>
          )}
        </div>

        {/* 2. Features List */}
        <div className="space-y-4">
          <p className="text-xs text-neutral-600">Includes</p>
          <div className="space-y-3">
            {plan.highlights.map((feature) => (
              <div key={feature} className="group/item flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full  transition-all",
                  featured
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-foreground/10 bg-foreground/5 text-neutral-500 group-hover/item:border-primary/50 group-hover/item:text-primary"
                )}>
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
                <span className="text-sm font-medium text-neutral-400 transition-colors group-hover/item:text-neutral-200">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>


      </div>
    </Card>
  )
}

type PricingActionButtonProps = {
  label: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  featured?: boolean
}

export function PricingActionButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  featured = false,
}: PricingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "",
        featured
          ? ""
          : ""
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {label}

          </>
        )}
      </div>
    </Button>
  )
}
