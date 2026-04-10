"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

type DocsCodeBlockProps = {
  code: string
  language?: string
  title?: string
}

const MAC_DOTS = ["#ff5f57", "#febc2e", "#28c840"]

export function DocsCodeBlock({
  code,
  language = "txt",
  title,
}: DocsCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-zinc-950 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between border-b border-foreground/6 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {MAC_DOTS.map((color) => (
              <span
                key={color}
                className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
            ))}
          </div>

          {title ? (
            <span className="text-sm text-zinc-300">{title}</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="overflow-x-auto p-4">
        <pre className="text-sm leading-7 text-zinc-200">
          <code data-language={language}>{code}</code>
        </pre>
      </div>
    </div>
  )
}