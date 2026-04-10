import { LandingFooter } from "@/features/landing/components/landing-footer"
import { LandingCtaSection } from "@/features/landing/sections/landing-cta-section"
import { LandingDisclosureSection } from "@/features/landing/sections/landing-disclosure-section"
import { LandingFaqSection } from "@/features/landing/sections/landing-faq-section"
import { LandingHeroSection } from "@/features/landing/sections/landing-hero-section"
import { LandingOperationsSection } from "@/features/landing/sections/landing-operations-section"
import { LandingPillarsSection } from "@/features/landing/sections/landing-pillars-section"
import { LandingPrivacySection } from "@/features/landing/sections/landing-privacy-section"
import { LandingStorySection } from "@/features/landing/sections/landing-story-section"

export function LandingPage() {
  return (
    <div className="min-h-screen  text-foreground selection:bg-primary/20 selection:text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* The Dot Matrix Layer */}
        <div
          className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-size-[40px_40px] "
        />

        {/* The Glow/Vignette Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,246,106,0.08),transparent_28%)]" />
        <div className="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_65%)]" />
      </div>

      <main className="relative">
        <LandingHeroSection />
        <LandingStorySection />
        <LandingPillarsSection />
        <LandingDisclosureSection />
        <LandingOperationsSection />
        <LandingPrivacySection />
        <LandingFaqSection />
        <LandingCtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
