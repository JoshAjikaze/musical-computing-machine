import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { MoreVertical, Wallet, Download, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/app/StatCard"

// ── Mock data (matches design values exactly) ─────────────
const STATS = [
  {
    label: "Total Earnings",
    value: " ₦0",
    change: 0,
    icon: <Wallet className="h-5 w-5 text-green-400" />,
  },
  {
    label: "Total Downloads",
    value: "0",
    change: 0,
    icon: <Download className="h-5 w-5 text-vibe-red" />,
  },
  {
    label: "Total Streams",
    value: "0",
    change: 0,
    icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
  },
]

const CHART_DATA = [
  { month: "Jan", Earnings: 0 },
  { month: "Feb", Earnings: 0 },
  { month: "Mar", Earnings: 0 },
  { month: "Apr", Earnings: 0 },
  { month: "May", Earnings: 0 },
  { month: "Jun", Earnings: 0 },
]

const TOP_TRACKS = [
  { rank: 1, title: "Miles away", artist: "Chalee Dip", amount: "$1,200", coverUrl: "https://picsum.photos/seed/s1/40/40" },
  { rank: 2, title: "Kung Fu", artist: "Chalee Dip", amount: "$800", coverUrl: "https://picsum.photos/seed/s2/40/40" },
  { rank: 3, title: "Know ya", artist: "Chalee Dip", amount: "$750", coverUrl: "https://picsum.photos/seed/s3/40/40" },
]

const TRANSACTIONS = [
  { label: "Payout - June", amount: "$2,400" },
  { label: "Payout - May", amount: "$2,000" },
  { label: "Payout - April", amount: "$1,800" },
]

// ── Custom tooltip ────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md bg-vibe-onyx-300 border border-vibe-onyx-400 px-3 py-2 shadow-xl">
      <p className="text-xs text-vibe-text-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export function EarningsPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Earnings</h1>
        <p className="text-sm text-vibe-text-secondary mt-0.5 max-w-xl">
          Here you can track your financial performance, including total earnings, downloads, streams, and more
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CHART_DATA}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              barCategoryGap="35%"
            >
              <CartesianGrid
                vertical={false}
                stroke="#2E2E2E"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                tickFormatter={(v) => v.toLocaleString()}
                ticks={[0, 600, 1200, 1800, 2400]}
                domain={[0, 2400]}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend
                verticalAlign="bottom"
                align="left"
                iconType="square"
                iconSize={10}
                formatter={() => (
                  <span style={{ color: "#A0A0A0", fontSize: "12px" }}>Earnings</span>
                )}
                wrapperStyle={{ paddingTop: "16px", paddingLeft: "4px" }}
              />
              <Bar
                dataKey="Earnings"
                fill="#F4A435"
                radius={[3, 3, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom two tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Earning Tracks */}
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-vibe-text-secondary">Top Earning Tracks</span>
            <button className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">
              View all
            </button>
          </div>

          <div className="space-y-1 hidden">
            {TOP_TRACKS.map((track) => (
              <div
                key={track.rank}
                className="flex items-center gap-3 py-2 px-2 rounded-sm hover:bg-vibe-onyx-300 transition-colors group cursor-pointer"
              >
                <span className="text-sm text-vibe-text-muted w-4 shrink-0">{track.rank}.</span>
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="h-8 w-8 rounded-sm object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-vibe-text-primary truncate leading-tight">{track.title}</p>
                  <p className="text-xs text-vibe-text-muted truncate">{track.artist}</p>
                </div>
                <span className="text-sm font-medium text-white shrink-0">{track.amount}</span>
                <button className="text-vibe-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all ml-1">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="text-vibe-text-secondary text-center">Not Available</div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-vibe-text-secondary">Recent Transactions</span>
            <button className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">
              View all
            </button>
          </div>

          <div className="space-y-1 hidden">
            {TRANSACTIONS.map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 px-2 rounded-sm hover:bg-vibe-onyx-300 transition-colors cursor-pointer border-b border-vibe-onyx-400/40 last:border-0"
              >
                <span className="text-sm text-vibe-text-secondary">{tx.label}</span>
                <span className="text-sm font-medium text-white">{tx.amount}</span>
              </div>
            ))}
          </div>
          <div className="text-vibe-text-secondary text-center">Not Available</div>
        </div>

      </div>
    </div>
  )
}
