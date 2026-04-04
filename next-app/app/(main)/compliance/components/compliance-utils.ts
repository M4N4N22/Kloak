"use client"

export function prettyDate(value?: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleString()
}

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}
