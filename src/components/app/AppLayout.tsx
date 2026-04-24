import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Menu, Search, Bell, ChevronDown, DollarSign, LogOut } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AppSidebar } from "@/components/app/AppSidebar"
import { PlayerBar } from "@/components/app/PlayerBar"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { logout } from "@/store/slices/authSlice"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [earningsOpen, setEarningsOpen] = useState(false)
  const { user } = useAppSelector((s) => s.auth)

  return (
    <div className="flex h-screen overflow-hidden bg-vibe-onyx">
      {/* Sidebar — fixed height, does not scroll */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main — fills remaining width, scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 flex items-center gap-3 px-4 md:px-6 h-16 bg-vibe-onyx border-b border-vibe-onyx-400 z-20">
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-vibe-text-secondary hover:text-white transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vibe-text-muted" />
            <input
              type="text"
              placeholder="Search"
              className="w-full h-10 pl-10 pr-4 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 overflow-hidden flex items-center justify-center shrink-0">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
                : <span className="text-xs font-heading font-semibold text-white">
                    {user?.displayName?.slice(0, 2).toUpperCase() ?? "VG"}
                  </span>
              }
            </div>

            {/* Bell */}
            <button className="text-vibe-text-muted hover:text-white transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>

            {/* Earnings dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setEarningsOpen((v) => !v)}
                className="flex items-center gap-2 px-4 h-10 rounded-md border border-vibe-onyx-400 bg-vibe-onyx-200 text-sm font-medium text-white hover:bg-vibe-onyx-300 transition-colors"
              >
                <DollarSign className="h-4 w-4 text-vibe-text-muted" />
                <span>10,578,000</span>
                <ChevronDown className={cn("h-4 w-4 text-vibe-text-muted transition-transform", earningsOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {earningsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-vibe-onyx-200 border border-vibe-onyx-400 rounded-md shadow-xl z-50"
                  >
                    <EarningsDropdown onClose={() => setEarningsOpen(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content — scrolls, padded above player bar */}
        <main className="flex-1 overflow-y-auto pb-[76px]">
          <Outlet />
        </main>
      </div>

      {/* Player bar — inset from left to not overlap sidebar */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 z-30">
        <PlayerBar />
      </div>
    </div>
  )
}

function EarningsDropdown({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()

  return (
    <div className="py-1">
      <button
        onClick={onClose}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300 transition-colors"
      >
        <DollarSign className="h-4 w-4" />
        Request payout
      </button>
      <button
        onClick={() => dispatch(logout())}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  )
}
