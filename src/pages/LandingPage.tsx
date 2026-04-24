import { HeroSection } from "@/components/features/hero/HeroSection"
import { FeaturesSection } from "@/components/features/features-section/FeaturesSection"
import { FAQSection } from "@/components/features/faq/FAQSection"
import { Footer } from "@/components/features/footer/Footer"
import { CTABanner } from "@/components/features/CTABanner"

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <CTABanner />
      <FAQSection />
      <Footer />
    </main>
  )
}
