import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function TermsAndConditionsPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-vibe-onyx px-4 py-12 md:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-vibe-text-muted hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="font-heading text-3xl font-bold text-white mb-2">Terms and Conditions</h1>
        <p className="text-xs text-vibe-text-muted mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-vibe-text-secondary leading-relaxed">
          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Vibe Garage, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">2. Use of the Platform</h2>
            <p>You agree to use Vibe Garage only for lawful purposes. You must not upload, post, or transmit any content that infringes third-party rights, is harmful, or violates applicable laws.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">3. Artist Content</h2>
            <p>Artists retain ownership of content they upload. By uploading to Vibe Garage, you grant us a non-exclusive, worldwide licence to host, stream, and display your content to users of the platform.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">4. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">5. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to Vibe Garage at our discretion, including for violation of these terms, without prior notice.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>Vibe Garage is provided on an "as is" basis. We make no warranties regarding the availability, accuracy, or reliability of the platform and shall not be liable for any indirect or consequential damages.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">7. Contact</h2>
            <p>
              Questions about these terms? Reach us at{" "}
              <a href="mailto:Hello@vibegarage.app" className="text-vibe-amber hover:underline">
                Hello@vibegarage.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
