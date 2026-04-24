import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, DollarSign, Clock, CheckCircle, Wallet } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────
interface EarningsRow {
  artist:    string
  earnings:  string
  withdrawn: string
  pending:   string
}

// ── Mock data ─────────────────────────────────────────────
const REVENUE_STATS = [
  {
    label:    "Total Revenue",
    value:    "$23,400",
    sub:      "All time platform earnings",
    icon:     <DollarSign className="h-5 w-5 text-vibe-amber"  />,
    iconBg:   "bg-vibe-amber/15",
  },
  {
    label:    "Pending Payouts",
    value:    "$1,200",
    sub:      "Awaiting artist withdrawal",
    icon:     <Clock       className="h-5 w-5 text-vibe-red"    />,
    iconBg:   "bg-vibe-red/15",
  },
  {
    label:    "Commission Rate",
    value:    "15%",
    sub:      "Current platform share",
    icon:     <Wallet      className="h-5 w-5 text-green-400"   />,
    iconBg:   "bg-green-500/15",
  },
  {
    label:    "Completed Payouts",
    value:    "$18,900",
    sub:      "Total paid to artists",
    icon:     <CheckCircle className="h-5 w-5 text-purple-400"  />,
    iconBg:   "bg-purple-500/15",
  },
]

const ALL_ARTIST_EARNINGS: EarningsRow[] = [
  { artist: "Chalee Dip",    earnings: "$2,300", withdrawn: "$2,000", pending: "$300"  },
  { artist: "Amara Nwosu",   earnings: "$5,100", withdrawn: "$4,500", pending: "$600"  },
  { artist: "Victor Desire", earnings: "$1,800", withdrawn: "$1,500", pending: "$300"  },
  { artist: "Kai Mercer",    earnings: "$3,750", withdrawn: "$3,200", pending: "$550"  },
  { artist: "Luna Echoes",   earnings: "$980",   withdrawn: "$800",   pending: "$180"  },
  { artist: "Raye Solaris",  earnings: "$4,200", withdrawn: "$3,800", pending: "$400"  },
  { artist: "Zara Bloom",    earnings: "$620",   withdrawn: "$500",   pending: "$120"  },
  { artist: "DJ Mazur",      earnings: "$1,150", withdrawn: "$900",   pending: "$250"  },
]

const ALL_WITHDRAWAL_REQUESTS: EarningsRow[] = [
  { artist: "Chalee Dip",    earnings: "$2,300", withdrawn: "$2,000", pending: "$300"  },
  { artist: "Victor Desire", earnings: "$1,800", withdrawn: "$1,500", pending: "$300"  },
  { artist: "Luna Echoes",   earnings: "$980",   withdrawn: "$800",   pending: "$180"  },
  { artist: "Kai Mercer",    earnings: "$3,750", withdrawn: "$3,200", pending: "$550"  },
  { artist: "DJ Mazur",      earnings: "$1,150", withdrawn: "$900",   pending: "$250"  },
]

const COMMISSION_PRESETS = ["5%", "10%", "15%", "20%"] as const
type CommissionPreset = typeof COMMISSION_PRESETS[number]

// ── Revenue stat card (different from dashboard StatCard — has subtitle, no trend) ──
function RevenueCard({ stat }: { stat: typeof REVENUE_STATS[0] }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full shrink-0", stat.iconBg)}>
          {stat.icon}
        </div>
        <span className="text-sm text-vibe-text-secondary">{stat.label}</span>
      </div>
      <p className="font-heading text-3xl font-bold text-white">{stat.value}</p>
      <p className="text-xs text-vibe-text-muted">{stat.sub}</p>
    </div>
  )
}

// ── Commission dropdown ───────────────────────────────────
function CommissionDropdown({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]   = useState(false)
  const [custom, setCustom] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handlePreset = (preset: CommissionPreset) => {
    onChange(preset)
    setOpen(false)
  }

  const handleCustom = () => {
    if (custom.trim()) {
      onChange(custom.trim().endsWith("%") ? custom.trim() : `${custom.trim()}%`)
      setOpen(false)
      setCustom("")
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 h-9 rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 text-sm font-medium text-white hover:bg-vibe-onyx-300 transition-colors whitespace-nowrap"
      >
        Platform commission: {value}
        <ChevronDown className={cn("h-4 w-4 text-vibe-text-muted transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.15 } }}
            exit={   { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } }}
            className="absolute right-0 top-full mt-2 w-56 bg-vibe-onyx-200 border border-vibe-onyx-400 rounded-md shadow-xl z-50 p-3 space-y-3"
          >
            {/* Custom input */}
            <div className="space-y-1">
              <p className="text-xs text-vibe-text-muted">Custom set</p>
              <p className="text-xs text-vibe-text-muted">Enter percentage (%)</p>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustom()}
                  className="flex-1 h-7 px-2 rounded-sm bg-vibe-onyx-300 border border-vibe-onyx-400 text-xs text-white placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted"
                />
              </div>
            </div>

            {/* Preset pills */}
            <div className="flex flex-wrap gap-2">
              {COMMISSION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className={cn(
                    "px-3 h-7 rounded-sm text-xs font-medium transition-colors",
                    value === preset
                      ? "bg-vibe-red text-white"
                      : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Earnings/Withdrawal table ─────────────────────────────
function EarningsTable({
  rows, total, label, currentPage, onPageChange,
}: {
  rows:         EarningsRow[]
  total:        number
  label:        string
  currentPage:  number
  onPageChange: (p: number) => void
}) {
  return (
    <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vibe-onyx-400 bg-vibe-onyx-300">
              {["Artist", "Earnings", "Withdrawn", "Pending"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-vibe-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}
                className="border-b border-vibe-onyx-400/40 last:border-0 hover:bg-vibe-onyx-300/50 transition-colors">
                <td className="px-4 py-3 text-sm text-vibe-text-primary font-medium">{row.artist}</td>
                <td className="px-4 py-3 text-sm text-vibe-text-secondary tabular-nums">{row.earnings}</td>
                <td className="px-4 py-3 text-sm text-vibe-text-secondary tabular-nums">{row.withdrawn}</td>
                <td className="px-4 py-3 text-sm text-vibe-text-secondary tabular-nums">{row.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer — count + pagination */}
      <div className="px-4 py-3 border-t border-vibe-onyx-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-vibe-text-muted">
          Showing {rows.length} {label} out of {total}
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.max(1, Math.ceil(total / 5)) }, (_, i) => (
            <button key={i} onClick={() => onPageChange(i + 1)}
              className={cn(
                "w-6 h-6 rounded-sm text-xs font-medium transition-colors",
                i + 1 === currentPage
                  ? "bg-vibe-red text-white"
                  : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"
              )}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => onPageChange(Math.min(currentPage + 1, Math.ceil(total / 5)))}
            className="px-2.5 h-6 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export function MonetizationPage() {
  const [commission, setCommission]   = useState("15%")
  const [artistSearch, setArtistSearch] = useState("")
  const [earningsPage, setEarningsPage] = useState(1)
  const [withdrawPage, setWithdrawPage] = useState(1)
  const PAGE_SIZE = 5

  const filteredEarnings = ALL_ARTIST_EARNINGS.filter(r =>
    !artistSearch || r.artist.toLowerCase().includes(artistSearch.toLowerCase())
  )
  const filteredWithdrawals = ALL_WITHDRAWAL_REQUESTS.filter(r =>
    !artistSearch || r.artist.toLowerCase().includes(artistSearch.toLowerCase())
  )
  const pagedEarnings    = filteredEarnings.slice((earningsPage - 1) * PAGE_SIZE, earningsPage * PAGE_SIZE)
  const pagedWithdrawals = filteredWithdrawals.slice((withdrawPage - 1) * PAGE_SIZE, withdrawPage * PAGE_SIZE)

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Page title */}
      <h1 className="font-heading text-2xl font-bold text-white">Revenue Overview</h1>

      {/* Revenue stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {REVENUE_STATS.map((s) => <RevenueCard key={s.label} stat={s} />)}
      </div>

      {/* Artist Earnings section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-white">Artist Earnings</h2>
          <div className="flex items-center gap-3">
            {/* Artist search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vibe-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search artist"
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
                className="h-9 pl-9 pr-3 w-48 rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted transition-colors"
              />
            </div>
            {/* Commission dropdown */}
            <CommissionDropdown value={commission} onChange={setCommission} />
          </div>
        </div>

        <EarningsTable
          rows={pagedEarnings}
          total={filteredEarnings.length}
          label="artists earnings"
          currentPage={earningsPage}
          onPageChange={setEarningsPage}
        />
      </div>

      {/* Withdrawal Requests section */}
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-white">Withdrawal Requests</h2>
        <EarningsTable
          rows={pagedWithdrawals}
          total={filteredWithdrawals.length}
          label="Withdrawal requests"
          currentPage={withdrawPage}
          onPageChange={setWithdrawPage}
        />
      </div>
    </div>
  )
}
