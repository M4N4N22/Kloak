import Image from "next/image"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-7rem)] px-4 pb-10">
      {/* Fixed background */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden">
        <Image
          src="/bg-image.jpg"
          alt="Aurora background"
          fill
          priority
          className="object-cover opacity-40 blur-sm"
        />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col gap-8 rounded-[2.5rem] px-6 py-8 md:px-10 md:py-12">
        {children}
      </main>
    </div>
  )
}