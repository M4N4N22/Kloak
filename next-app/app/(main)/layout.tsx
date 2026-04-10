import { AppTrustFooter } from "@/features/trust/components/app-trust-footer"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative ">
     

      <main className="relative mx-auto flex  flex-col gap-8 rounded-[2.5rem] pb-10 py-6">
          <div className="pointer-events-none fixed inset-0 -z-10 hidden">
            {/* The Dot Matrix Layer */}
           

            {/* The Glow/Vignette Layers */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,246,106,0.08),transparent_28%)]" />
            <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_65%)]" />
          </div>
        {children}
      </main>
      <AppTrustFooter />
    </div>
  )
}
