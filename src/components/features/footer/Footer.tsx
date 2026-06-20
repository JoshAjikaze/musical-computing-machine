import { useState } from "react"
import { Link } from "react-router-dom"
import { Linkedin, Facebook, Instagram, Twitter } from "lucide-react"
import { VibeGarageLogo } from "@/components/ui/logo"
import { InstallAppDialog } from "@/components/app/InstallAppDialog"

const COMPANY_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Careers", href: "/careers" },
]

const SOCIAL_LINKS = [
  { icon: WhatsAppIcon, href: "https://wa.me", label: "WhatsApp" },
  { icon: Linkedin,     href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Facebook,     href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram,    href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter,      href: "https://twitter.com", label: "X" },
  { icon: TikTokIcon,   href: "https://tiktok.com", label: "TikTok" },
]

export function Footer() {
  const [installOpen, setInstallOpen] = useState(false)

  return (
    <footer id="footer" className="relative bg-vibe-onyx border-t border-vibe-onyx-400/40">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Logo */}
          <div className="shrink-0">
            <VibeGarageLogo size="md" />
          </div>

          {/* Link columns */}
          <div className="flex gap-16 md:gap-24 order-3 md:order-2">
            <div>
              <h4 className="font-heading text-sm font-semibold text-vibe-amber mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    type="button"
                    onClick={() => setInstallOpen(true)}
                    className="text-sm text-white hover:text-vibe-text-secondary transition-colors duration-150"
                  >
                    Download
                  </button>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-sm text-white hover:text-vibe-text-secondary transition-colors duration-150"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-vibe-amber mb-4">Company</h4>
              <ul className="space-y-2.5">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-white hover:text-vibe-text-secondary transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Connect + copyright */}
          <div className="space-y-6 order-2 md:order-3">
            <div>
              <p className="text-sm font-body font-semibold text-white mb-3">Connect with us</p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-vibe-text-secondary hover:text-white transition-colors duration-150"
                  >
                    <social.icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>
            <p className="text-xs text-vibe-text-muted">
              (c) CIEL TECHNOLOGY LTD {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <InstallAppDialog open={installOpen} onClose={() => setInstallOpen(false)} />
    </footer>
  )
}

// ── Inline icons not present in lucide-react ──────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.018-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z"/>
      <path d="M12.05 0C5.495 0 .16 5.335.16 11.892c0 2.096.547 4.142 1.587 5.945L.057 24l6.305-1.654a11.86 11.86 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.336 11.89-11.892 0-3.176-1.236-6.165-3.481-8.41A11.819 11.819 0 0 0 12.05 0Zm0 21.785a9.89 9.89 0 0 1-5.043-1.382l-.362-.215-3.74.981.998-3.648-.236-.374a9.864 9.864 0 0 1-1.512-5.255c0-5.448 4.435-9.884 9.897-9.884 2.642 0 5.127 1.032 6.994 2.901a9.825 9.825 0 0 1 2.897 6.991c0 5.448-4.434 9.885-9.893 9.885Z"/>
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"/>
    </svg>
  )
}
