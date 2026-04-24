import { Link } from "react-router-dom"
import { Twitter, Instagram, Facebook, Youtube, Music2 } from "lucide-react"
import { VibeGarageLogo } from "@/components/ui/logo"
import { ContactForm } from "@/components/features/forms/ContactForm"

const FOOTER_LINKS = {
  Product: [
    { label: "Become an Artist", href: "/artists/apply" },
    { label: "Download", href: "/download" },
    { label: "Support", href: "/support" },
  ],
  Company: [
    { label: "Privacy", href: "/privacy" },
    { label: "Careers", href: "/careers" },
    { label: "Admin", href: "/admin" },
  ],
}

const SOCIAL_LINKS = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Music2, href: "#", label: "Music" },
]

export function Footer() {
  return (
    <footer className="relative border-t border-vibe-onyx-400/40 bg-vibe-onyx-100">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vibe-red/30 to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left column — logo + links */}
          <div className="space-y-8">
            <VibeGarageLogo size="md" />

            <div className="grid grid-cols-2 gap-8">
              {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                <div key={category}>
                  <h4 className="font-heading text-sm font-semibold text-vibe-amber uppercase tracking-wider mb-4">
                    {category}
                  </h4>
                  <ul className="space-y-2.5">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-sm text-vibe-text-secondary hover:text-white transition-colors duration-150"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div>
              <p className="text-xs font-heading font-semibold text-vibe-text-muted uppercase tracking-wider mb-3">
                Connect with us
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 flex items-center justify-center rounded-sm bg-vibe-onyx-300 border border-vibe-onyx-400 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 hover:border-vibe-text-muted transition-all duration-150"
                  >
                    <social.icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — contact form */}
          <div>
            <h4 className="font-heading text-base font-semibold text-vibe-text-primary mb-1">
              We would love to hear from you. Send us a message
            </h4>
            <p className="text-xs text-vibe-text-muted mb-6">
              Our team typically responds within 24 hours.
            </p>
            <ContactForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-vibe-onyx-400/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-vibe-text-muted">
            © CIEL TECHNOLOGY LTD {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4 text-xs text-vibe-text-muted">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
