import Image from "next/image"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative ">
     

      <main className="relative mx-auto flex  flex-col gap-8 rounded-[2.5rem] pb-10 py-6">
        {children}
      </main>
    </div>
  )
}