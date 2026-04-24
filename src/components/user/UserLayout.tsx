import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, Compass, Library, Plus, Music, Heart, Menu, X, Search } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { VibeGarageLogo } from "@/components/ui/logo"
import { PlayerBar } from "@/components/app/PlayerBar"
import { useAppSelector } from "@/hooks/redux"
import { cn } from "@/lib/utils"

// ── Mock playlists ────────────────────────────────────────
const USER_PLAYLISTS = [
  { id: "pl1", label: "Liked music", sub: "Auto playlist", icon: Heart  },
  { id: "pl2", label: "Worship",     sub: "My playlist",   icon: Music  },
]

const NAV_LINKS = [
  { href: "/listen",         label: "Home",    icon: Home    },
  { href: "/listen/explore", label: "Explore", icon: Compass },
  { href: "/listen/library", label: "Library", icon: Library },
]

// ── Sidebar content ───────────────────────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation()

  const isActive = (href: string) =>
    href === "/listen" ? location.pathname === "/listen" : location.pathname.startsWith(href)

  return (
    <div className="flex flex-col h-full py-6 px-3">
      {/* Logo + mobile close */}
      <div className="px-2 mb-8 flex items-center justify-between">
        <VibeGarageLogo size="sm" />
        {onClose && (
          <button onClick={onClose} className="md:hidden text-vibe-text-muted hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-body font-medium transition-colors duration-150",
              isActive(item.href)
                ? "bg-vibe-onyx-300 text-white"
                : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-2 my-4 h-px bg-vibe-onyx-400" />

      {/* New playlist button */}
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm font-medium text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-400 transition-colors mb-4 mx-1">
        <Plus className="h-4 w-4" />
        New playlist
      </button>

      {/* User playlists */}
      <div className="flex flex-col gap-1">
        {USER_PLAYLISTS.map((pl) => (
          <button
            key={pl.id}
            onClick={onClose}
            className="flex flex-col px-4 py-2 rounded-md hover:bg-vibe-onyx-300/50 transition-colors text-left"
          >
            <span className="text-sm font-medium text-vibe-text-secondary">{pl.label}</span>
            <span className="text-xs text-vibe-text-muted mt-0.5">{pl.sub}</span>
          </button>
        ))}
      </div>

      {/* Account section */}
      <div className="mt-auto">
        <p className="px-4 mb-2 text-xs font-medium text-vibe-text-muted uppercase tracking-wider">Account</p>
        <div className="flex flex-col gap-1">
          <Link to="/listen/profile" onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50 transition-colors">
            <span className="h-4 w-4 text-center">👤</span> Profile
          </Link>
          <Link to="/listen/support" onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50 transition-colors">
            <span className="h-4 w-4 text-center">🎧</span> Support
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────
export function UserLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAppSelector((s) => s.auth)

  return (
    <div className="flex h-screen overflow-hidden bg-vibe-onyx">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-vibe-onyx-400 bg-vibe-onyx-100 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="user-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside key="user-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: "-100%", transition: { duration: 0.2 } }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-vibe-onyx-100 md:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 h-16 bg-vibe-onyx border-b border-vibe-onyx-400">
          <button className="md:hidden text-vibe-text-secondary hover:text-white transition-colors"
            onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vibe-text-muted" />
            <input type="text" placeholder="Search"
              className="w-full h-9 pl-9 pr-4 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 flex items-center justify-center text-xs font-heading font-semibold text-white shrink-0">
              {user?.displayName?.slice(0, 2).toUpperCase() ?? "VG"}
            </div>

            {/* VCoins balance */}
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm font-medium text-white">
              {/* Lightning bolt icon */}
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1L1 8h5l-1 5 6-7H6l1-5z" fill="#F4A435" />
              </svg>
              <span>12,678 Vcoins</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-[76px] min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Player bar — inset from left to not overlap sidebar */}
      <div className="fixed bottom-0 left-0 md:left-56 right-0 z-30">
        <PlayerBar />
      </div>
    </div>
  )
}
