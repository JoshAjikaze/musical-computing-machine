import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Users, Music2, DollarSign, BarChart2,
  ShieldCheck, Settings, Headphones, Bell, ChevronDown,
  UserPlus, LogOut, Menu, X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { VibeGarageLogo } from "@/components/ui/logo"
import { useAppDispatch } from "@/hooks/redux"
import { logout } from "@/store/slices/authSlice"
import { cn } from "@/lib/utils"

// ── Nav structure (matches design) ───────────────────────
const MAIN_NAV = [
  { href: "/admin",                  label: "Dashboard",          icon: LayoutDashboard },
  { href: "/admin/users",            label: "User Management",    icon: Users           },
  { href: "/admin/music",            label: "Music Management",   icon: Music2          },
  { href: "/admin/monetization",     label: "Monetization",       icon: DollarSign, hasChevron: true },
  { href: "/admin/reports",          label: "Reports & Analytics",icon: BarChart2       },
  { href: "/admin/content",          label: "Content moderation", icon: ShieldCheck     },
]

const ACCOUNT_NAV = [
  { href: "/admin/settings", label: "Settings", icon: Settings  },
  { href: "/admin/support",  label: "Support",  icon: Headphones },
]

// ── Sidebar content ───────────────────────────────────────
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation()

  const isActive = (href: string) =>
    href === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(href)

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
      <nav className="flex flex-col gap-0.5">
        {MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-body font-medium transition-colors duration-150",
              isActive(item.href)
                ? "bg-vibe-onyx-300 text-white"
                : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
            )}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </span>
            {item.hasChevron && (
              <ChevronDown className="h-3.5 w-3.5 text-vibe-text-muted" />
            )}
          </Link>
        ))}
      </nav>

      {/* Account */}
      <div className="mt-auto">
        <p className="px-4 mb-2 text-xs font-medium text-vibe-text-muted uppercase tracking-wider">
          Account
        </p>
        <div className="flex flex-col gap-0.5">
          {ACCOUNT_NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-body font-medium transition-colors duration-150",
                isActive(item.href)
                  ? "bg-vibe-onyx-300 text-white"
                  : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Admin dropdown ────────────────────────────────────────
function AdminDropdown() {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 h-8 rounded-md border border-vibe-onyx-400 bg-vibe-onyx-200 text-sm font-medium text-white hover:bg-vibe-onyx-300 transition-colors"
      >
        {/* Avatar placeholder */}
        <div className="w-5 h-5 rounded-full bg-vibe-onyx-400 overflow-hidden shrink-0">
          <img src="https://picsum.photos/seed/adminav/20/20" alt="Admin" className="w-full h-full object-cover" />
        </div>
        Admin
        <ChevronDown className={cn("h-3.5 w-3.5 text-vibe-text-muted transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 bg-vibe-onyx-200 border border-vibe-onyx-400 rounded-md shadow-xl z-50"
          >
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300 transition-colors rounded-t-md"
            >
              <UserPlus className="h-4 w-4" />
              Add new admin
            </button>
            <button
              onClick={() => { setOpen(false); dispatch(logout()) }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300 transition-colors rounded-b-md"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────
export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
            <motion.div key="admin-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside key="admin-drawer"
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
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 md:px-6 h-14 bg-vibe-onyx border-b border-vibe-onyx-400">
          {/* Mobile hamburger */}
          <button className="md:hidden text-vibe-text-secondary hover:text-white transition-colors"
            onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop: Logo + page title */}
          <div className="hidden md:flex items-center gap-4">
            <VibeGarageLogo size="sm" />
            <div className="h-4 w-px bg-vibe-onyx-400" />
            <span className="text-sm font-heading font-semibold text-vibe-text-secondary">Dashboard</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Bell */}
            <button className="relative text-vibe-text-muted hover:text-white transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {/* Unread dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-vibe-red rounded-full" />
            </button>

            {/* Admin dropdown */}
            <AdminDropdown />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
