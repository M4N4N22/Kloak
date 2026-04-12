import Image from "next/image"

import { AppTrustFooter } from "@/features/trust/components/app-trust-footer"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-7rem)] px-4 pb-10">
      <main className="relative mx-auto flex max-w-[90rem] flex-col gap-8 rounded-[2.5rem] px-6 py-8 md:px-10 md:py-12">
        <div className="pointer-events-none fixed inset-0 -z-10 hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,246,106,0.08),transparent_28%)]" />
          <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_65%)]" />
        </div>
        {children}
      </main>
      <AppTrustFooter />
    </div>
  )
}