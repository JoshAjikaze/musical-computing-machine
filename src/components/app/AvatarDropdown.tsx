import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, LogOut, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { logout } from "@/store/slices/authSlice"
import { cn } from "@/lib/utils"

interface AvatarDropdownProps {
  /** Where "View profile" navigates to */
  profileHref?: string
  /** Where to redirect after logout */
  logoutRedirect?: string
}

export function AvatarDropdown({
  profileHref = "/listen/profile",
  logoutRedirect = "/login",
}: AvatarDropdownProps) {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const { user }  = useAppSelector((s) => s.auth)

  const [open, setOpen] = useState(false)
  const containerRef    = useRef<HTMLDivElement>(null)

  const initials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : "VG"

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  function handleProfile() {
    setOpen(false)
    navigate(profileHref)
  }

  function handleLogout() {
    setOpen(false)
    dispatch(logout())
    navigate(logoutRedirect, { replace: true })
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full transition-all duration-150",
          "ring-2 ring-transparent hover:ring-vibe-red/40",
          open && "ring-vibe-red/60"
        )}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName ?? "Avatar"}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 flex items-center justify-center text-xs font-heading font-semibold text-white">
            {initials}
          </div>
        )}
        <ChevronDown
          className={cn(
            "h-3 w-3 text-vibe-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.14, ease: [0.32, 0, 0.17, 1] }}
            className={cn(
              "absolute right-0 top-full mt-2 z-50",
              "w-52 bg-vibe-onyx-100 border border-vibe-onyx-400",
              "rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
            )}
            role="menu"
          >
            {/* User info header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-vibe-onyx-400">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 flex items-center justify-center text-xs font-heading font-semibold text-white shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.displayName ?? "Listener"}
                </p>
                <p className="text-[11px] text-vibe-text-muted truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <DropdownItem
                icon={<User className="h-3.5 w-3.5" />}
                label="View profile"
                onClick={handleProfile}
              />
              <div className="mx-3 my-1 h-px bg-vibe-onyx-400" />
              <DropdownItem
                icon={<LogOut className="h-3.5 w-3.5" />}
                label="Log out"
                onClick={handleLogout}
                danger
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropdownItem({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors",
        danger
          ? "text-vibe-red hover:bg-vibe-red/10"
          : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300"
      )}
    >
      <span className={cn("shrink-0", danger ? "text-vibe-red" : "text-vibe-text-muted")}>
        {icon}
      </span>
      {label}
    </button>
  )
}
