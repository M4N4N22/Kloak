import Image from "next/image"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { WalletConnect } from "@/components/wallet-connect"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen text-foreground bg-black">

      {/* Background */}

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 ">
        <Image
          src="/bg-image.jpg"
          alt="Aurora background"
          fill
          priority
          className="object-cover  opacity-40"
        />
      </div>


      {/* Main column */}
      <div className="relative flex flex-col flex-1 rounded-[3rem] border m-2 overflow-hidden h-[calc(100vh-1rem)] max-w-7xl mx-auto ">



        {/* Topbar */}
        <header className="flex items-center justify-between backdrop-blur-3xl border-b shadow-xl px-5 py-3 shrink-0">

          <div className="text-sm rounded-full py-4 px-6 shadow-xl">
            Live on <span className="text-primary">Aleo</span> Testnet
          </div>

          <Link href="/">
            <div className="flex items-center shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-br from-primary via-green-400 to-emerald-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <Image
                  src="/kloak_logo.png"
                  alt="Kloak"
                  height={32}
                  width={32}
                  className="relative rounded-full border border-white/10"
                />
              </div>
              <span className="font-bold tracking-tight text-3xl text-foreground">
                loak
              </span>
            </div>
          </Link>

          <WalletConnect />
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto z-10">
          <main className="px-10 py-12 max-w-6xl mx-auto flex flex-col gap-8">
            {children}
          </main>
        </div>

      </div>
    </div>
  )
}