import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const FILTER_TABS = ["Playlists", "Artists", "Albums", "Downloads"] as const
type FilterTab = typeof FILTER_TABS[number]

export function UserLibraryPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("Downloads")

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Library</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">Your favourite songs are here</p>
        </div>
        <Button size="default" rounded="full" className="shrink-0">
          Get free V coins
        </Button>
      </div>

      {/* Filter tabs row */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors duration-150",
              activeTab === tab
                ? "border-vibe-text-secondary bg-vibe-onyx-400 text-white"
                : "border-vibe-onyx-400 bg-transparent text-vibe-text-secondary hover:border-vibe-text-muted hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active filter chip */}
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-vibe-onyx-300 border border-vibe-onyx-400 text-vibe-text-secondary">
          {activeTab}
        </span>
      </div>

      {/* Tab content */}
      {activeTab === "Playlists" ? <PlaylistsContent /> : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AmberBoxIllustration />
          <p className="font-heading text-lg font-semibold text-white">Empty</p>
        </div>
      )}
    </div>
  )
}

// ── Playlists content ─────────────────────────────────────
const DUMMY_PLAYLISTS = [
  { id: "pl1", title: "Vibe Garage Picks",  tracks: 24, coverUrl: "https://picsum.photos/seed/pl1/80/80",  creator: "Vibe Garage" },
  { id: "pl2", title: "Afrobeats Heat 🔥",  tracks: 18, coverUrl: "https://picsum.photos/seed/pl2/80/80",  creator: "Vibe Garage" },
  { id: "pl3", title: "Late Night Drive",   tracks: 15, coverUrl: "https://picsum.photos/seed/pl3/80/80",  creator: "Vibe Garage" },
  { id: "pl4", title: "Indie Discoveries",  tracks: 20, coverUrl: "https://picsum.photos/seed/pl4/80/80",  creator: "Vibe Garage" },
  { id: "pl5", title: "R&B Sunday",         tracks: 16, coverUrl: "https://picsum.photos/seed/pl5/80/80",  creator: "Vibe Garage" },
  { id: "pl6", title: "Gospel Essentials",  tracks: 22, coverUrl: "https://picsum.photos/seed/pl6/80/80",  creator: "Vibe Garage" },
]

function PlaylistsContent() {
  return (
    <div className="space-y-2">
      {DUMMY_PLAYLISTS.map((pl) => (
        <div key={pl.id}
          className="flex items-center gap-4 p-3 rounded-md hover:bg-vibe-onyx-300 transition-colors cursor-pointer group">
          <div className="relative shrink-0">
            <img src={pl.coverUrl} alt={pl.title} className="h-12 w-12 rounded-md object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
              <Play className="h-4 w-4 fill-white text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-vibe-text-primary truncate">{pl.title}</p>
            <p className="text-xs text-vibe-text-muted mt-0.5">{pl.tracks} tracks · {pl.creator}</p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-vibe-text-muted hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Amber open-box empty state illustration ───────────────
// Matches the amber/orange open box shown in the Library design
function AmberBoxIllustration() {
  return (
    <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box base / body */}
      <path d="M20 55 L60 70 L100 55 L100 90 L60 105 L20 90 Z"
        fill="#E8952A" />
      {/* Box front face shading */}
      <path d="M20 55 L20 90 L60 105 L60 70 Z"
        fill="#C8771A" />
      {/* Box lid left flap */}
      <path d="M20 55 L60 40 L60 55 L20 55 Z"
        fill="#F4A435" />
      {/* Box lid right flap */}
      <path d="M60 40 L100 55 L60 55 Z"
        fill="#E8952A" />
      {/* Box lid — open top-left flap */}
      <path d="M20 55 L8 38 L48 24 L60 40 Z"
        fill="#F4A435" />
      {/* Box lid — open top-right flap */}
      <path d="M100 55 L112 38 L72 24 L60 40 Z"
        fill="#FBBC5A" />
      {/* Centre ridge line */}
      <line x1="60" y1="40" x2="60" y2="70" stroke="#C8771A" strokeWidth="1" />
      {/* Highlight on right flap */}
      <path d="M100 55 L112 38 L92 30 L80 47 Z"
        fill="#FBCA6A" opacity="0.5" />
    </svg>
  )
}
