import { HeroSection } from "@/components/features/hero/HeroSection"
// import { FAQSection } from "@/components/features/faq/FAQSection"
import { Footer } from "@/components/features/footer/Footer"

export function LandingPage() {
  return (
    <main className="bg-vibe-onyx">
      <HeroSection />
      {/* <FAQSection /> */}
      <Footer />
    </main>
  )
}
