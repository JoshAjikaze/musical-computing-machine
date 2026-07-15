import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

function Bullet({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <li className="pl-1">
      {label && <span className="font-semibold text-white">{label}: </span>}
      {children}
    </li>
  )
}

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
        <p className="text-xs text-vibe-text-muted mb-10">
          Effective Date: March 8, 2026 &nbsp;·&nbsp; Last Updated: June 18, 2026
        </p>

        <div className="space-y-8 text-sm text-vibe-text-secondary leading-relaxed">
          <section>
            <p>
              Welcome to VibeGarage ("we," "our," or "us"). By accessing or using our web
              application located at{" "}
              <a href="https://vibegarage.app" className="text-vibe-amber hover:underline">
                https://vibegarage.app
              </a>{" "}
              (the "Platform"), you agree to comply with and be bound by the following Terms and
              Conditions (the "Terms"). Please read them carefully. If you do not agree to these
              Terms, you must immediately cease using the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account, streaming audio, uploading media, or navigating VibeGarage,
              you represent that you are at least 13 years of age and possess the legal capacity
              to enter into a binding agreement. If you are using the Platform on behalf of an
              entity, artist collective, or record label, you represent that you have the
              authority to bind that entity to these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">2. User Accounts & Security</h2>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted">
              <Bullet label="Registration">
                To access certain features of the Platform, including uploading music (Singles,
                EPs) or curating playlists, you must create a user account. You agree to provide
                accurate, current, and complete information during registration.
              </Bullet>
              <Bullet label="Account Responsibility">
                You are solely responsible for maintaining the confidentiality of your account
                credentials. You agree to accept responsibility for all activities that occur
                under your account.
              </Bullet>
              <Bullet label="Termination">
                We reserve the right to suspend, restrict, or terminate your account at our sole
                discretion, without notice, for behavior that violates these Terms, infringes on
                third-party intellectual property, or harms the platform's community.
              </Bullet>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">
              3. User-Generated Content & Intellectual Property (For Artists & Creators)
            </h2>
            <p className="mb-3">
              As a creator on VibeGarage, you retain ownership of the original audio files,
              metadata, lyrics, and artwork you upload. However, by uploading content, you grant
              VibeGarage a specific license to operate:
            </p>

            <h3 className="font-heading text-sm font-semibold text-white/90 mb-2">The License Grant</h3>
            <p className="mb-4">
              You grant VibeGarage a worldwide, non-exclusive, royalty-free, sublicensable license
              to host, store, stream, transcode, reproduce, distribute, display, and publicly
              perform your uploaded audio tracks and metadata solely for the purpose of running the
              streaming platform.
            </p>

            <h3 className="font-heading text-sm font-semibold text-white/90 mb-2">Content Ownership Assurances</h3>
            <p className="mb-2">You explicitly represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted mb-4">
              <li>You own or have secured all necessary rights, licenses, clearances, and permissions to upload and stream the audio tracks, samples, beats, and graphics.</li>
              <li>Your content does not infringe upon the copyrights, trademarks, privacy rights, or intellectual property rights of any third party.</li>
            </ul>

            <h3 className="font-heading text-sm font-semibold text-white/90 mb-2">Prohibited Content</h3>
            <p>
              You may not upload bootlegs, unauthorized remixes, audio files containing uncleared
              commercial samples, hate speech, defamatory material, or malicious software code.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">
              4. Digital Millennium Copyright Act (DMCA) & Copyright Infringement
            </h2>
            <p className="mb-3">
              VibeGarage respects intellectual property rights and will respond swiftly to claims
              of copyright infringement. If you believe that any material on our Platform
              infringes upon a copyright you own or control, you may submit a formal takedown
              notice to our designated agent at{" "}
              <a href="mailto:support@vibegarage.app" className="text-vibe-amber hover:underline">
                support@vibegarage.app
              </a>{" "}
              containing:
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted">
              <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>The exact URL/link on VibeGarage where the infringing material is located.</li>
              <li>Your active contact information (email address and phone number).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">5. Permitted Use & Streaming Restrictions</h2>
            <p className="mb-3">
              Listeners and creators agree to use VibeGarage strictly for its intended
              entertainment and community discovery purposes. You explicitly agree NOT to:
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted">
              <li>Deploy automated scrapers, bots, crawlers, or scripts to rip, harvest, or download audio streams from the Platform.</li>
              <li>Attempt to artificially inflate stream counters, track views, or follower counts through botnets or coordinated click-manipulation scripts.</li>
              <li>Circumvent, disable, or interfere with any security-related features, digital rights management, or monetization filters (including third-party ad layouts served by PropellerAds).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">6. Monetization & Advertisements</h2>
            <p>
              VibeGarage provides a free-tier streaming experience supported by programmatic
              third-party advertisements (such as PropellerAds). By using the platform, you
              acknowledge and agree that we may display visual, native, or audio advertisements
              across our frontend interfaces. We are not responsible for the products, services,
              or content featured in third-party advertisements.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">7. Limitation of Liability & "As-Is" Disclaimer</h2>
            <p className="mb-3">
              VibeGarage is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of
              any kind, either express or implied, including but not limited to uptime stability,
              the prevention of temporary server lag, or data transmission speeds on Render or
              Netlify servers.
            </p>
            <p>
              To the maximum extent permitted by applicable law, VibeGarage, its founders, and
              team members shall not be held liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits, data, goodwill, or
              audio files resulting from your access to or inability to access the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">8. Governing Law</h2>
            <p>
              These Terms shall be governed by, construed, and enforced in accordance with the
              laws of the Federal Republic of Nigeria, without regard to its conflict of law
              principles. Any legal actions or proceedings arising out of these terms shall be
              brought exclusively in the appropriate courts located in Nigeria.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">9. Modifications to the Terms</h2>
            <p>
              We reserve the right to revise and modify these Terms and Conditions at any time. We
              will indicate structural changes by updating the "Last Updated" date at the top of
              this page. Your continued use of the platform following any modifications
              constitutes your formal acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">10. Contact Information</h2>
            <p>
              If you have any questions or need clarity regarding these Terms and Conditions,
              please reach out to our administration team at:
            </p>
            <p className="mt-2">
              VibeGarage Entertainment
              <br />
              Email:{" "}
              <a href="mailto:support@vibegarage.app" className="text-vibe-amber hover:underline">
                support@vibegarage.app
              </a>
              <br />
              Platform:{" "}
              <a href="https://vibegarage.app" className="text-vibe-amber hover:underline">
                https://vibegarage.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
