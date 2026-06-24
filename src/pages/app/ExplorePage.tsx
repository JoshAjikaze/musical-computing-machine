import { useState } from "react"
import { ArrowLeft, TrendingUp, Music2, Play } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack, togglePlay } from "@/store/slices/playerSlice"
import {
  vibeApi, type NEW_RELEASES, type Track, normaliseNewRelease,
} from "@/store/api/vibeApi"
import { formatDuration } from "@/lib/formatters"
import { cn } from "@/lib/utils"

// ── Category definitions ──────────────────────────────────
type CategoryId =
  | "trending" | "new-releases" | "genre" | "top100"
  | "rising-star" | "you-may-like" | "old-classic" | "podcasts"

interface Category {
  id: CategoryId
  label: string
  images: string[]
  /** Purple "Vibe Garage 100" treatment */
  special?: boolean
  /** Whether this card has a live data endpoint wired up */
  hasData: boolean
}

const CATEGORIES: Category[] = [
  {
    id: "trending",
    label: "TRENDING",
    images: ["seed/cat1a/150/150", "seed/cat1b/150/150", "seed/cat1c/150/150", "seed/cat1d/150/150"],
    hasData: true,
  },
  {
    id: "new-releases",
    label: "NEW RELEASES",
    images: ["seed/cat2a/150/150", "seed/cat2b/150/150", "seed/cat2c/150/150", "seed/cat2d/150/150"],
    hasData: true,
  },
  {
    id: "genre",
    label: "GENRE",
    images: ["seed/cat3a/150/150", "seed/cat3b/150/150", "seed/cat3c/150/150", "seed/cat3d/150/150"],
    hasData: false,
  },
  {
    id: "top100",
    label: "TOP 100",
    images: [],
    special: true,
    hasData: false,
  },
  {
    id: "rising-star",
    label: "RISING STAR",
    images: ["seed/cat5a/150/150", "seed/cat5b/150/150", "seed/cat5c/150/150", "seed/cat5d/150/150"],
    hasData: false,
  },
  {
    id: "you-may-like",
    label: "YOU MAY LIKE",
    images: ["seed/cat6a/150/150", "seed/cat6b/150/150", "seed/cat6c/150/150", "seed/cat6d/150/150"],
    hasData: false,
  },
  {
    id: "old-classic",
    label: "OLD CLASSIC",
    images: ["seed/cat7a/150/150", "seed/cat7b/150/150", "seed/cat7c/150/150", "seed/cat7d/150/150"],
    hasData: false,
  },
  {
    id: "podcasts",
    label: "PODCASTS",
    images: ["seed/cat8a/150/150", "seed/cat8b/150/150", "seed/cat8c/150/150", "seed/cat8d/150/150"],
    hasData: false,
  },
]

// ── Page ──────────────────────────────────────────────────
export function ExplorePage() {
  const [openCategory, setOpenCategory] = useState<CategoryId | null>(null)
  const activeCategory = CATEGORIES.find((c) => c.id === openCategory)

  // Both queries called unconditionally — `skip` gates the actual request.
  // RTK query hooks can't be called conditionally (rules of hooks), so this
  // is the documented pattern; only the active one fires a real network call.
  const { data: trendingRaw, isLoading: trendingLoading } =
    vibeApi.useGetDiscoveryTrendingQuery(
      { limit: 50 },
      { skip: openCategory !== "trending" }
    )

  const { data: newReleasesRaw, isLoading: newReleasesLoading } =
    vibeApi.useGetNewReleasesQuery(
      { limit: 50 },
      { skip: openCategory !== "new-releases" }
    )

  // Resolve the right track list for whatever panel is currently open
  const { tracks, isLoading } = ((): { tracks: Track[]; isLoading: boolean } => {
    if (openCategory === "trending") {
      return {
        tracks: (trendingRaw ?? []).map((t: NEW_RELEASES) => normaliseNewRelease(t)),
        isLoading: trendingLoading,
      }
    }
    if (openCategory === "new-releases") {
      return {
        tracks: (newReleasesRaw ?? []).map((t: NEW_RELEASES) => normaliseNewRelease(t)),
        isLoading: newReleasesLoading,
      }
    }
    return { tracks: [], isLoading: false }
  })()

  return (
    <>
      <div className="px-4 md:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Explore</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">
            Discover other artists and the latest rookies
          </p>
        </div>

        {/* Category grid — 4 columns desktop, 2 mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => setOpenCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Tracks panel */}
      <TracksPanel
        open={!!openCategory}
        label={activeCategory?.label ?? ""}
        hasData={activeCategory?.hasData ?? false}
        tracks={tracks}
        isLoading={isLoading}
        onClose={() => setOpenCategory(null)}
      />
    </>
  )
}

// ── Category card ─────────────────────────────────────────
function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  if (category.special) {
    return (
      <button
        onClick={onClick}
        className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#6C3EB8] hover:brightness-110 transition-all duration-200 cursor-pointer group"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4">
          <span className="text-xs font-heading text-white/70 tracking-widest uppercase">
            Vibe Garage
          </span>
          <span className="font-display text-6xl text-white leading-none">100</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-2">
          <p className="font-heading text-xs font-semibold text-white uppercase tracking-widest text-center">
            {category.label}
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
    >
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {category.images.slice(0, 4).map((seed, i) => (
          <div key={i} className="overflow-hidden">
            <img
              src={`https://picsum.photos/${seed}`}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
        <p className="font-heading text-xs font-semibold text-white uppercase tracking-widest text-center">
          {category.label}
        </p>
      </div>
      <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/0 group-hover:ring-white/10 transition-all duration-200" />
    </button>
  )
}

// ── Tracks panel ──────────────────────────────────────────
const panelSlide = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit:    { x: "100%", transition: { duration: 0.2 } },
}

function TracksPanel({
  open, label, hasData, tracks, isLoading, onClose,
}: {
  open: boolean
  label: string
  hasData: boolean
  tracks: Track[]
  isLoading: boolean
  onClose: () => void
}) {
  const dispatch = useAppDispatch()
  const { currentTrack, isPlaying } = useAppSelector((s) => s.player)

  function handlePlay(track: Track) {
    if (currentTrack?.id === track.id) dispatch(togglePlay())
    else dispatch(playTrack({ track, queue: tracks }))
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="tracks-panel"
            {...panelSlide}
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[420px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-vibe-onyx-400 shrink-0">
              <button
                onClick={onClose}
                className="text-white hover:text-vibe-text-secondary transition-colors"
                aria-label="Close panel"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <TrendingUp className="h-4 w-4 text-vibe-amber" />
              <h2 className="font-heading text-lg font-semibold text-white capitalize">
                {label.charAt(0) + label.slice(1).toLowerCase()} tracks
              </h2>
            </div>

            {/* Body */}
            {isLoading ? (
              <PanelSkeleton />
            ) : !hasData ? (
              // No endpoint wired for this category yet
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-vibe-text-muted px-6">
                <Music2 className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium text-white">Coming soon</p>
                <p className="text-xs text-center opacity-70">
                  This section is still being curated
                </p>
              </div>
            ) : tracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-vibe-text-muted px-6">
                <Music2 className="h-10 w-10 opacity-30" />
                <p className="text-sm">No tracks yet</p>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-[28px_1fr_80px_56px] gap-2 px-6 py-3 border-b border-vibe-onyx-400 shrink-0">
                  <span className="text-xs text-vibe-text-muted">#</span>
                  <span className="text-xs text-vibe-text-muted">Title</span>
                  <span className="text-xs text-vibe-text-muted hidden md:block">Album</span>
                  <span className="text-xs text-vibe-text-muted text-right">Duration</span>
                </div>

                {/* Track rows */}
                <div className="flex-1 overflow-y-auto scrollbar-vibe">
                  {tracks.map((track, i) => {
                    const isActive     = currentTrack?.id === track.id
                    const isNowPlaying = isActive && isPlaying
                    return (
                      <div
                        key={track.id}
                        onDoubleClick={() => handlePlay(track)}
                        className={cn(
                          "grid grid-cols-[28px_1fr_80px_56px] gap-2 items-center px-6 py-2.5 cursor-pointer transition-colors group",
                          isActive
                            ? "bg-vibe-red/15 hover:bg-vibe-red/20"
                            : "hover:bg-vibe-onyx-300"
                        )}
                      >
                        {/* Index / equaliser */}
                        <div className="flex items-center justify-center h-4">
                          {isNowPlaying ? (
                            <div className="flex items-end gap-[2px] h-3">
                              {[1,2,3].map((j) => (
                                <motion.div
                                  key={j}
                                  className="w-[2px] bg-vibe-red rounded-full"
                                  animate={{ height: ["30%","100%","55%","85%","30%"] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.15 }}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className={cn(
                              "text-xs tabular-nums group-hover:hidden",
                              isActive ? "text-vibe-red" : "text-vibe-text-muted"
                            )}>
                              {i + 1}
                            </span>
                          )}
                          {!isNowPlaying && (
                            <button
                              onClick={() => handlePlay(track)}
                              className="hidden group-hover:flex items-center justify-center"
                              aria-label="Play"
                            >
                              <Play className="h-3.5 w-3.5 fill-current text-white" />
                            </button>
                          )}
                        </div>

                        {/* Cover + title + artist */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-sm bg-vibe-onyx-400 shrink-0 overflow-hidden">
                            {track.coverUrl ? (
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Music2 className="h-3.5 w-3.5 text-vibe-text-muted" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate leading-tight",
                              isActive ? "text-vibe-red" : "text-vibe-text-primary"
                            )}>
                              {track.title}
                            </p>
                            <p className="text-xs text-vibe-text-muted truncate">
                              {track.artist || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Album — normaliseNewRelease doesn't populate this;
                            shown as em-dash rather than blank */}
                        <p className="text-xs text-vibe-text-muted truncate hidden md:block">
                          {track.album || "—"}
                        </p>

                        {/* Duration */}
                        <p className={cn(
                          "text-xs tabular-nums text-right",
                          isActive ? "text-vibe-red" : "text-vibe-text-muted"
                        )}>
                          {track.duration > 0 ? formatDuration(track.duration) : "—"}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </motion.div>

          {/* Backdrop */}
          <motion.div
            key="tracks-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 hidden md:block"
            onClick={onClose}
          />
        </>
      )}
    </AnimatePresence>
  )
}

function PanelSkeleton() {
  return (
    <div className="flex-1 overflow-hidden px-6 py-4 space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-5 h-3 rounded bg-vibe-onyx-400 shrink-0" />
          <div className="h-8 w-8 rounded-sm bg-vibe-onyx-400 shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="h-3 rounded bg-vibe-onyx-400 w-2/3" />
            <div className="h-2.5 rounded bg-vibe-onyx-400 w-1/3" />
          </div>
          <div className="h-2.5 w-8 rounded bg-vibe-onyx-400 shrink-0" />
        </div>
      ))}
    </div>
  )
}
