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
        <p className="text-xs text-vibe-text-muted mb-10">
          Effective Date: March 8, 2026 &nbsp;·&nbsp; Last Updated: June 18, 2026
        </p>

        <div className="space-y-8 text-sm text-vibe-text-secondary leading-relaxed">
          <section>
            <p>
              Welcome to VibeGarage ("we," "our," or "us"). We are committed to protecting your
              privacy and ensuring a secure environment for music fans, artists, and creators.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit and use our web application located at{" "}
              <a href="https://vibegarage.app" className="text-vibe-amber hover:underline">
                https://vibegarage.app
              </a>{" "}
              (the "Platform").
            </p>
            <p className="mt-3">
              Please read this Privacy Policy carefully. By accessing or using the Platform, you
              agree to the terms of this Privacy Policy. If you do not agree with the terms of
              this policy, please do not access the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information about you in three ways: information you provide directly,
              information collected automatically, and information from third-party services.
            </p>

            <h3 className="font-heading text-sm font-semibold text-white/90 mb-2">A. Information You Provide Directly</h3>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted mb-4">
              <Bullet label="Account Information">
                When you register an account on VibeGarage, we collect your email address,
                password, username, and account type (e.g., Artist, Fan, Listener).
              </Bullet>
              <Bullet label="Creator Profile Information">
                If you use the Platform as an artist or content creator, we collect profile data
                including your artist name, biography, profile graphics, social media links, and
                any tracks, singles, EPs, or album metadata you explicitly upload.
              </Bullet>
              <Bullet label="Communications">
                We collect information when you contact our support team, report an issue, or
                interact with us via email.
              </Bullet>
            </ul>

            <h3 className="font-heading text-sm font-semibold text-white/90 mb-2">B. Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted mb-4">
              <Bullet label="Log and Usage Data">
                When you stream audio or navigate the site, our servers automatically log details
                such as your IP address, browser type, device operating system, referral URLs,
                pages viewed, tracks played, and duration of streaming sessions.
              </Bullet>
              <Bullet label="Cookies and Tracking">
                We use standard web cookies and local storage tokens to keep you securely logged
                into your session, remember your player volume preferences, and analyze platform
                traffic patterns.
              </Bullet>
            </ul>

            <h3 className="font-heading text-sm font-semibold text-white/90 mb-2">C. Information from Third-Party Services</h3>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted">
              <Bullet label="Analytics and Infrastructure">
                We use third-party tools to host our database, backend infrastructure, and
                optimize application delivery (such as Supabase, Render, and Netlify). These
                networks process diagnostic logs securely on our behalf.
              </Bullet>
              <Bullet label="Advertising Partners">
                We partner with third-party advertising networks, including PropellerAds, to
                serve ads when you visit the Platform. These companies may use cookies, tracking
                pixels, and device identifiers to collect anonymous data about your visits to
                VibeGarage and other websites to serve targeted advertisements.
              </Bullet>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">
              We use the information we collect to maintain, secure, and improve the VibeGarage
              streaming ecosystem. Specifically, we use your data to:
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted">
              <li>Manage, secure, and authenticate your user or creator account.</li>
              <li>Process, transcode, stream, and display your uploaded audio files, EPs, and creator profiles.</li>
              <li>Analyze user engagement metrics to improve our streaming delivery network and UI application layouts.</li>
              <li>Detect, prevent, and mitigate security threats, technical bugs, copyright infringement, or fraudulent activities.</li>
              <li>Deliver targeted or contextual advertisements through our monetization partners to fund our free streaming tier.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">3. Sharing and Disclosure of Your Information</h2>
            <p className="mb-3">
              We do not sell your personal data. We only share information in the following
              specific circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted">
              <Bullet label="Public Creator Profiles">
                Any tracks, album titles, artwork, artist names, and bios uploaded by creators are
                public-facing by design and can be searched, indexed by web engines, and viewed by
                anyone on the internet.
              </Bullet>
              <Bullet label="Third-Party Service Providers">
                We share necessary data with trusted cloud vendors (such as cloud hosting,
                authentication systems, and database management) operating under strict data
                security obligations.
              </Bullet>
              <Bullet label="Advertising & Monetization Providers">
                Anonymous device identifiers and traffic patterns may be shared with PropellerAds
                and related partners to optimize ad placements.
              </Bullet>
              <Bullet label="Legal Requirements">
                We may disclose your information if required to do so by applicable laws, law
                enforcement commands, or valid court orders to protect the rights, property, and
                safety of VibeGarage and our community.
              </Bullet>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">4. Data Security</h2>
            <p>
              The security of your information is incredibly important to us. We secure data
              connections using global industry standards, including HTTPS/SSL data transit
              encryption across all API routing tiers. However, please note that no method of
              transmission over the internet or method of electronic storage is 100% secure, and
              we cannot guarantee absolute data security.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">5. Your Data Rights & Choices</h2>
            <p className="mb-3">
              Depending on your geographic location, you may have rights regarding your personal
              information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-vibe-text-muted">
              <Bullet label="Access and Correction">
                You can review, update, or edit your core profile details at any time by logging
                into your VibeGarage settings dashboard.
              </Bullet>
              <Bullet label="Account Deletion">
                You may request the permanent deletion of your account, uploaded audio files, and
                historical database attributes by contacting our support team.
              </Bullet>
              <Bullet label="Cookie Opt-Outs">
                You can configure your local web browser to reject cookies or alerts, though
                certain parts of the streaming dashboard player may lose functional tracking
                context if you do so.
              </Bullet>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">6. Children's Privacy</h2>
            <p>
              VibeGarage is not intended for use by individuals under the age of 13. We do not
              knowingly collect or maintain personal information from children under 13 years of
              age. If we discover that a child under 13 has provided us with personal data, we
              will take immediate steps to delete that account and clear the information from our
              servers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We reserve the right to update or modify this Privacy Policy at any time. We will
              notify you of any structural updates by revising the "Effective Date" at the top of
              this document. Your continued use of the Platform after changes are posted
              constitutes your explicit acceptance of the revised Privacy Policy terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-base font-semibold text-white mb-3">8. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or
              your data handling on VibeGarage, please reach out to us at:
            </p>
            <p className="mt-2">
              VibeGarage Entertainment
              <br />
              Email:{" "}
              <a href="mailto:support@vibegarage.app" className="text-vibe-amber hover:underline">
                support@vibegarage.app
              </a>
              <br />
              Website:{" "}
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
