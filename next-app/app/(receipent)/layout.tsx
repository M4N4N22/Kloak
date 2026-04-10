import { AppTrustFooter } from "@/features/trust/components/app-trust-footer"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative ">
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* The Dot Matrix Layer */}
        <div
          className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-size-[40px_40px] "
        />
      </div>

      <main className="relative mx-auto flex  flex-col gap-8 rounded-[2.5rem] p-4">
        {children}
      </main>
      <AppTrustFooter note="Need to check the product first? Privacy, terms, and docs are one tap away." />
    </div>
  )
}
