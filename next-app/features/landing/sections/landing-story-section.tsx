import Image from "next/image"
import { SectionHeading } from "@/features/landing/components/section-heading"
import { cn } from "@/lib/utils"

const storySequence = [
  {
    step: "01",
    label: "Step 01",
    title: "Request",
    body: "Initiate with a secure payment link.",
    image: "/landing/request.png",
  },
  {
    step: "02",
    label: "Step 02",
    title: "Settle",
    body: "Complete the payment with total privacy.",
    image: "/landing/settle.png",
  },
  {
    step: "03",
    label: "Step 03",
    title: "Disclose",
    body: "Share only the cryptographic proof you need.",
    image: "/landing/disclose.png",
  },
]

export function LandingStorySection() {
  return (
    <section id="story" className="relative overflow-hidden px-4 py-24 sm:py-32">
      {/* 1. Ambient Background Glow (Softer, wider Vercel style) */}
             <div className="absolute right-0 top-0 h-16 w-16 opacity-10 transition-opacity group-hover:opacity-30">
         
               
                </div>

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="The Story"
          title="One Seamless Flow."
          description="A private, verifiable system. From request to disclosure."
          centered
        />

        {/* 2. THE STORY SEQUENCE (Integrated Viewport) */}
        <div className="mt-20 grid gap-6 lg:grid-cols-3 lg:items-center">

          {/* Main Visual: Interconnected Step Cards (cols 1-8) */}
          <div className="group lg:col-span-8 [perspective:2000px]">
            <div className="flex flex-col gap-6 sm:flex-row [transform-style:preserve-3d]">
              {storySequence.map((item, index) => (
                <StoryCard key={item.step} item={item} index={index} />
              ))}
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}

interface StoryCardProps {
  item: {
    step: string;
    label: string;
    title: string;
    body: string;
    image: string;
  };
  index: number;
}

function StoryCard({ item, index }: StoryCardProps) {
  return (
    <div 
      className={cn(
        "relative flex flex-col group overflow-hidden rounded-[2rem] transition-all duration-700 ease-out p-4 bg-gradient-to-b from-white/5 to-transparent sm:w-1/3",
        "backdrop-blur-xl shadow-2xl shadow-black/40"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >

      {/* Image (fixed ratio) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem]">
        <Image
          src={item.image}
          alt={`${item.title} step preview`}
          fill
          quality={100}
          priority
          className="object-cover transition-transform duration-700 ease-out scale-[1.05] rounded-[1.5rem] "
        />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-full bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Watermark */}
      <span className="absolute right-6 bottom-8 z-20 select-none text-7xl font-bold tracking-tighter text-foreground/70">
        {item.step}
      </span>

      {/* Text */}
      <div className="relative z-20 space-y-2 py-8 px-4 text-left">
        <h3 className="text-xl font-bold tracking-tight text-white">
          {item.title}
        </h3>
        <p className="text-xs leading-relaxed text-neutral-400 group-hover:text-neutral-300">
          {item.body}
        </p>
      </div>

    </div>
  )
}
