import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Search, Eye, Pencil, UserX,
  ArrowLeft, Users, DollarSign, Wallet, Clock, Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableRowActions } from "@/components/ui/table-row-actions"
import { StatCard } from "@/components/app/StatCard"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────
type UserType   = "All" | "Artist" | "Listener"
type UserStatus = "All" | "Active" | "Suspended"
type RightPanel = null | "add-admin" | "view-user"

interface UserRow {
  id:      string
  name:    string
  email:   string
  type:    "Artist" | "Listener"
  joined:  string
  status:  "Active" | "Suspended"
  avatarUrl: string
}

// ── Mock data ─────────────────────────────────────────────
const STATS = [
  { label: "Total Artists",        value: "270.7M", change: 14,    icon: <Users      className="h-5 w-5 text-vibe-amber"  /> },
  { label: "Total Earnings",       value: "$10.5M", change: 25,    icon: <DollarSign className="h-5 w-5 text-green-400"   /> },
  { label: "Total Listeners",      value: "298.7K", change: -0.41, icon: <Users      className="h-5 w-5 text-vibe-red"    /> },
  { label: "Pending verification", value: "12",     change: 8,     icon: <Clock      className="h-5 w-5 text-purple-400"  /> },
]

const MOCK_USERS: UserRow[] = [
  { id: "V01234", name: "John Bingo",    email: "jbingo@gmail.com",      type: "Artist",   joined: "Mar 15, 2025", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr0/32/32" },
  { id: "V01235", name: "Amara Nwosu",   email: "amara.n@gmail.com",     type: "Artist",   joined: "Jan 08, 2025", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr1/32/32" },
  { id: "V01236", name: "DJ Mazur",      email: "djmaz@yahoo.com",       type: "Artist",   joined: "Feb 20, 2025", status: "Suspended", avatarUrl: "https://picsum.photos/seed/usr2/32/32" },
  { id: "V01237", name: "Faith Okoro",   email: "faith.o@gmail.com",     type: "Listener", joined: "Mar 01, 2025", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr3/32/32" },
  { id: "V01238", name: "Kai Mercer",    email: "kai.m@studio.com",      type: "Artist",   joined: "Dec 12, 2024", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr4/32/32" },
  { id: "V01239", name: "Zara Bloom",    email: "zara.bloom@mail.com",   type: "Listener", joined: "Mar 22, 2025", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr5/32/32" },
  { id: "V01240", name: "Victor Desire", email: "victor.d@vibe.com",     type: "Artist",   joined: "Nov 30, 2024", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr6/32/32" },
  { id: "V01241", name: "Luna Echoes",   email: "luna.e@beats.io",       type: "Artist",   joined: "Apr 05, 2025", status: "Suspended", avatarUrl: "https://picsum.photos/seed/usr7/32/32" },
  { id: "V01242", name: "Jane Doe",      email: "janedoe@listen.com",    type: "Listener", joined: "Feb 14, 2025", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr8/32/32" },
  { id: "V01243", name: "Alex Turner",   email: "alex.turner@music.com", type: "Artist",   joined: "Mar 10, 2025", status: "Active",    avatarUrl: "https://picsum.photos/seed/usr9/32/32" },
]

const SELECTED_USER = {
  fullName:     "Alex Turner",
  userId:       "V0191234",
  joined:       "2025-03-10",
  status:       "Active",
  role:         "Artist",
  email:        "alexturner@gmail.com",
  totalTracks:  12,
  followers:    521,
  avatarUrl:    "https://picsum.photos/seed/alexturner/64/64",
  totalTracks2: 16,
  totalEarnings:"$275K",
  totalWithdrawal: 2,
  pendingWithdrawal: 0,
}

// ── Panel slide animation ─────────────────────────────────
const panelSlide = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit:    { x: "100%", transition: { duration: 0.2 } },
}
const stepFade = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit:    { opacity: 0, x: -16, transition: { duration: 0.15 } },
}

// ── Reusable filter dropdown ──────────────────────────────
function FilterDropdown<T extends string>({
  value, onChange, options, placeholder,
}: {
  value: T; onChange: (v: T) => void; options: T[]; placeholder: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="h-9 w-36 text-xs">
        <span className="text-vibe-text-muted mr-1 text-xs">{placeholder}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: "Active" | "Suspended" }) {
  return (
    <span className={cn(
      "text-xs font-medium",
      status === "Active" ? "text-green-400" : "text-vibe-red"
    )}>
      {status}
    </span>
  )
}



// ── Pagination ────────────────────────────────────────────
const PAGE_SIZE = 5

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={cn(
            "w-7 h-7 rounded-sm text-xs font-medium transition-colors",
            i + 1 === current
              ? "bg-vibe-red text-white"
              : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"
          )}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(current + 1, total))}
        className="px-3 h-7 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">
        Next
      </button>
    </div>
  )
}

// ── Add Admin panel ───────────────────────────────────────
const PERMISSION_LEVELS = ["View", "Edit", "Full"] as const
type PermLevel = typeof PERMISSION_LEVELS[number]

const PERMISSION_SECTIONS = ["Users", "Music", "Monetization", "Reports"] as const

type PermState = Record<string, PermLevel | null>

function AddAdminPanel({ onClose }: { onClose: () => void }) {
  const [perms, setPerms] = useState<PermState>({
    Users: "View", Music: null, Monetization: null, Reports: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsLoading(false)
    onClose()
  }

  return (
    <div className="flex flex-col min-h-full p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="text-white hover:text-vibe-text-secondary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-white">Add Admin User</h2>
      </div>

      <div className="space-y-5 flex-1">
        {/* Role Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-vibe-text-secondary">Role Name</label>
          <Select defaultValue="Admin">
            <SelectTrigger icon={<Users className="h-4 w-4" />}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Moderator">Moderator</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-vibe-text-secondary">Role Description</label>
          <textarea
            placeholder="Enter role description"
            className="flex min-h-[80px] w-full rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-3 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted resize-none focus-visible:outline-none focus-visible:border-vibe-red focus-visible:ring-1 focus-visible:ring-vibe-red/30 transition-colors"
          />
        </div>

        {/* Permissions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Permissions</h3>
          <div className="space-y-2">
            {PERMISSION_SECTIONS.map((section) => (
              <div key={section} className="flex items-center justify-between py-2 border-b border-vibe-onyx-400/40 last:border-0">
                <span className="text-sm text-vibe-text-secondary">{section}</span>
                <div className="flex items-center gap-1">
                  {PERMISSION_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setPerms((p) => ({ ...p, [section]: p[section] === level ? null : level }))}
                      className={cn(
                        "px-3 h-7 rounded-sm text-xs font-medium transition-colors",
                        perms[section] === level
                          ? "bg-vibe-red text-white"
                          : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                  {/* Toggle for "Full" */}
                  <div className={cn(
                    "w-9 h-5 rounded-full ml-2 flex items-center px-0.5 transition-colors",
                    perms[section] === "Full" ? "bg-vibe-red justify-end" : "bg-vibe-onyx-400 justify-start"
                  )}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 mt-auto">
        <Button variant="outline" size="lg" rounded="full" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button size="lg" rounded="full" className="flex-1" onClick={handleSave} loading={isLoading}>
          Save Role
        </Button>
      </div>
    </div>
  )
}

// ── View User panel ───────────────────────────────────────
function ViewUserPanel({ onClose }: { onClose: () => void }) {
  const u = SELECTED_USER

  const userStats = [
    { label: "Total Tracks",        value: u.totalTracks2.toString(), icon: <Users      className="h-4 w-4 text-vibe-amber"  /> },
    { label: "Total Earnings",      value: u.totalEarnings,           icon: <DollarSign className="h-4 w-4 text-green-400"   /> },
    { label: "Total Withdrawal",    value: u.totalWithdrawal.toString(), icon: <Wallet  className="h-4 w-4 text-vibe-red"    /> },
    { label: "Pending Withdrawal",  value: u.pendingWithdrawal.toString(), icon: <Clock className="h-4 w-4 text-purple-400"  /> },
  ]

  return (
    <div className="flex flex-col min-h-full p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="text-white hover:text-vibe-text-secondary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-white">View User</h2>
      </div>

      {/* User info block */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4 mb-5">
        <p className="text-xs font-medium text-vibe-text-muted mb-3">User information</p>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <img
            src={u.avatarUrl}
            alt={u.fullName}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-vibe-onyx-400 shrink-0"
          />
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs flex-1">
            {[
              ["Full Name",     u.fullName],
              ["Status",        u.status],
              ["User ID",       u.userId],
              ["Joined",        u.joined],
              ["Role",          u.role],
              ["Total Tracks",  u.totalTracks],
              ["Email",         u.email],
              ["Followers",     u.followers],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <span className="text-vibe-text-muted">{label}: </span>
                <span className={cn(
                  "font-medium",
                  label === "Status"
                    ? val === "Active" ? "text-green-400" : "text-vibe-red"
                    : "text-vibe-text-primary"
                )}>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mini stat cards — 2×2 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {userStats.map((s) => (
          <div key={s.label} className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4">
            <div className="flex items-center gap-2 mb-2">
              {s.icon}
              <span className="text-xs text-vibe-text-muted">{s.label}</span>
            </div>
            <p className="font-heading text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        <Button variant="outline" size="lg" rounded="full" className="flex-1">
          Suspend
        </Button>
        <Button size="lg" rounded="full" className="flex-1">
          Edit
        </Button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export function UserManagementPage() {
  const [search, setSearch]         = useState("")
  const [userType, setUserType]     = useState<UserType>("All")
  const [status, setStatus]         = useState<UserStatus>("All")
  const [selected, setSelected]     = useState<Set<number>>(new Set())
  const [rightPanel, setRightPanel] = useState<RightPanel>(null)
  const [page, setPage]             = useState(1)

  const filtered = MOCK_USERS.filter((u) => {
    const matchType   = userType === "All" || u.type   === userType
    const matchStatus = status   === "All" || u.status === status
    const matchSearch = !search  || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleRow = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((_, i) => i)))

  return (
    <>
      <div className="px-4 md:px-8 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Welcome, Admin</h1>
            <p className="text-sm text-vibe-text-secondary mt-0.5">Overview of Vibe garage's performance</p>
          </div>
          <Button size="default" rounded="full" className="shrink-0 gap-1.5"
            onClick={() => setRightPanel("add-admin")}>
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vibe-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted transition-colors"
            />
          </div>

          {/* User type filter */}
          <FilterDropdown<UserType>
            value={userType}
            onChange={setUserType}
            options={["All", "Artist", "Listener"]}
            placeholder="User type"
          />

          {/* Status filter */}
          <FilterDropdown<UserStatus>
            value={status}
            onChange={setStatus}
            options={["All", "Active", "Suspended"]}
            placeholder="Status"
          />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vibe-onyx-400 bg-vibe-onyx-300">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === paginated.length && paginated.length > 0}
                      onChange={toggleAll}
                      className="accent-vibe-red w-4 h-4 cursor-pointer"
                    />
                  </th>
                  {["User ID","Name","Email","Type","Joined","Status","Actions"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-medium text-vibe-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((user, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-vibe-onyx-400/40 last:border-0 transition-colors",
                      selected.has(i) ? "bg-vibe-onyx-300" : "hover:bg-vibe-onyx-300/50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggleRow(i)}
                        className="accent-vibe-red w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3 text-vibe-text-muted tabular-nums text-xs">{user.id}</td>
                    <td className="px-3 py-3 text-vibe-text-primary font-medium whitespace-nowrap">{user.name}</td>
                    <td className="px-3 py-3 text-vibe-text-muted text-xs">{user.email}</td>
                    <td className="px-3 py-3 text-vibe-text-secondary text-xs">{user.type}</td>
                    <td className="px-3 py-3 text-vibe-text-muted text-xs whitespace-nowrap">{user.joined}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-3 py-3">
                      <TableRowActions actions={[
                        { label: "View",    icon: Eye,    onClick: () => setRightPanel("view-user")  },
                        { label: "Edit",    icon: Pencil, onClick: () => setRightPanel("add-admin")  },
                        { label: "Suspend", icon: UserX,  onClick: () => {},                          color: "text-vibe-red hover:text-red-300" },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-4 border-t border-vibe-onyx-400 flex items-center justify-between">
            <p className="text-xs text-vibe-text-muted">Showing {paginated.length} of {filtered.length} users</p>
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <AnimatePresence>
        {rightPanel && (
          <>
            <motion.div
              key="um-panel"
              {...panelSlide}
              className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[440px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {rightPanel === "add-admin" && (
                  <motion.div key="add-admin" {...stepFade} className="min-h-full">
                    <AddAdminPanel onClose={() => setRightPanel(null)} />
                  </motion.div>
                )}
                {rightPanel === "view-user" && (
                  <motion.div key="view-user" {...stepFade} className="min-h-full">
                    <ViewUserPanel onClose={() => setRightPanel(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Backdrop */}
            <motion.div
              key="um-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 hidden md:block"
              onClick={() => setRightPanel(null)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
