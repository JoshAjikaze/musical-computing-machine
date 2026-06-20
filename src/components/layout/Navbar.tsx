import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VibeGarageLogo } from "@/components/ui/logo"
import { InstallAppDialog } from "@/components/app/InstallAppDialog"
import { useAppSelector } from "@/hooks/redux"
import { cn } from "@/lib/utils"

/**
 * Public landing-page header.
 * Only rendered on "/" (see App.tsx Layout()) — kept intentionally minimal
 * to match the marketing site design: logo + Download/FAQ links.
 */
const NAV_LINKS = [
  { label: "Download", action: "install" as const },
  { label: "FAQ",       action: "scroll" as const, href: "#faq" },
]

export function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const [isScrolled, setIsScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [installOpen, setInstallOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleNavClick = (link: (typeof NAV_LINKS)[number]) => {
    setMobileOpen(false)
    if (link.action === "install") {
      setInstallOpen(true)
    } else if (link.href) {
      document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-vibe-onyx/90 backdrop-blur-md border-b border-vibe-onyx-400/40 py-4"
            : "bg-transparent py-6"
        )}
      >
        <nav className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <VibeGarageLogo size="md" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="text-sm font-body font-medium text-white hover:text-vibe-text-secondary transition-colors"
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/listen")}
                className="text-sm font-body font-medium text-vibe-red hover:text-vibe-red-hover transition-colors"
              >
                Go to App
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white hover:text-vibe-text-secondary transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[64px] z-30 bg-vibe-onyx-100/98 backdrop-blur-md border-b border-vibe-onyx-400 md:hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-1">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(link)}
                  className="block w-full text-left px-2 py-3 text-base font-body font-medium text-white hover:text-vibe-text-secondary transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/listen")}
                  className="block w-full text-left px-2 py-3 text-base font-body font-medium text-vibe-red"
                >
                  Go to App
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallAppDialog open={installOpen} onClose={() => setInstallOpen(false)} />
    </>
  )
}
