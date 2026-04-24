import { useState } from "react"
import { Search, BarChart2, Trash2, Pencil, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableRowActions } from "@/components/ui/table-row-actions"
import { StatCard } from "@/components/app/StatCard"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Users, DollarSign, Headphones, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────
type TrackStatus = "Active" | "Pending" | "Flagged"
type FilterType  = "All" | "Artist" | "Listener"
type FilterStatus = "All" | "Active" | "Pending" | "Flagged"

interface TrackRow {
  id:        string
  title:     string
  subtitle:  string
  coverUrl:  string
  artist:    string
  genre:     string
  duration:  string
  uploaded:  string
  streams:   string
  status:    TrackStatus
}

// ── Mock data ─────────────────────────────────────────────
const STATS = [
  { label: "Total Artists",        value: "270.7M", change: 14,    icon: <Users      className="h-5 w-5 text-vibe-amber"  /> },
  { label: "Total Earnings",       value: "$10.5M", change: 25,    icon: <DollarSign className="h-5 w-5 text-green-400"   /> },
  { label: "Total Listeners",      value: "298.7K", change: -0.41, icon: <Headphones className="h-5 w-5 text-vibe-red"    /> },
  { label: "Pending verification", value: "12",     change: 8,     icon: <Clock      className="h-5 w-5 text-purple-400"  /> },
]

const MOCK_TRACKS: TrackRow[] = [
  { id:"t1",  title:"Miles away",       subtitle:"Far away",      coverUrl:"https://picsum.photos/seed/trk0/40/40",  artist:"Chalee Dip",    genre:"Afrobeats",   duration:"3:45", uploaded:"Mar 15, 2025", streams:"24,823", status:"Active"  },
  { id:"t2",  title:"Kung Fu",          subtitle:"Power move",    coverUrl:"https://picsum.photos/seed/trk1/40/40",  artist:"Chalee Dip",    genre:"Hip-Hop",     duration:"4:02", uploaded:"Mar 18, 2025", streams:"18,441", status:"Active"  },
  { id:"t3",  title:"Know ya",          subtitle:"Self aware",    coverUrl:"https://picsum.photos/seed/trk2/40/40",  artist:"Chalee Dip",    genre:"R&B",         duration:"3:28", uploaded:"Mar 22, 2025", streams:"11,200", status:"Active"  },
  { id:"t4",  title:"Standard",         subtitle:"Baseline",      coverUrl:"https://picsum.photos/seed/trk3/40/40",  artist:"Chalee Dip",    genre:"Pop",         duration:"3:15", uploaded:"Apr 01, 2025", streams:"8,954",  status:"Active"  },
  { id:"t5",  title:"The Stimulus",     subtitle:"Wake up",       coverUrl:"https://picsum.photos/seed/trk4/40/40",  artist:"Victor Desire", genre:"Electronic",  duration:"4:30", uploaded:"Apr 05, 2025", streams:"6,312",  status:"Pending" },
  { id:"t6",  title:"Lagos Nights",     subtitle:"City life",     coverUrl:"https://picsum.photos/seed/trk5/40/40",  artist:"Amara Nwosu",   genre:"Afrobeats",   duration:"3:55", uploaded:"Apr 08, 2025", streams:"31,890", status:"Active"  },
  { id:"t7",  title:"Midnight Fire",    subtitle:"Burn bright",   coverUrl:"https://picsum.photos/seed/trk6/40/40",  artist:"Amara Nwosu",   genre:"Afrobeats",   duration:"4:10", uploaded:"Apr 10, 2025", streams:"22,100", status:"Active"  },
  { id:"t8",  title:"Velvet Dreams",    subtitle:"Soft night",    coverUrl:"https://picsum.photos/seed/trk7/40/40",  artist:"Kai Mercer",    genre:"Hip-Hop",     duration:"3:38", uploaded:"Apr 12, 2025", streams:"14,567", status:"Active"  },
  { id:"t9",  title:"Broken Satellite", subtitle:"Lost signal",   coverUrl:"https://picsum.photos/seed/trk8/40/40",  artist:"Zara Bloom",    genre:"Indie",       duration:"5:01", uploaded:"Apr 14, 2025", streams:"9,023",  status:"Flagged" },
  { id:"t10", title:"Golden Hour",      subtitle:"Warm light",    coverUrl:"https://picsum.photos/seed/trk9/40/40",  artist:"Raye Solaris",  genre:"R&B",         duration:"3:52", uploaded:"Apr 16, 2025", streams:"27,340", status:"Active"  },
  { id:"t11", title:"Ocean Blue",       subtitle:"Deep waters",   coverUrl:"https://picsum.photos/seed/trk10/40/40", artist:"Luna Echoes",   genre:"Electronic",  duration:"4:22", uploaded:"Apr 18, 2025", streams:"16,780", status:"Active"  },
  { id:"t12", title:"Phosphene",        subtitle:"Mind's eye",    coverUrl:"https://picsum.photos/seed/trk11/40/40", artist:"Luna Echoes",   genre:"Ambient",     duration:"5:48", uploaded:"Apr 20, 2025", streams:"5,234",  status:"Pending" },
]

// ── Status pill ───────────────────────────────────────────
function TrackStatusPill({ status }: { status: TrackStatus }) {
  return (
    <span className={cn(
      "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium",
      status === "Active"  && "bg-green-500/15 text-green-400",
      status === "Pending" && "bg-vibe-amber/15 text-vibe-amber",
      status === "Flagged" && "bg-vibe-red/15 text-vibe-red",
    )}>
      {status}
    </span>
  )
}

// ── Row actions dropdown (Analytics / Remove / Edit / Flag) ──


// ── Filter dropdown (same pattern as User Management) ─────
function FilterDropdown<T extends string>({
  value, onChange, options, placeholder,
}: { value: T; onChange: (v: T) => void; options: T[]; placeholder: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="h-9 w-36 text-xs">
        <span className="text-vibe-text-muted mr-1 text-xs">{placeholder}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

// ── Page ──────────────────────────────────────────────────
export function MusicManagementPage() {
  const [search, setSearch]     = useState("")
  const [userType, setUserType] = useState<FilterType>("All")
  const [status, setStatus]     = useState<FilterStatus>("All")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [page, setPage]         = useState(1)
  const PAGE_SIZE = 5

  const filtered = MOCK_TRACKS.filter((t) => {
    const matchStatus = status === "All" || t.status === status
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleAll = () =>
    setSelected(selected.size === paginated.length ? new Set() : new Set(paginated.map((_, i) => i)))

  const toggleRow = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  return (
    <div className="px-4 md:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Welcome, Admin</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">Overview of Vibe garage's performance</p>
        </div>
        <Button size="default" rounded="full" className="shrink-0">Feature track</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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
        <FilterDropdown<FilterType>   value={userType} onChange={setUserType} options={["All","Artist","Listener"]} placeholder="User type" />
        <FilterDropdown<FilterStatus> value={status}   onChange={setStatus}   options={["All","Active","Pending","Flagged"]} placeholder="Status" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Tracks table */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vibe-onyx-400 bg-vibe-onyx-300">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="accent-vibe-red w-4 h-4 cursor-pointer"
                  />
                </th>
                {["Track title","Artist","Genre","Duration","Uploaded","Streams","Status","Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-vibe-text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((track, i) => (
                <tr key={track.id}
                  className={cn(
                    "border-b border-vibe-onyx-400/40 last:border-0 transition-colors",
                    selected.has(i) ? "bg-vibe-onyx-300" : "hover:bg-vibe-onyx-300/50"
                  )}
                >
                  <td className="px-4 py-2.5">
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggleRow(i)}
                      className="accent-vibe-red w-4 h-4 cursor-pointer" />
                  </td>
                  {/* Track title — cover + title + subtitle */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-[140px]">
                      <img src={track.coverUrl} alt={track.title}
                        className="h-8 w-8 rounded-sm object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-vibe-text-primary truncate">{track.title}</p>
                        <p className="text-xs text-vibe-text-muted truncate">{track.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-vibe-text-secondary text-xs whitespace-nowrap">{track.artist}</td>
                  <td className="px-3 py-2.5 text-vibe-text-secondary text-xs">{track.genre}</td>
                  <td className="px-3 py-2.5 text-vibe-text-muted text-xs tabular-nums">{track.duration}</td>
                  <td className="px-3 py-2.5 text-vibe-text-muted text-xs whitespace-nowrap">{track.uploaded}</td>
                  <td className="px-3 py-2.5 text-vibe-text-secondary text-xs tabular-nums">{track.streams}</td>
                  <td className="px-3 py-2.5"><TrackStatusPill status={track.status} /></td>
                  <td className="px-3 py-2.5"><TableRowActions actions={[
                        { label: "Analytics", icon: BarChart2, onClick: () => {} },
                        { label: "Remove",    icon: Trash2,    onClick: () => {}, color: "text-vibe-red hover:text-red-300" },
                        { label: "Edit",      icon: Pencil,    onClick: () => {} },
                        { label: "Flag",      icon: Flag,      onClick: () => {}, color: "text-vibe-amber hover:text-yellow-300" },
                      ]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-4 border-t border-vibe-onyx-400 flex items-center justify-between">
          <p className="text-xs text-vibe-text-muted">Showing {paginated.length} of {filtered.length} tracks</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-sm text-xs font-medium transition-colors ${page === i + 1 ? "bg-vibe-red text-white" : "bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="px-3 h-7 rounded-sm text-xs font-medium bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-400 transition-colors ml-1">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
