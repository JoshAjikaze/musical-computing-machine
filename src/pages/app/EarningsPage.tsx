import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { MoreVertical, Wallet, Download, TrendingUp, Music2, Receipt } from "lucide-react"
import { StatCard } from "@/components/app/StatCard"
import { useAppSelector } from "@/hooks/redux"
import { useGetArtistStatsQuery, useGetMyTracksQuery, normaliseTrack } from "@/store/api/vibeApi"
import { formatCurrency, formatPlays } from "@/lib/formatters"

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
      <p className="text-sm font-semibold text-white">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

// Empty 6-month chart scaffold — no fabricated values, all zero until real data exists
const EMPTY_CHART_DATA = [
  { month: "Jan", Earnings: 0 },
  { month: "Feb", Earnings: 0 },
  { month: "Mar", Earnings: 0 },
  { month: "Apr", Earnings: 0 },
  { month: "May", Earnings: 0 },
  { month: "Jun", Earnings: 0 },
]

// ── Page ──────────────────────────────────────────────────
export function EarningsPage() {
  const { user } = useAppSelector((s) => s.auth)
  const artistLabel = user?.stageName || user?.displayName || user?.username || ""

  const { data: stats, isFetching: statsLoading } = useGetArtistStatsQuery()
  const { data: rawTracks = [], isLoading: tracksLoading } = useGetMyTracksQuery()

  const topTracks = rawTracks
    .map((t) => normaliseTrack(t, artistLabel))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3)

  const STATS = [
    {
      label: "Total Earnings",
      value: formatCurrency(0),
      icon: <Wallet className="h-5 w-5 text-green-400" />,
    },
    {
      label: "Total Downloads",
      value: "0",
      icon: <Download className="h-5 w-5 text-vibe-red" />,
    },
    {
      label: "Total Streams",
      value: statsLoading ? "0" : formatPlays(stats?.total_plays),
      icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
    },
  ]

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
              data={EMPTY_CHART_DATA}
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
                tickFormatter={(v) => formatCurrency(v)}
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

          {tracksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="h-8 w-8 rounded-sm bg-vibe-onyx-400 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded bg-vibe-onyx-400" />
                    <div className="h-2.5 w-20 rounded bg-vibe-onyx-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : topTracks.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 text-vibe-text-muted">
              <Music2 className="h-8 w-8 opacity-30" />
              <p className="text-xs">No earning tracks yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {topTracks.map((track, i) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-sm hover:bg-vibe-onyx-300 transition-colors group cursor-pointer"
                >
                  <span className="text-sm text-vibe-text-muted w-4 shrink-0">{i + 1}.</span>
                  <div className="h-8 w-8 rounded-sm bg-vibe-onyx-300 shrink-0 overflow-hidden">
                    {track.coverUrl
                      ? <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center"><Music2 className="h-3.5 w-3.5 text-vibe-text-muted" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-vibe-text-primary truncate leading-tight">{track.title}</p>
                    <p className="text-xs text-vibe-text-muted truncate">{track.artist}</p>
                  </div>
                  <span className="text-sm font-medium text-white shrink-0">{formatCurrency(0)}</span>
                  <button className="text-vibe-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all ml-1">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-vibe-text-secondary">Recent Transactions</span>
            <button className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">
              View all
            </button>
          </div>

          <div className="flex flex-col items-center py-10 gap-2 text-vibe-text-muted">
            <Receipt className="h-8 w-8 opacity-30" />
            <p className="text-xs">No transactions yet</p>
          </div>
        </div>

      </div>
    </div>
  )
}
