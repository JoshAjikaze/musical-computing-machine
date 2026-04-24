import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import { Users, DollarSign, Headphones, UserPlus } from "lucide-react"
import { StatCard } from "@/components/app/StatCard"

// ── Mock data (matches design values) ────────────────────
const STATS = [
  { label: "Total Artists",   value: "270.7M", change: 14,   icon: <Users       className="h-5 w-5 text-vibe-amber"   /> },
  { label: "Total Earnings",  value: "$10.5M", change: 25,   icon: <DollarSign  className="h-5 w-5 text-green-400"    /> },
  { label: "Total Listeners", value: "298.7K", change: -0.41,icon: <Headphones  className="h-5 w-5 text-vibe-red"     /> },
  { label: "New Signups",     value: "131.7M", change: 8,    icon: <UserPlus    className="h-5 w-5 text-purple-400"   /> },
]

const ACTIVITY_DATA = [
  { day: "Mon",   value: 180 },
  { day: "Tue",   value: 320 },
  { day: "Wed",   value: 260 },
  { day: "Thurs", value: 400 },
  { day: "Fri",   value: 340 },
  { day: "Sat",   value: 480 },
  { day: "Sun",   value: 420 },
]

const STREAMED_TRACKS = [
  { name: "Miles Away",   artist: "Chalee Dip",   streams: "24,844" },
  { name: "The Stimulus", artist: "Victor Desire", streams: "20,723" },
  { name: "Ocean blue",   artist: "Terry Y",       streams: "14,113" },
]

const TRANSACTIONS = [
  { date: "Mar 20", user: "vdeeze",  item: "Subscription",  amount: "$9.99"  },
  { date: "Mar 20", user: "jsmith",  item: "Track purchase", amount: "$1.99"  },
  { date: "Mar 19", user: "mlee",    item: "Album purchase", amount: "$12.99" },
]

const GENRE_DATA = [
  { name: "Pop",        value: 28, color: "#6C3EB8" },
  { name: "Rock",       value: 22, color: "#22C55E" },
  { name: "Hip Hop",    value: 20, color: "#F4A435" },
  { name: "Electronic", value: 18, color: "#3B82F6" },
  { name: "Jazz",       value: 12, color: "#EC4899" },
]

// ── Custom tooltips ───────────────────────────────────────
function LineTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md bg-vibe-onyx-300 border border-vibe-onyx-400 px-3 py-2 shadow-xl">
      <p className="text-xs text-vibe-text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

function PieTooltip({ active, payload }: {
  active?: boolean; payload?: { name: string; value: number }[]
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md bg-vibe-onyx-300 border border-vibe-onyx-400 px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold text-white">
        {payload[0].name} — {payload[0].value}%
      </p>
    </div>
  )
}

// ── Card shell reused for all dashboard panels ────────────
function DashCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5 ${className ?? ""}`}>
      {children}
    </div>
  )
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium text-vibe-text-secondary mb-4">{children}</p>
  )
}

// ── Page ──────────────────────────────────────────────────
export function AdminDashboard() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-5">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Welcome, Admin</h1>
        <p className="text-sm text-vibe-text-secondary mt-0.5">
          Overview of Vibe garage's performance
        </p>
      </div>

      {/* Stat cards — 4 col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Middle row — line chart + most streamed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* User activity trends — amber line chart */}
        <DashCard>
          <CardLabel>User activity trends</CardLabel>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ACTIVITY_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#2E2E2E" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B6B6B", fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip content={<LineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#F4A435"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#F4A435", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

        {/* Most streamed tracks */}
        <DashCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-vibe-purple/20 flex items-center justify-center shrink-0">
              <span className="text-xs text-vibe-purple-light">♫</span>
            </div>
            <CardLabel>Most streamed tracks</CardLabel>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_80px] gap-2 pb-2 border-b border-vibe-onyx-400 mb-1">
            {["Track name", "Artist", "Streams"].map((h) => (
              <span key={h} className="text-xs text-vibe-text-muted">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-0.5">
            {STREAMED_TRACKS.map((track, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_80px] gap-2 py-2.5 hover:bg-vibe-onyx-300 px-1 rounded-sm transition-colors">
                <span className="text-sm text-vibe-text-primary truncate">{track.name}</span>
                <span className="text-sm text-vibe-text-secondary truncate">{track.artist}</span>
                <span className="text-sm text-vibe-text-secondary tabular-nums">{track.streams}</span>
              </div>
            ))}
          </div>
        </DashCard>
      </div>

      {/* Bottom row — recent transactions + revenue by genre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Transactions */}
        <DashCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-vibe-red/15 flex items-center justify-center shrink-0">
              <span className="text-xs text-vibe-red">$</span>
            </div>
            <CardLabel>Recent Transactions</CardLabel>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[60px_1fr_1fr_70px] gap-2 pb-2 border-b border-vibe-onyx-400 mb-1">
            {["Date", "User", "Item", "Amount"].map((h) => (
              <span key={h} className="text-xs text-vibe-text-muted">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-0.5">
            {TRANSACTIONS.map((tx, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_1fr_70px] gap-2 py-2.5 hover:bg-vibe-onyx-300 px-1 rounded-sm transition-colors">
                <span className="text-xs text-vibe-text-muted tabular-nums">{tx.date}</span>
                <span className="text-sm text-vibe-text-primary truncate">{tx.user}</span>
                <span className="text-sm text-vibe-text-secondary truncate">{tx.item}</span>
                <span className="text-sm font-medium text-white tabular-nums">{tx.amount}</span>
              </div>
            ))}
          </div>
        </DashCard>

        {/* Revenue by Genre — pie chart */}
        <DashCard>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-vibe-amber/15 flex items-center justify-center shrink-0">
              <span className="text-xs text-vibe-amber">♪</span>
            </div>
            <CardLabel>Revenue by Genre</CardLabel>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GENRE_DATA}
                  cx="38%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {GENRE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="square"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ color: "#A0A0A0", fontSize: "12px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

      </div>
    </div>
  )
}
