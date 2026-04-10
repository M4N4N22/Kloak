"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

type FaqItem = {
  question: string
  answer: string
}

type FaqListProps = {
  items: readonly FaqItem[]
}

export function FaqList({ items }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = openIndex === index

        return (
          <Collapsible
            key={item.question}
            open={open}
            onOpenChange={(nextOpen) => setOpenIndex(nextOpen ? index : null)}
            className="rounded-[1.75rem] border border-foreground/8 bg-black/20 px-5 py-4 backdrop-blur-xl"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 text-left">
              <span className="text-base font-medium text-foreground">{item.question}</span>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-black/30 transition-transform",
                  open && "rotate-180",
                )}
              >
                <ChevronDown className="h-4 w-4 text-neutral-300" />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="pt-4 text-sm leading-7 text-neutral-400">{item.answer}</p>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
