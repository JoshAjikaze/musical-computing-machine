import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, Compass, Library, Plus, Heart, Menu, X, Search, Music2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { VibeGarageLogo } from "@/components/ui/logo"
import { PlayerBar } from "@/components/app/PlayerBar"
import { QueuePanel } from "@/components/app/QueuePanel"
import { CreatePlaylistDialog } from "@/components/app/CreatePlaylistDialog"
import { useAppSelector } from "@/hooks/redux"
import { useGetMyFavoritesQuery } from "@/store/api/vibeApi"
import { AvatarDropdown } from "@/components/app/AvatarDropdown"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/listen",         label: "Home",    icon: Home    },
  { href: "/listen/explore", label: "Explore", icon: Compass },
  { href: "/listen/library", label: "Library", icon: Library },
]

// ── Sidebar ───────────────────────────────────────────────
function SidebarContent({
  onClose,
  onNewPlaylist,
}: {
  onClose?: () => void
  onNewPlaylist: () => void
}) {
  const location = useLocation()
  const playlists = useAppSelector((s) => s.playlists.playlists)
  const { data: favorites } = useGetMyFavoritesQuery()
  const likedCount = favorites?.tracks.length ?? 0

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
      <button
        onClick={onNewPlaylist}
        className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm font-medium text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-400 transition-colors mb-3 mx-1"
      >
        <Plus className="h-4 w-4" />
        New playlist
      </button>

      {/* Liked music — always present */}
      <Link
        to="/listen/liked"
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-vibe-onyx-300/50 transition-colors group mx-1 mb-1",
          isActive("/listen/liked") && "bg-vibe-onyx-300"
        )}
      >
        <div className="h-7 w-7 rounded-sm bg-gradient-to-br from-vibe-purple to-vibe-red flex items-center justify-center shrink-0">
          <Heart className="h-3.5 w-3.5 text-white fill-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-vibe-text-secondary group-hover:text-white transition-colors truncate">
            Liked music
          </p>
          <p className="text-[10px] text-vibe-text-muted">
            {likedCount} {likedCount === 1 ? "track" : "tracks"}
          </p>
        </div>
      </Link>

      {/* User playlists — live from Redux */}
      <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto scrollbar-vibe">
        {playlists.map((pl) => (
          <Link
            key={pl.id}
            to={`/listen/library`}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-vibe-onyx-300/50 transition-colors group mx-1"
          >
            <div className="h-7 w-7 rounded-sm bg-vibe-onyx-400 shrink-0 overflow-hidden flex items-center justify-center">
              {pl.coverUrl ? (
                <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
              ) : (
                <Music2 className="h-3.5 w-3.5 text-vibe-text-muted" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-vibe-text-secondary group-hover:text-white transition-colors truncate">
                {pl.name}
              </p>
              <p className="text-[10px] text-vibe-text-muted">{pl.tracks.length} tracks</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Account */}
      <div className="mt-4 pt-4 border-t border-vibe-onyx-400">
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
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-vibe-onyx">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-vibe-onyx-400 bg-vibe-onyx-100 h-screen overflow-y-auto">
        <SidebarContent onNewPlaylist={() => setCreatePlaylistOpen(true)} />
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
              <SidebarContent
                onClose={() => setMobileOpen(false)}
                onNewPlaylist={() => { setMobileOpen(false); setCreatePlaylistOpen(true) }}
              />
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

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vibe-text-muted" />
            <input type="text" placeholder="Search"
              className="w-full h-9 pl-9 pr-4 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <AvatarDropdown profileHref="/listen/profile" logoutRedirect="/login" />
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm font-medium text-white">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M7 1L1 8h5l-1 5 6-7H6l1-5z" fill="#F4A435" /></svg>
              <span>0 Vcoins</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-[76px] min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Queue panel — slides in over the player */}
      <QueuePanel />

      {/* Player bar */}
      <div className="fixed bottom-0 left-0 md:left-56 right-0 z-30">
        <PlayerBar />
      </div>

      {/* Create playlist dialog */}
      <CreatePlaylistDialog
        open={createPlaylistOpen}
        onClose={() => setCreatePlaylistOpen(false)}
      />
    </div>
  )
}
