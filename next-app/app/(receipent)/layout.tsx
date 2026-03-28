import Image from "next/image"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-7rem)] px-4 pb-10">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/bg-image.jpg"
          alt="Aurora background"
          fill
          priority
          className="object-cover opacity-30"
        />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-8 rounded-[2.5rem] border border-white/10 bg-black/15 px-6 py-8 backdrop-blur-xl md:px-10 md:py-12">
        {children}
      </main>
    </div>
  )
}
