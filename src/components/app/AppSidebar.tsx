import { Link, useLocation } from "react-router-dom"
import { X, BarChart2, Music2, MonitorPlay, Compass, User, Headphones, LogOut } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { VibeGarageLogo } from "@/components/ui/logo"
import { useAppDispatch } from "@/hooks/redux"
import { logout } from "@/store/slices/authSlice"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Analytics", href: "/app",          icon: BarChart2   },
  { label: "My music",  href: "/app/my-music",  icon: Music2      },
  { label: "Earnings",  href: "/app/earnings",  icon: MonitorPlay },
  { label: "Explore",   href: "/app/explore",   icon: Compass     },
]

const ACCOUNT_ITEMS = [
  { label: "Profile", href: "/app/profile", icon: User       },
  { label: "Support", href: "/app/support", icon: Headphones },
]

interface AppSidebarProps {
  /** Mobile: controlled open state */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function AppSidebar({ mobileOpen = false, onMobileClose }: AppSidebarProps) {
  const location = useLocation()
  const dispatch = useAppDispatch()

  const isActive = (href: string) =>
    href === "/app" ? location.pathname === "/app" : location.pathname.startsWith(href)

  const NavLink = ({ item }: { item: { label: string; href: string; icon: React.ElementType } }) => (
    <Link
      to={item.href}
      onClick={onMobileClose}
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
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-3">
      {/* Logo */}
      <div className="px-2 mb-8 flex items-center justify-between">
        <VibeGarageLogo size="sm" />
        {/* Mobile close */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden text-vibe-text-muted hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Account section */}
      <div className="mt-auto">
        <p className="px-4 mb-2 text-xs font-medium text-vibe-text-muted uppercase tracking-wider">
          Account
        </p>
        <div className="flex flex-col gap-1">
          {ACCOUNT_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-body font-medium text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50 transition-colors duration-150 w-full text-left"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-vibe-onyx-400 bg-vibe-onyx-100 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: "-100%", transition: { duration: 0.2 } }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-vibe-onyx-100 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
