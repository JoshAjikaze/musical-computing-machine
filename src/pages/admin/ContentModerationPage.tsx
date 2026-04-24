import { useState } from "react"
import {
  Search, Eye, CheckCircle, XCircle,
  ArrowLeft, Flag, Music2, User, Clock, Shield, AlertTriangle,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TableRowActions } from "@/components/ui/table-row-actions"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ── Shared types ──────────────────────────────────────────
type ContentTab = "Flagged Content" | "User Reports" | "Appeals" | "Audit Log"
type ItemStatus  = "Pending" | "Under Review" | "Actioned"

// ── Shared mock data ──────────────────────────────────────
const FLAGGED_ROWS = [
  { artist: "Chalee Dip",    track: "Summer Vibes",    reason: "Inappropriate lyrics", status: "Pending"      as ItemStatus, flagged: "2025-03-15" },
  { artist: "Chalee Dip",    track: "Chill beats",     reason: "Copyrights",           status: "Under Review" as ItemStatus, flagged: "2025-04-15" },
  { artist: "Chalee Dip",    track: "Night drive",     reason: "Offensive content",    status: "Actioned"     as ItemStatus, flagged: "2025-04-15" },
  { artist: "Amara Nwosu",   track: "Lagos Nights",    reason: "Copyright claim",      status: "Pending"      as ItemStatus, flagged: "2025-04-16" },
  { artist: "Victor Desire", track: "The Stimulus",    reason: "Explicit content",     status: "Under Review" as ItemStatus, flagged: "2025-04-17" },
  { artist: "Luna Echoes",   track: "Phosphene",       reason: "Misleading title",     status: "Pending"      as ItemStatus, flagged: "2025-04-18" },
  { artist: "Kai Mercer",    track: "Velvet Dreams",   reason: "Inappropriate artwork", status: "Actioned"    as ItemStatus, flagged: "2025-04-19" },
  { artist: "Zara Bloom",    track: "Soft Focus",      reason: "Spam upload",          status: "Under Review" as ItemStatus, flagged: "2025-04-20" },
]

const USER_REPORT_ROWS = [
  { user: "musicfan@gmail.com",   type: "Harassment",    details: "Abusive message in chat",          status: "Pending"      as ItemStatus, reported: "2025-03-15" },
  { user: "djmaz@yahoo.com",      type: "Spam",          details: "Repeated unsolicited messages",    status: "Under Review" as ItemStatus, reported: "2025-04-15" },
  { user: "johndoe@gmail.com",    type: "Impersonation", details: "Pretending to be another user",    status: "Actioned"     as ItemStatus, reported: "2025-04-15" },
  { user: "user44@outlook.com",   type: "Harassment",    details: "Threatening comments on track",    status: "Pending"      as ItemStatus, reported: "2025-04-16" },
  { user: "fan_music@gmail.com",  type: "Spam",          details: "Bulk playlist flooding",           status: "Under Review" as ItemStatus, reported: "2025-04-17" },
  { user: "newuser@yahoo.com",    type: "Hate speech",   details: "Offensive comments in community",  status: "Pending"      as ItemStatus, reported: "2025-04-18" },
]

const APPEAL_ROWS = [
  { user: "musicfan@gmail.com",  type: "Account Ban",     reason: "Claims wrongful ban for spam",                  status: "Pending"      as ItemStatus, appealed: "2025-03-16" },
  { user: "djmaz@yahoo.com",     type: "Content Removal", reason: "Requests review of removed tracks",             status: "Under Review" as ItemStatus, appealed: "2025-04-15" },
  { user: "johndoe@gmail.com",   type: "Warning",         reason: "Disputes warning for inappropriate language",   status: "Actioned"     as ItemStatus, appealed: "2025-04-15" },
  { user: "luna.e@beats.io",     type: "Content Removal", reason: "Track removed without proper notice",           status: "Pending"      as ItemStatus, appealed: "2025-04-16" },
  { user: "kai.m@studio.com",    type: "Account Ban",     reason: "Ban issued in error per community guidelines",  status: "Under Review" as ItemStatus, appealed: "2025-04-17" },
]

const AUDIT_ROWS = [
  { user: "musicfan@gmail.com",  action: "Suspend User",    details: "Suspended for repeated spam",         by: "Admin User", date: "2025-03-15" },
  { user: "djmaz@yahoo.com",     action: "Content Removal", details: "Track removed for copyright",         by: "Moderator",  date: "2025-04-15" },
  { user: "johndoe@gmail.com",   action: "Warning Issued",  details: "Inappropriate language",              by: "Admin User", date: "2025-04-15" },
  { user: "luna.e@beats.io",     action: "Suspend User",    details: "Violation of upload policy",          by: "Moderator",  date: "2025-04-16" },
  { user: "kai.m@studio.com",    action: "Content Removal", details: "Duplicate content detected",          by: "Admin User", date: "2025-04-17" },
  { user: "zara.bloom@mail.com", action: "Warning Issued",  details: "Community guideline breach",          by: "Moderator",  date: "2025-04-18" },
  { user: "amara.n@gmail.com",   action: "Lift Suspension", details: "Appeal approved, account restored",   by: "Admin User", date: "2025-04-19" },
]

// ── Shared sub-components ─────────────────────────────────

function StatusPill({ status }: { status: ItemStatus }) {
  return (
    <span className={cn(
      "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium",
      status === "Pending"      && "bg-vibe-amber/15 text-vibe-amber",
      status === "Under Review" && "bg-blue-500/15 text-blue-400",
      status === "Actioned"     && "bg-green-500/15 text-green-400",
    )}>
      {status}
    </span>
  )
}



function SearchFilter({ placeholder, onSearch }: { placeholder: string; onSearch?: (v: string) => void }) {
  return (
    <div className="relative flex-1 min-w-[220px] max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vibe-text-muted pointer-events-none" />
      <input type="text" placeholder={placeholder}
        onChange={e => onSearch?.(e.target.value)}
        className="w-full h-9 pl-9 pr-3 rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted transition-colors" />
    </div>
  )
}

function StatusFilter({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <Select value={value ?? "All"} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-36 text-xs">
        <span className="text-vibe-text-muted mr-1 text-xs">Status</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["All","Pending","Under Review","Actioned"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}


// ── Panel slide animation ─────────────────────────────────
const panelSlide = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit:    { x: "100%", transition: { duration: 0.2 } },
}
const stepFade = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.18 } },
  exit:    { opacity: 0, x: -16, transition: { duration: 0.14 } },
}

// ── Reusable info box used in all panels ──────────────────
function InfoBox({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-vibe-text-muted">{icon}</span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  )
}

// ── User info block (shared across all View panels) ───────
function UserInfoBlock({ avatarSeed = "usr1", name = "Alex Turner", userId = "VG101234", status = "Active", joined = "20222-03-10", email }: {
  avatarSeed?: string; name?: string; userId?: string; status?: string; joined?: string; email?: string
}) {
  return (
    <div className="flex items-start gap-4">
      <img src={`https://picsum.photos/seed/${avatarSeed}/56/56`} alt={name}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-vibe-onyx-400 shrink-0" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        {[
          ["Full Name", name],
          ["Status", status],
          ["User ID", userId],
          ["Joined", joined],
          ...(email ? [["Email", email]] : []),
        ].map(([k, v]) => (
          <div key={String(k)}>
            <span className="text-vibe-text-muted">{k}: </span>
            <span className={cn("font-medium", k === "Status" && v === "Active" ? "text-green-400" : k === "Status" ? "text-vibe-red" : "text-vibe-text-primary")}>
              {String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB 1 — FLAGGED CONTENT
// ═══════════════════════════════════════════════════════════
type FlaggedPanel = null | "view"

function FlaggedContentTab() {
  const [panel, setPanel]   = useState<FlaggedPanel>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All")
  const [page, setPage]     = useState(1)
  const PAGE_SIZE = 4

  const filtered = FLAGGED_ROWS.filter(r => {
    const matchS = status === "All" || r.status === status
    const matchQ = !search || r.artist.toLowerCase().includes(search.toLowerCase()) || r.track.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase())
    return matchS && matchQ
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Flagged Content</h2>
          <p className="text-sm text-vibe-text-secondary mt-0.5">Review and take action on content flagged by users or automated systems.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SearchFilter placeholder="Search by user, track, or reason" onSearch={q => { setSearch(q); setPage(1) }} />
          <StatusFilter value={status} onChange={s => { setStatus(s); setPage(1) }} />
        </div>
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vibe-onyx-400 bg-vibe-onyx-300">
                {["Artist","Track","Reason","Status","Flagged","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-vibe-text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr key={i} className="border-b border-vibe-onyx-400/40 last:border-0 hover:bg-vibe-onyx-300/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-vibe-text-primary font-medium">{row.artist}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary">{row.track}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary">{row.reason}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-xs text-vibe-text-muted tabular-nums">{row.flagged}</td>
                  <td className="px-4 py-3">
                    <TableRowActions actions={[
                        { label: "View",       icon: Eye,         onClick: () => setPanel("view") },
                        { label: "Approve",    icon: CheckCircle, onClick: () => {},               color: "text-green-400 hover:text-green-300" },
                        { label: "Disapprove", icon: XCircle,     onClick: () => {},               color: "text-vibe-red hover:text-red-300"    },
                      ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-vibe-onyx-400 flex items-center justify-between">
            <p className="text-xs text-vibe-text-muted">Showing {paginated.length} of {filtered.length} flagged contents</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`w-6 h-6 rounded-sm text-xs font-medium transition-colors ${page===i+1?"bg-vibe-red text-white":"bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>{i+1}</button>
              ))}
              <button onClick={() => setPage(p=>Math.min(p+1,totalPages))} className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">Next</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {panel && (
          <>
            <motion.div key="fc-panel" {...panelSlide}
              className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[440px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto p-8 space-y-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setPanel(null)} className="text-white hover:text-vibe-text-secondary transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="font-heading text-xl font-bold text-white">View Flagged Content</h2>
              </div>

              <InfoBox icon={<Music2 className="h-4 w-4" />} title="Reported Track">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vibe-text-secondary">Track: Midnight Drive by Alex Turner</span>
                  <button className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">View track</button>
                </div>
              </InfoBox>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Flag Reason</p>
                <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className="h-4 w-4 text-vibe-text-muted" />
                    <span className="text-sm font-medium text-white">Inappropriate lyrics</span>
                  </div>
                  <p className="text-xs text-vibe-text-muted">Reported by 3 users in the last 2 hours.</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">User information</p>
                <UserInfoBlock avatarSeed="alex1" name="Alex Turner" userId="VG101234" status="Active" joined="20222-03-10" />
              </div>

              <div className="mt-auto flex gap-3 pt-4">
                <Button variant="outline" size="lg" rounded="full" className="flex-1">Disapprove</Button>
                <Button size="lg" rounded="full" className="flex-1">Approve</Button>
              </div>
            </motion.div>
            <motion.div key="fc-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 hidden md:block" onClick={() => setPanel(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB 2 — USER REPORTS
// ═══════════════════════════════════════════════════════════
type UserReportPanel = null | "view-report" | "view-track" | "reason-approval"

function UserReportsTab() {
  const [panel, setPanel]   = useState<UserReportPanel>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All")
  const [page, setPage]     = useState(1)
  const PAGE_SIZE = 4

  const filtered = USER_REPORT_ROWS.filter(r => {
    const matchS = status === "All" || r.status === status
    const matchQ = !search || r.user.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()) || r.details.toLowerCase().includes(search.toLowerCase())
    return matchS && matchQ
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">User Reports</h2>
          <p className="text-sm text-vibe-text-secondary mt-0.5">Investigate and resolve reports submitted by users regarding platform behavior or abuse.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SearchFilter placeholder="Search by user, report type, or ID" onSearch={q => { setSearch(q); setPage(1) }} />
          <StatusFilter value={status} onChange={s => { setStatus(s); setPage(1) }} />
        </div>
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vibe-onyx-400 bg-vibe-onyx-300">
                {["User","Report type","Details","Status","Reported","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-vibe-text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr key={i} className="border-b border-vibe-onyx-400/40 last:border-0 hover:bg-vibe-onyx-300/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-vibe-text-primary">{row.user}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary">{row.type}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary">{row.details}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-xs text-vibe-text-muted tabular-nums">{row.reported}</td>
                  <td className="px-4 py-3">
                    <TableRowActions actions={[
                        { label: "View",       icon: Eye,         onClick: () => setPanel("view-report")     },
                        { label: "Approve",    icon: CheckCircle, onClick: () => setPanel("reason-approval"), color: "text-green-400 hover:text-green-300" },
                        { label: "Disapprove", icon: XCircle,     onClick: () => {},                          color: "text-vibe-red hover:text-red-300"    },
                      ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-vibe-onyx-400 flex items-center justify-between">
            <p className="text-xs text-vibe-text-muted">Showing {paginated.length} of {filtered.length} user reports</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (<button key={i} onClick={() => setPage(i+1)} className={`w-6 h-6 rounded-sm text-xs font-medium transition-colors ${page===i+1?"bg-vibe-red text-white":"bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>{i+1}</button>))}
              <button onClick={() => setPage(p=>Math.min(p+1,totalPages))} className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">Next</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {panel && (
          <>
            <motion.div key="ur-panel" {...panelSlide}
              className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[480px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto p-8 space-y-5">
              <AnimatePresence mode="wait">
                {panel === "view-report" && (
                  <motion.div key="vr" {...stepFade} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPanel(null)} className="text-white hover:text-vibe-text-secondary transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="font-heading text-xl font-bold text-white">View Report</h2>
                    </div>

                    {/* Report Overview */}
                    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4 space-y-1">
                      <p className="text-xs text-vibe-text-muted">Report Overview</p>
                      <p className="text-xs text-vibe-text-muted">Report ID: #48219</p>
                      <p className="text-sm font-semibold text-white">Reported User: Alex Turner</p>
                      <p className="text-xs text-vibe-text-muted">Reported for: Inappropriate content in uploaded track. Status: Under review.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">User information</p>
                      <UserInfoBlock avatarSeed="alex1" name="Alex Turner" userId="VG101234" status="Active" joined="20222-03-10" />
                    </div>

                    <InfoBox icon={<AlertTriangle className="h-4 w-4" />} title="Reason">
                      <p className="text-xs text-vibe-text-secondary">User uploaded a track containing explicit language and offensive artwork</p>
                    </InfoBox>

                    <InfoBox icon={<Music2 className="h-4 w-4" />} title="Reported Track">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-vibe-text-secondary">Track: Midnight Drive by Alex Turner</span>
                        <button onClick={() => setPanel("view-track")} className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">View track</button>
                      </div>
                    </InfoBox>

                    <InfoBox icon={<User className="h-4 w-4" />} title="Statement">
                      <p className="text-xs text-vibe-text-secondary italic">"I apologize for the content. I was unaware the artwork violated guidelines. I will update it immediately"</p>
                    </InfoBox>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="lg" rounded="full" className="flex-1">Disapprove</Button>
                      <Button size="lg" rounded="full" className="flex-1" onClick={() => setPanel("reason-approval")}>Approve</Button>
                    </div>
                  </motion.div>
                )}

                {panel === "view-track" && (
                  <motion.div key="vt" {...stepFade} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPanel("view-report")} className="text-white hover:text-vibe-text-secondary transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="font-heading text-xl font-bold text-white">View Track</h2>
                    </div>
                    {/* Track image */}
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-vibe-onyx-300">
                      <img src="https://picsum.photos/seed/trackview/480/270" alt="Track" className="w-full h-full object-cover" />
                    </div>
                    {/* Mini audio player */}
                    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-3 flex items-center gap-3">
                      <div className="flex-1 h-1 bg-vibe-onyx-400 rounded-full">
                        <div className="h-full w-1/3 bg-vibe-red rounded-full" />
                      </div>
                      <span className="text-xs text-vibe-text-muted tabular-nums">1:00</span>
                    </div>
                    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4 space-y-1">
                      <p className="text-xs text-vibe-text-muted">Report Overview</p>
                      <p className="text-sm font-semibold text-white">Reported User: Alex Turner</p>
                      <p className="text-xs text-vibe-text-muted">Reported for: Inappropriate content in uploaded track.</p>
                    </div>
                    <UserInfoBlock avatarSeed="alex1" name="Alex Turner" userId="VG101234" status="Active" joined="20222-03-10" />
                    <Button size="lg" rounded="full" className="w-full" onClick={() => setPanel(null)}>Close</Button>
                  </motion.div>
                )}

                {panel === "reason-approval" && (
                  <motion.div key="ra" {...stepFade} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPanel("view-report")} className="text-white hover:text-vibe-text-secondary transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="font-heading text-xl font-bold text-white">Reason for approval</h2>
                    </div>
                    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4 space-y-1">
                      <p className="text-xs text-vibe-text-muted">Report Overview</p>
                      <p className="text-xs text-vibe-text-muted">Report ID: #48219</p>
                      <p className="text-sm font-semibold text-white">Reported User: Alex Turner</p>
                      <p className="text-xs text-vibe-text-muted">Reported for: Inappropriate content in uploaded track. Status: Under review.</p>
                    </div>
                    <InfoBox icon={<CheckCircle className="h-4 w-4 text-green-400" />} title="Approval Reason">
                      <p className="text-xs text-vibe-text-secondary">User changed content on track</p>
                    </InfoBox>
                    <InfoBox icon={<User className="h-4 w-4" />} title="Moderator Response">
                      <p className="text-xs text-vibe-text-secondary">Thank you for your statement. Please ensure all future uploads comply with our content policy</p>
                    </InfoBox>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="lg" rounded="full" className="flex-1" onClick={() => setPanel("view-report")}>Back</Button>
                      <Button size="lg" rounded="full" className="flex-1" onClick={() => setPanel(null)}>Approve</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div key="ur-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 hidden md:block" onClick={() => setPanel(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB 3 — APPEALS
// ═══════════════════════════════════════════════════════════
type AppealPanel = null | "view-appeal" | "reason-rejection"

function AppealsTab() {
  const [panel, setPanel]   = useState<AppealPanel>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("All")
  const [page, setPage]     = useState(1)
  const PAGE_SIZE = 4

  const filtered = APPEAL_ROWS.filter(r => {
    const matchS = status === "All" || r.status === status
    const matchQ = !search || r.user.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase())
    return matchS && matchQ
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Appeals</h2>
          <p className="text-sm text-vibe-text-secondary mt-0.5">Review and manage user appeals for moderation actions taken on their accounts as content.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SearchFilter placeholder="Search by user, appeal type, or ID" onSearch={q => { setSearch(q); setPage(1) }} />
          <StatusFilter value={status} onChange={s => { setStatus(s); setPage(1) }} />
        </div>
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vibe-onyx-400 bg-vibe-onyx-300">
                {["User","Appeal type","Reason","Status","Appealed","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-vibe-text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr key={i} className="border-b border-vibe-onyx-400/40 last:border-0 hover:bg-vibe-onyx-300/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-vibe-text-primary">{row.user}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary">{row.type}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary max-w-[200px] truncate">{row.reason}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-xs text-vibe-text-muted tabular-nums">{row.appealed}</td>
                  <td className="px-4 py-3">
                    <TableRowActions actions={[
                        { label: "View",       icon: Eye,         onClick: () => setPanel("view-appeal")       },
                        { label: "Approve",    icon: CheckCircle, onClick: () => {},                            color: "text-green-400 hover:text-green-300"   },
                        { label: "Disapprove", icon: XCircle,     onClick: () => setPanel("reason-rejection"),  color: "text-vibe-red hover:text-red-300"       },
                      ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-vibe-onyx-400 flex items-center justify-between">
            <p className="text-xs text-vibe-text-muted">Showing {paginated.length} of {filtered.length} appeals</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (<button key={i} onClick={() => setPage(i+1)} className={`w-6 h-6 rounded-sm text-xs font-medium transition-colors ${page===i+1?"bg-vibe-red text-white":"bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>{i+1}</button>))}
              <button onClick={() => setPage(p=>Math.min(p+1,totalPages))} className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">Next</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {panel && (
          <>
            <motion.div key="ap-panel" {...panelSlide}
              className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[480px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto p-8 space-y-5">
              <AnimatePresence mode="wait">
                {panel === "view-appeal" && (
                  <motion.div key="va" {...stepFade} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPanel(null)} className="text-white hover:text-vibe-text-secondary transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="font-heading text-xl font-bold text-white">View Appeal</h2>
                    </div>

                    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4 space-y-1">
                      <p className="text-xs text-vibe-text-muted">Appeal Overview</p>
                      <p className="text-sm font-bold text-white">Appeal ID</p>
                      <p className="text-sm text-vibe-text-primary font-mono">APL-202504013-0012</p>
                      <p className="text-xs text-vibe-text-muted">This appeal was submitted by the user regarding moderation action, review the details, user statement and moderation response below.</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">User information</p>
                      <UserInfoBlock avatarSeed="apuser" name="Jon Bellion" userId="V01001234" status="Active" joined="20222-03-10" />
                    </div>

                    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4 space-y-2">
                      <p className="text-xs text-vibe-text-muted">Appeal details</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-vibe-text-muted">Submitted: <span className="text-vibe-text-primary">2025-04-15</span></span>
                        <span className="text-vibe-text-muted">Status: <span className="text-blue-400">Under Review</span></span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">User Statement</p>
                      <InfoBox icon={<User className="h-4 w-4" />} title="Appeal Message">
                        <p className="text-xs text-vibe-text-secondary italic">"I believe my track was removed in error. Please review the moderation action as I have the rights to this content."</p>
                      </InfoBox>
                    </div>

                    <InfoBox icon={<Shield className="h-4 w-4" />} title="Moderation Response">
                      <p className="text-xs text-vibe-text-secondary">Your appeal is being reviewed, we will notify you once a decision is made.</p>
                    </InfoBox>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="lg" rounded="full" className="flex-1" onClick={() => setPanel("reason-rejection")}>Disapprove</Button>
                      <Button size="lg" rounded="full" className="flex-1" onClick={() => setPanel(null)}>Approve Appeal</Button>
                    </div>
                  </motion.div>
                )}

                {panel === "reason-rejection" && (
                  <motion.div key="rr" {...stepFade} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPanel("view-appeal")} className="text-white hover:text-vibe-text-secondary transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="font-heading text-xl font-bold text-white">Reason for rejection</h2>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">User Statement</p>
                      <InfoBox icon={<User className="h-4 w-4" />} title="Appeal Message">
                        <p className="text-xs text-vibe-text-secondary italic">"I believe my track was removed in error. Please review the moderation action as I have the rights to this content."</p>
                      </InfoBox>
                    </div>

                    <InfoBox icon={<Shield className="h-4 w-4" />} title="Moderation Response">
                      <p className="text-xs text-vibe-text-secondary">Your appeal is being reviewed, we will notify you once a decision is made.</p>
                    </InfoBox>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Admin Rejection Response</p>
                      <textarea
                        placeholder="Write a response here..."
                        className="flex min-h-[90px] w-full rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-3 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted resize-none focus-visible:outline-none focus-visible:border-vibe-red focus-visible:ring-1 focus-visible:ring-vibe-red/30 transition-colors"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" size="lg" rounded="full" className="flex-1" onClick={() => setPanel("view-appeal")}>Back</Button>
                      <Button size="lg" rounded="full" className="flex-1" onClick={() => setPanel(null)}>Approve Appeal</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div key="ap-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 hidden md:block" onClick={() => setPanel(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB 4 — AUDIT LOG
// ═══════════════════════════════════════════════════════════
function AuditLogTab() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [search, setSearch]       = useState("")
  const [actionType, setActionType] = useState("All")
  const [page, setPage]           = useState(1)
  const PAGE_SIZE = 4

  const filtered = AUDIT_ROWS.filter(r => {
    const matchA = actionType === "All" || r.action === actionType
    const matchQ = !search || r.user.toLowerCase().includes(search.toLowerCase()) || r.action.toLowerCase().includes(search.toLowerCase()) || r.details.toLowerCase().includes(search.toLowerCase())
    return matchA && matchQ
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Audit Log</h2>
          <p className="text-sm text-vibe-text-secondary mt-0.5">Track all moderation actions and changes for transparency and compliance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SearchFilter placeholder="Search by user, action, or ID" onSearch={q => { setSearch(q); setPage(1) }} />
          <Select value={actionType} onValueChange={v => { setActionType(v); setPage(1) }}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <span className="text-vibe-text-muted mr-1 text-xs">Action type</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All","Suspend User","Content Removal","Warning Issued","Lift Suspension"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vibe-onyx-400 bg-vibe-onyx-300">
                {["User","Action","Details","By","Date","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-vibe-text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => (
                <tr key={i} className="border-b border-vibe-onyx-400/40 last:border-0 hover:bg-vibe-onyx-300/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-vibe-text-primary">{row.user}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary">{row.action}</td>
                  <td className="px-4 py-3 text-sm text-vibe-text-secondary">{row.details}</td>
                  <td className="px-4 py-3 text-xs text-vibe-text-muted">{row.by}</td>
                  <td className="px-4 py-3 text-xs text-vibe-text-muted tabular-nums">{row.date}</td>
                  <td className="px-4 py-3">
                    <TableRowActions actions={[
                        { label: "View", icon: Eye, onClick: () => setPanelOpen(true) },
                      ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-vibe-onyx-400 flex items-center justify-between">
            <p className="text-xs text-vibe-text-muted">Showing {paginated.length} of {filtered.length} audit logs</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (<button key={i} onClick={() => setPage(i+1)} className={`w-6 h-6 rounded-sm text-xs font-medium transition-colors ${page===i+1?"bg-vibe-red text-white":"bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>{i+1}</button>))}
              <button onClick={() => setPage(p=>Math.min(p+1,totalPages))} className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">Next</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div key="al-panel" {...panelSlide}
              className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[440px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto p-8 space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setPanelOpen(false)} className="text-white hover:text-vibe-text-secondary transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="font-heading text-xl font-bold text-white">View Audit Log</h2>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">User information</p>
                <div className="flex flex-col gap-3">
                  <img src="https://picsum.photos/seed/jamesjohn/200/200" alt="James John"
                    className="w-32 h-32 rounded-lg object-cover" />
                  <div className="space-y-1 text-xs">
                    <p className="font-heading text-lg font-bold text-white">James John</p>
                    {[
                      ["Email",   "vde0@gmail.com"],
                      ["User ID", "V010125"],
                      ["Status",  "Suspended"],
                      ["Joined",  "2022-03-10"],
                    ].map(([k, v]) => (
                      <p key={String(k)}>
                        <span className="text-vibe-text-muted">{k}: </span>
                        <span className={cn("font-medium", k === "Status" ? "text-vibe-red" : "text-vibe-text-primary")}>{String(v)}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Action Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-vibe-text-muted" />
                      <span className="text-xs text-vibe-text-muted">Performed by</span>
                    </div>
                    <p className="text-sm font-medium text-white">Admin User</p>
                    <p className="text-xs text-vibe-text-muted">Vibe Administrator</p>
                  </div>
                  <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-vibe-text-muted" />
                      <span className="text-xs text-vibe-text-muted">Date</span>
                    </div>
                    <p className="text-sm font-medium text-white">2025-04-15</p>
                  </div>
                </div>
              </div>

              <InfoBox icon={<AlertTriangle className="h-4 w-4 text-vibe-amber" />} title="Reason">
                <p className="text-sm text-white font-medium">Repeated Spam</p>
                <p className="text-xs text-vibe-text-muted">#spamming</p>
              </InfoBox>

              <div className="flex gap-3 mt-auto pt-4">
                <Button variant="outline" size="lg" rounded="full" className="flex-1" onClick={() => setPanelOpen(false)}>Close</Button>
                <Button size="lg" rounded="full" className="flex-1">Lift Suspension</Button>
              </div>
            </motion.div>
            <motion.div key="al-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 hidden md:block" onClick={() => setPanelOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
const TABS: ContentTab[] = ["Flagged Content", "User Reports", "Appeals", "Audit Log"]

const tabFade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.14 } },
}

export function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("Flagged Content")

  return (
    <div className="px-4 md:px-8 py-6 space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium rounded-sm transition-colors duration-150",
              activeTab === tab
                ? "bg-vibe-onyx-300 text-white border border-vibe-onyx-400"
                : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
            )}>
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...tabFade}>
          {activeTab === "Flagged Content" && <FlaggedContentTab />}
          {activeTab === "User Reports"    && <UserReportsTab />}
          {activeTab === "Appeals"         && <AppealsTab />}
          {activeTab === "Audit Log"       && <AuditLogTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
