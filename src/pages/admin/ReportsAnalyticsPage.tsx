import { useState } from "react"
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as LineTooltip, ResponsiveContainer,
} from "recharts"
import {
  Play, Users, Upload, DollarSign, Wifi, UserPlus,
  RotateCcw, Music2, TrendingUp, Download, Search,
  CalendarDays, BarChart2, Disc,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ── Tab definitions ───────────────────────────────────────
const TABS = ["Summary", "User Activity", "Music Stats", "Revenue", "Custom"] as const
type Tab = typeof TABS[number]

// ── Shared data ───────────────────────────────────────────
const PIE_DATA = [
  { name: "Monday",    value: 12, color: "#3B82F6" },
  { name: "Tuesday",   value: 10, color: "#22C55E" },
  { name: "Wednesday", value:  9, color: "#A855F7" },
  { name: "Thursday",  value: 11, color: "#F97316" },
  { name: "Friday",    value: 13, color: "#EAB308" },
  { name: "Saturday",  value: 28, color: "#EF4444" },
  { name: "Sunday",    value: 17, color: "#EC4899" },
]

const ACTIVITY_DATA = [
  { day: "Mon",   value: 280 },
  { day: "Tue",   value: 420 },
  { day: "Wed",   value: 360 },
  { day: "Thurs", value: 500 },
  { day: "Fri",   value: 440 },
  { day: "Sat",   value: 620 },
  { day: "Sun",   value: 540 },
]

const TOP_TRACKS = [
  { name: "Blinding Lights",  artist: "The Weeknd",   plays: "12,300 plays", genre: "Pop"       },
  { name: "Shape of You",     artist: "Ed Sheeran",   plays: "11,800 plays", genre: "Pop"       },
  { name: "Levitating",       artist: "Dua Lipa",     plays: "10,900 plays", genre: "Dance"     },
  { name: "Miles Away",       artist: "Chalee Dip",   plays: "9,450 plays",  genre: "Afrobeats" },
  { name: "Lagos Nights",     artist: "Amara Nwosu",  plays: "8,200 plays",  genre: "Afrobeats" },
  { name: "Golden Hour",      artist: "Raye Solaris", plays: "7,650 plays",  genre: "R&B"       },
  { name: "Midnight Fire",    artist: "Amara Nwosu",  plays: "6,800 plays",  genre: "Afrobeats" },
  { name: "Velvet Dreams",    artist: "Kai Mercer",   plays: "5,340 plays",  genre: "Hip-Hop"   },
]

// ── Shared sub-components ─────────────────────────────────

/** Compact stat card used across all tabs */
function ReportCard({
  icon, label, value, sub, iconBg = "bg-vibe-amber/15",
}: {
  icon: React.ReactNode; label: string; value: string
  sub: string; iconBg?: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full shrink-0", iconBg)}>
          {icon}
        </div>
        <span className="text-sm text-vibe-text-secondary">{label}</span>
      </div>
      <p className="font-heading text-2xl font-bold text-white leading-tight">{value}</p>
      <p className="text-xs text-vibe-text-muted leading-relaxed">{sub}</p>
    </div>
  )
}



/** Day with most plays – pie chart card, shared between Summary and Music Stats */
function DayWithMostPlays() {
  return (
    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
      <p className="text-sm font-medium text-vibe-text-secondary mb-4">Day with most plays</p>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Pie chart */}
        <div className="w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%"
                outerRadius={80} innerRadius={0} strokeWidth={0}>
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <PieTooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{ background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: "6px", fontSize: "12px" }}
                itemStyle={{ color: "#a0a0a0" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 flex-1">
          {PIE_DATA.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-vibe-text-secondary">{d.name}</span>
            </div>
          ))}
        </div>

        {/* Highlighted day */}
        <div className="flex flex-col items-center gap-1 shrink-0 md:ml-auto text-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-vibe-red flex items-center justify-center">
              <Play className="h-2.5 w-2.5 fill-white text-white" />
            </div>
            <span className="text-sm text-white font-medium">Saturday</span>
          </div>
          <p className="font-heading text-3xl font-bold text-white">728,512</p>
          <p className="text-xs text-vibe-text-muted max-w-[160px] leading-relaxed">
            Saturdays are the days with the most plays on this platform.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Top Tracks table — shared between Music Stats and Revenue */
function TopTracksTable() {
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 4
  const totalPages = Math.ceil(TOP_TRACKS.length / PAGE_SIZE)
  const paged = TOP_TRACKS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return (
    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-vibe-onyx-400">
        <h3 className="text-sm font-semibold text-white">Top Tracks</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {paged.map((track, i) => (
              <tr key={i}
                className="border-b border-vibe-onyx-400/40 last:border-0 hover:bg-vibe-onyx-300/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-vibe-onyx-300 flex items-center justify-center shrink-0">
                      <Music2 className="h-3 w-3 text-vibe-text-muted" />
                    </div>
                    <span className="text-sm text-vibe-text-primary font-medium truncate">{track.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-vibe-text-secondary">{track.artist}</td>
                <td className="px-4 py-3 text-sm text-vibe-text-muted tabular-nums">{track.plays}</td>
                <td className="px-4 py-3 text-sm text-vibe-text-muted">{track.genre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-vibe-onyx-400 flex items-center justify-between">
        <p className="text-xs text-vibe-text-muted">Showing {paged.length} of {TOP_TRACKS.length} tracks</p>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-6 h-6 rounded-sm text-xs font-medium transition-colors ${page === i + 1 ? "bg-vibe-red text-white" : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">Next</button>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Summary ──────────────────────────────────────────
function SummaryTab() {
  const [reportsPage, setReportsPage] = useState(1)
  const REPORTS_PAGE_SIZE = 3
  const RECENT_REPORTS = [
    { name: "User Growth",         freq: "Monthly", date: "April 2025" },
    { name: "Top Tracks",          freq: "Weekly",  date: "May 2025"   },
    { name: "Revenue",             freq: "Monthly", date: "May 2025"   },
    { name: "Artist Earnings",     freq: "Weekly",  date: "May 2025"   },
    { name: "Genre Breakdown",     freq: "Monthly", date: "May 2025"   },
    { name: "Listener Activity",   freq: "Daily",   date: "May 2025"   },
    { name: "Content Moderation",  freq: "Weekly",  date: "May 2025"   },
  ]
  const pagedReports = RECENT_REPORTS.slice((reportsPage - 1) * REPORTS_PAGE_SIZE, reportsPage * REPORTS_PAGE_SIZE)
  const reportsTotalPages = Math.ceil(RECENT_REPORTS.length / REPORTS_PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard icon={<Play        className="h-5 w-5 text-vibe-red"    />} iconBg="bg-vibe-red/15"    label="Total Plays"       value="1,245,000" sub="All time track plays across the platform" />
        <ReportCard icon={<Users       className="h-5 w-5 text-green-400"  />} iconBg="bg-green-500/15"  label="Active Users"      value="32,100"    sub="Users active in the last 30 days" />
        <ReportCard icon={<Upload      className="h-5 w-5 text-vibe-amber" />} iconBg="bg-vibe-amber/15" label="Tracks uploaded"   value="8,420"     sub="Total tracks uploaded by artists" />
        <ReportCard icon={<DollarSign  className="h-5 w-5 text-purple-400" />} iconBg="bg-purple-500/15" label="Revenue"           value="$54,200"   sub="Gross revenue this month" />
      </div>

      <DayWithMostPlays />

      {/* Recent Reports */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-vibe-onyx-400">
          <h3 className="text-sm font-semibold text-white">Recent Reports</h3>
        </div>
        <div className="divide-y divide-vibe-onyx-400/40">
          {pagedReports.map((r) => (
            <div key={r.name}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-vibe-onyx-300/50 transition-colors">
              <div className="w-6 h-6 rounded-sm bg-vibe-onyx-300 flex items-center justify-center shrink-0">
                <BarChart2 className="h-3.5 w-3.5 text-vibe-text-muted" />
              </div>
              <span className="flex-1 text-sm text-vibe-text-primary font-medium">{r.name}</span>
              <span className="text-xs text-vibe-text-muted w-20">{r.freq}</span>
              <span className="text-xs text-vibe-text-muted w-24">{r.date}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-vibe-text-secondary">Download</span>
                <button className="p-1 text-vibe-text-muted hover:text-white transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-vibe-onyx-400 flex items-center justify-between">
          <p className="text-xs text-vibe-text-muted">Showing {pagedReports.length} of {RECENT_REPORTS.length} reports</p>
          <div className="flex gap-1">
            {Array.from({ length: reportsTotalPages }, (_, i) => (
              <button key={i} onClick={() => setReportsPage(i + 1)}
                className={`w-6 h-6 rounded-sm text-xs font-medium transition-colors ${reportsPage === i + 1 ? "bg-vibe-red text-white" : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setReportsPage(p => Math.min(p + 1, reportsTotalPages))}
              className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: User Activity ────────────────────────────────────
function UserActivityTab() {
  const SESSIONS = [
    { name: "Jane Doe",     action: "Signed in",       time: "2 mins ago",   device: "Chrome" },
    { name: "Alex Smith",   action: "Played track",    time: "5 mins ago",   device: "Mobile" },
    { name: "Maria Lee",    action: "Uploaded track",  time: "10 mins ago",  device: "Web"    },
    { name: "Victor D.",    action: "Created playlist",time: "18 mins ago",  device: "Chrome" },
    { name: "Amara N.",     action: "Liked track",     time: "22 mins ago",  device: "Mobile" },
    { name: "Kai Mercer",   action: "Signed in",       time: "35 mins ago",  device: "Web"    },
    { name: "Zara Bloom",   action: "Downloaded album",time: "1 hr ago",     device: "Mobile" },
  ]
  const [sessPage, setSessPage] = useState(1)
  const SESS_PAGE_SIZE = 4
  const pagedSessions = SESSIONS.slice((sessPage - 1) * SESS_PAGE_SIZE, sessPage * SESS_PAGE_SIZE)
  const sessTotalPages = Math.ceil(SESSIONS.length / SESS_PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ReportCard icon={<Wifi       className="h-5 w-5 text-green-400"  />} iconBg="bg-green-500/15"  label="Online now"       value="1,120"  sub="Users currently online" />
        <ReportCard icon={<UserPlus   className="h-5 w-5 text-vibe-amber" />} iconBg="bg-vibe-amber/15" label="New Signups"      value="340"    sub="Sign ups in the last 24h" />
        <ReportCard icon={<RotateCcw  className="h-5 w-5 text-purple-400" />} iconBg="bg-purple-500/15" label="Returning users"  value="2,800"  sub="Logged in again this week" />
      </div>

      {/* Activity by Day line chart */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
        <p className="text-sm font-medium text-vibe-text-secondary mb-4">Activity by Day</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ACTIVITY_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#2E2E2E" />
              <XAxis dataKey="day" axisLine={false} tickLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 11 }} />
              <YAxis hide />
              <LineTooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: "6px", fontSize: "12px" }}
                itemStyle={{ color: "#a0a0a0" }}
              />
              <Line type="monotone" dataKey="value" stroke="#F4A435" strokeWidth={2.5}
                dot={false} activeDot={{ r: 4, fill: "#F4A435", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent User Sessions */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-vibe-onyx-400">
          <h3 className="text-sm font-semibold text-white">Recent User Sessions</h3>
        </div>
        <div className="divide-y divide-vibe-onyx-400/40">
          {pagedSessions.map((s, i) => (
            <div key={i}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-vibe-onyx-300/50 transition-colors">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-vibe-onyx-300 overflow-hidden shrink-0 flex items-center justify-center">
                <img src={`https://picsum.photos/seed/sess${i}/28/28`} alt={s.name}
                  className="w-full h-full object-cover" />
              </div>
              <span className="flex-1 text-sm text-vibe-text-primary font-medium min-w-[80px]">{s.name}</span>
              <span className="text-sm text-vibe-text-secondary flex-1 min-w-[100px]">{s.action}</span>
              <span className="text-xs text-vibe-text-muted w-24 tabular-nums">{s.time}</span>
              <span className="text-xs text-vibe-text-muted w-16">{s.device}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-vibe-onyx-400 flex items-center justify-between">
          <p className="text-xs text-vibe-text-muted">Showing {pagedSessions.length} of {SESSIONS.length} sessions</p>
          <div className="flex gap-1">
            {Array.from({ length: sessTotalPages }, (_, i) => (
              <button key={i} onClick={() => setSessPage(i + 1)}
                className={`w-6 h-6 rounded-sm text-xs font-medium transition-colors ${sessPage === i + 1 ? "bg-vibe-red text-white" : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setSessPage(p => Math.min(p + 1, sessTotalPages))}
              className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Music Stats ──────────────────────────────────────
function MusicStatsTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ReportCard icon={<Music2     className="h-5 w-5 text-vibe-amber" />} iconBg="bg-vibe-amber/15" label="Total Tracks"  value="58,200" sub="Tracks in library" />
        <ReportCard icon={<Upload     className="h-5 w-5 text-green-400"  />} iconBg="bg-green-500/15" label="New Uploads"   value="1,340"  sub="Uploaded this week" />
        <ReportCard icon={<Disc       className="h-5 w-5 text-purple-400" />} iconBg="bg-purple-500/15" label="Top Genre"    value="Pop"    sub="Most played genre" />
      </div>
      <DayWithMostPlays />
      <TopTracksTable />
    </div>
  )
}

// ── Tab: Revenue ──────────────────────────────────────────
function RevenueTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ReportCard icon={<DollarSign  className="h-5 w-5 text-vibe-amber" />} iconBg="bg-vibe-amber/15" label="Total Revenue"       value="$1,250,000" sub="All time earnings" />
        <ReportCard icon={<TrendingUp  className="h-5 w-5 text-green-400"  />} iconBg="bg-green-500/15" label="This Month"           value="$98,400"    sub="Revenue in June" />
        <ReportCard icon={<Music2      className="h-5 w-5 text-purple-400" />} iconBg="bg-purple-500/15" label="Top Earning Track"   value="Blinding Lights" sub="$12,300 earned" />
      </div>
      <TopTracksTable />
    </div>
  )
}

// ── Tab: Custom ───────────────────────────────────────────
const METRICS  = ["Revenue", "Plays", "Downloads", "Signups", "Streams"]
const GENRES   = ["All", "Pop", "Rock", "Hip-Hop", "Afrobeats", "R&B", "Electronic", "Jazz"]

function CustomTab() {
  const [dateRange,    setDateRange]    = useState("")
  const [userSearch,   setUserSearch]   = useState("")
  const [trackSearch,  setTrackSearch]  = useState("")
  const [metric,       setMetric]       = useState("")
  const [genre,        setGenre]        = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsGenerating(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-white">Build custom report</h2>
        <p className="text-sm text-vibe-text-secondary mt-1">
          Select filters and metrics to generate a tailored report.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-vibe-text-secondary">Date Range</label>
          <Input
            type="date"
            placeholder="Select date range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            icon={<CalendarDays className="h-4 w-4" />}
            className="[color-scheme:dark]"
          />
        </div>

        {/* User search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-vibe-text-secondary">User</label>
          <Input
            placeholder="Search by user"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Track search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-vibe-text-secondary">Track</label>
          <Input
            placeholder="Search by track"
            value={trackSearch}
            onChange={(e) => setTrackSearch(e.target.value)}
            icon={<Music2 className="h-4 w-4" />}
          />
        </div>

        {/* Metric */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-vibe-text-secondary">Metric</label>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger icon={<BarChart2 className="h-4 w-4" />}>
              <SelectValue placeholder="Choose metric (e.g. revenue, plays)" />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-vibe-text-secondary">Genre</label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger icon={<Disc className="h-4 w-4" />}>
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        size="lg"
        rounded="full"
        className="px-10"
        onClick={handleGenerate}
        loading={isGenerating}
      >
        Generate report
      </Button>
    </div>
  )
}

// ── Fade transition ───────────────────────────────────────
const tabFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

// ── Page ──────────────────────────────────────────────────
export function ReportsAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Summary")

  return (
    <div className="px-4 md:px-8 py-6 space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-vibe-onyx-400 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium rounded-t-sm transition-colors duration-150 -mb-px",
              activeTab === tab
                ? "bg-vibe-onyx-300 text-white border border-b-vibe-onyx-300 border-vibe-onyx-400"
                : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...tabFade}>
          {activeTab === "Summary"       && <SummaryTab />}
          {activeTab === "User Activity" && <UserActivityTab />}
          {activeTab === "Music Stats"   && <MusicStatsTab />}
          {activeTab === "Revenue"       && <RevenueTab />}
          {activeTab === "Custom"        && <CustomTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
