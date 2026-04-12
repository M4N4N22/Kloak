import { TrustLinksRow } from "@/features/trust/components/trust-links-row"

type AppTrustFooterProps = {
  note?: string
}

export function AppTrustFooter({
  note = "Settle Privately, Disclose Selectively.",
}: AppTrustFooterProps) {
  return (
    <footer className="mx-auto w-full max-w-7xl px-6 pb-8 pt-2">
      <div className="rounded-[1.75rem] border px-5 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">{note}</p>
          <TrustLinksRow className="justify-start sm:justify-end" />
        </div>
      </div>
    </footer>
  )
}
