import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { VibeGarageLogo } from "@/components/ui/logo"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { toggleMobileMenu, closeMobileMenu } from "@/store/slices/uiSlice"
import { logout } from "@/store/slices/authSlice"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Discover", href: "/discover" },
  { label: "Artists",  href: "/artists" },
  { label: "Charts",   href: "/charts" },
  { label: "Pricing",  href: "/pricing" },
]

export function Navbar() {
  const dispatch   = useAppDispatch()
  const location   = useLocation()
  const navigate   = useNavigate()
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const { isMobileMenuOpen }      = useAppSelector((s) => s.ui)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { dispatch(closeMobileMenu()) }, [location.pathname, dispatch])

  const initials = user?.displayName
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-vibe-onyx/95 backdrop-blur-md border-b border-vibe-onyx-400/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <nav className="container mx-auto px-4 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0"><VibeGarageLogo size="md" /></Link>

          <ul className="hidden md:flex items-center gap-1 invisible">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-body font-medium rounded-sm transition-colors duration-150",
                    location.pathname === link.href
                      ? "text-white bg-vibe-onyx-300"
                      : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 text-vibe-text-muted hover:text-white transition-colors rounded-sm hover:bg-vibe-onyx-300" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 hover:border-vibe-red flex items-center justify-center text-xs font-heading font-semibold text-vibe-text-primary cursor-pointer transition-all">
                  {initials}
                </div>
                <Button variant="ghost" size="sm" onClick={() => dispatch(logout())}>Sign Out</Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
                <Button variant="default" size="sm" onClick={() => navigate("/join")}>Join the Vibe</Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-vibe-text-secondary hover:text-white transition-colors"
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[64px] z-30 bg-vibe-onyx-100/98 backdrop-blur-md border-b border-vibe-onyx-400 md:hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-sm font-body font-medium transition-colors",
                      location.pathname === link.href
                        ? "text-white bg-vibe-onyx-300"
                        : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 border-t border-vibe-onyx-400 space-y-3">
                {isAuthenticated ? (
                  <Button variant="outline" className="w-full" onClick={() => dispatch(logout())}>Sign Out</Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>Sign In</Button>
                    <Button variant="default" className="w-full" onClick={() => navigate("/join")}>Join the Vibe</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
