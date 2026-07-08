import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function PrivacyPolicyPage() {
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

        <h1 className="font-heading text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-xs text-vibe-text-muted mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-sm text-vibe-text-secondary leading-relaxed">
          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, upload content, or contact us for support. This includes your name, email address, and any content you submit to the platform.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to operate and improve Vibe Garage, personalise your experience, send you service-related communications, and ensure platform security.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">3. Sharing of Information</h2>
            <p>We do not sell your personal data. We may share information with trusted service providers who assist us in operating the platform, subject to confidentiality obligations.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">4. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">5. Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">6. Advertising & Cookies</h2>
            <p>
              Vibe Garage may display advertisements served by Google AdSense. Google and its
              partners use cookies and similar technologies to serve ads based on your prior
              visits to this and other websites. You can opt out of personalised advertising by
              visiting{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vibe-amber hover:underline"
              >
                Google Ads Settings
              </a>
              , or opt out of third-party vendors' use of cookies for personalised advertising by
              visiting{" "}
              <a
                href="https://optout.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vibe-amber hover:underline"
              >
                www.aboutads.info
              </a>
              . For more on how Google uses information from sites that use its services, see{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vibe-amber hover:underline"
              >
                How Google uses information from sites or apps that use our services
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">7. Contact</h2>
            <p>
              For privacy-related enquiries, please contact us at{" "}
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
