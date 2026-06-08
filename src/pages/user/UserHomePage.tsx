import { useState, useRef, useEffect } from "react"
import { Play, MoreHorizontal, Heart, Plus, ListMusic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack, addToQueue } from "@/store/slices/playerSlice"
import { addTrackToPlaylist } from "@/store/slices/playlistSlice"
import { type NEW_RELEASES, vibeApi, type Track, normaliseNewRelease } from "@/store/api/vibeApi"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ── Mock data ─────────────────────────────────────────────
const TRENDING_SINGLES: Track[] = [
  { id: "ts1", title: "MILES AWAY",        artist: "Chalee Dip",           artistId: "a1", duration: 207, coverUrl: "https://picsum.photos/seed/miles/300/300",   audioUrl: "", genre: "Afrobeats", playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts2", title: "HARVEST",           artist: "Vdeeze",               artistId: "a2", duration: 214, coverUrl: "https://picsum.photos/seed/harvest2/300/300", audioUrl: "", genre: "Afrobeats", playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts3", title: "LOVE YOU",          artist: "Jon mills",            artistId: "a3", duration: 198, coverUrl: "https://picsum.photos/seed/loveyou/300/300",  audioUrl: "", genre: "R&B",      playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts4", title: "PIECE OF MY HEART", artist: "Wiz Queen Ft Davbine", artistId: "a4", duration: 221, coverUrl: "https://picsum.photos/seed/piece/300/300",    audioUrl: "", genre: "Pop",      playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts5", title: "GOLDEN HOUR",       artist: "Raye",                 artistId: "a5", duration: 187, coverUrl: "https://picsum.photos/seed/golden/300/300",   audioUrl: "", genre: "R&B",      playCount: 0, likeCount: 0, releaseDate: "" },
]

const AFROBEAT_CATEGORIES = [
  { id: "c1", label: "Afropop",     images: ["seed/af1a/150/150", "seed/af1b/150/150", "seed/af1c/150/150", "seed/af1d/150/150"] },
  { id: "c2", label: "Street jamz", images: ["seed/af2a/150/150", "seed/af2b/150/150", "seed/af2c/150/150", "seed/af2d/150/150"] },
  { id: "c3", label: "Afro fusion", images: ["seed/af3a/150/150", "seed/af3b/150/150", "seed/af3c/150/150", "seed/af3d/150/150"] },
  { id: "c4", label: "Dancehall",   images: ["seed/af4a/150/150", "seed/af4b/150/150", "seed/af4c/150/150", "seed/af4d/150/150"] },
  { id: "c5", label: "Highlife",    images: ["seed/af5a/150/150", "seed/af5b/150/150", "seed/af5c/150/150", "seed/af5d/150/150"] },
]

// ── Track card context menu options ──────────────────────
type TrackMenuAction =
  | { type: "add_to_playlist"; playlistId: string; playlistName: string }
  | { type: "add_to_queue" }
  | { type: "add_to_favourites" }
  | { type: "share" }
  | { type: "view_artist" }

// ── Page ─────────────────────────────────────────────────
export function UserHomePage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const displayName = user?.displayName ?? "Desire"

  const { data: newReleasesRaw, isLoading: newReleasesLoading } =
    vibeApi.useGetNewReleasesQuery({})

  const newReleaseTracks: Track[] = (newReleasesRaw ?? []).map((t: NEW_RELEASES) =>
    normaliseNewRelease(t)
  )

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Welcome, {displayName}</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">What do you want to listen to today?</p>
        </div>
        <Button size="default" rounded="full" className="shrink-0">Get free V coins</Button>
      </div>

      {/* Trending singles */}
      <TrackSection
        title="Trending singles"
        tracks={TRENDING_SINGLES}
        isLoading={false}
        queue={TRENDING_SINGLES}
      />

      {/* Afrobeat mix */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">Afrobeat mix for you</h2>
          <button className="flex items-center gap-1 text-xs text-vibe-text-muted hover:text-white transition-colors">
            Show all <span className="text-vibe-red">→</span>
          </button>
        </div>
        <ScrollArea className="w-full" orientation="horizontal">
          <div className="flex gap-4 pb-3" style={{ scrollSnapType: "x mandatory" }}>
            {AFROBEAT_CATEGORIES.map((cat) => (
              <AfrobeatCard key={cat.id} category={cat} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* New releases — live from API */}
      <TrackSection
        title="New Releases"
        tracks={newReleaseTracks}
        isLoading={newReleasesLoading}
        queue={newReleaseTracks}
        hideWhenEmpty
      />
    </div>
  )

  function TrackSection({
    title, tracks, isLoading, queue, hideWhenEmpty,
  }: {
    title: string
    tracks: Track[]
    isLoading: boolean
    queue: Track[]
    hideWhenEmpty?: boolean
  }) {
    if (hideWhenEmpty && !isLoading && tracks.length === 0) return null

    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">{title}</h2>
          <button className="flex items-center gap-1 text-xs text-vibe-text-muted hover:text-white transition-colors">
            Show all <span className="text-vibe-red">→</span>
          </button>
        </div>

        {isLoading ? (
          <TrackSkeletons />
        ) : (
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex gap-4 pb-3" style={{ scrollSnapType: "x mandatory" }}>
              {tracks.map((track) => (
                <TrendingCard
                  key={track.id}
                  track={track}
                  onPlay={() => dispatch(playTrack({ track, queue }))}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </section>
    )
  }
}

// ── Loading skeletons ─────────────────────────────────────
function TrackSkeletons() {
  return (
    <div className="flex gap-4 pb-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[160px] md:w-[180px]">
          <div className="aspect-[3/4] rounded-lg bg-vibe-onyx-300 animate-pulse mb-2" />
          <div className="h-3 w-3/4 rounded bg-vibe-onyx-300 animate-pulse mb-1.5" />
          <div className="h-2.5 w-1/2 rounded bg-vibe-onyx-300 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ── Track card ────────────────────────────────────────────
function TrendingCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  const dispatch = useAppDispatch()
  const { currentTrack, isPlaying } = useAppSelector((s) => s.player)
  const playlists = useAppSelector((s) => s.playlists.playlists)
  const isActive  = currentTrack?.id === track.id

  const [menuOpen, setMenuOpen]   = useState(false)
  const [liked, setLiked]         = useState(false)
  const menuRef                   = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [menuOpen])

  function handleAction(action: TrackMenuAction) {
    setMenuOpen(false)
    switch (action.type) {
      case "add_to_queue":
        dispatch(addToQueue(track))
        toast.success(`Added "${track.title}" to queue`)
        break
      case "add_to_favourites":
        setLiked(true)
        toast.success(`Added to favourites`)
        break
      case "add_to_playlist":
        dispatch(addTrackToPlaylist({ playlistId: action.playlistId, track }))
        toast.success(`Added to "${action.playlistName}"`)
        break
      case "share":
        navigator.clipboard?.writeText(track.title).catch(() => {})
        toast.success("Copied to clipboard")
        break
      case "view_artist":
        toast("Artist page coming soon")
        break
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="group/card relative shrink-0 w-[160px] md:w-[180px] cursor-pointer"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-vibe-onyx-300" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Hover overlay with play + ellipsis */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-200",
          "opacity-0 group-hover/card:opacity-100"
        )}>
          {/* Play button — centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); onPlay() }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Play className="h-4 w-4 fill-vibe-onyx text-vibe-onyx ml-0.5" />
            </button>
          </div>

          {/* Ellipsis — top right */}
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {/* Like indicator */}
          {liked && (
            <div className="absolute top-2 left-2">
              <Heart className="h-3.5 w-3.5 text-vibe-red fill-vibe-red" />
            </div>
          )}
        </div>

        {/* Equaliser animation when playing */}
        {isActive && isPlaying && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-[2px] pointer-events-none">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} className="w-[3px] bg-vibe-red rounded-full"
                animate={{ height: ["4px", "12px", "6px", "10px", "4px"] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* Track info */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
          <p className={cn(
            "font-heading text-sm font-bold uppercase tracking-wider truncate",
            isActive ? "text-vibe-red" : "text-white"
          )}>
            {track.title}
          </p>
          <p className="text-xs text-white/70 truncate mt-0.5">{track.artist}</p>
        </div>
      </div>

      {/* Context menu — rendered outside the overflow:hidden card */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.13 }}
            className={cn(
              "absolute right-0 top-2 z-50",
              "w-52 bg-vibe-onyx-100 border border-vibe-onyx-400 rounded-xl shadow-2xl",
              "py-1.5 overflow-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Track summary */}
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-vibe-onyx-400 mb-1">
              {track.coverUrl && (
                <img src={track.coverUrl} alt={track.title} className="h-7 w-7 rounded-sm object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{track.title}</p>
                <p className="text-[10px] text-vibe-text-muted truncate">{track.artist}</p>
              </div>
            </div>

            <MenuItem
              icon={<Heart className={cn("h-3.5 w-3.5", liked && "fill-vibe-red text-vibe-red")} />}
              label={liked ? "Remove from favourites" : "Add to favourites"}
              onClick={() => handleAction({ type: "add_to_favourites" })}
            />
            <MenuItem
              icon={<ListMusic className="h-3.5 w-3.5" />}
              label="Add to queue"
              onClick={() => handleAction({ type: "add_to_queue" })}
            />

            {/* Add to playlist sub-section */}
            {playlists.length > 0 && (
              <>
                <div className="mx-3 my-1 h-px bg-vibe-onyx-400" />
                <p className="px-3 py-1 text-[10px] font-medium text-vibe-text-muted uppercase tracking-wider">
                  Add to playlist
                </p>
                {playlists.slice(0, 5).map((pl) => (
                  <MenuItem
                    key={pl.id}
                    icon={
                      pl.coverUrl
                        ? <img src={pl.coverUrl} alt={pl.name} className="h-3.5 w-3.5 rounded-[2px] object-cover" />
                        : <Plus className="h-3.5 w-3.5" />
                    }
                    label={pl.name}
                    onClick={() => handleAction({ type: "add_to_playlist", playlistId: pl.id, playlistName: pl.name })}
                  />
                ))}
              </>
            )}

            <div className="mx-3 my-1 h-px bg-vibe-onyx-400" />
            <MenuItem
              icon={<span className="text-[11px]">👤</span>}
              label="View artist"
              onClick={() => handleAction({ type: "view_artist" })}
            />
            <MenuItem
              icon={<span className="text-[11px]">🔗</span>}
              label="Share"
              onClick={() => handleAction({ type: "share" })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Reusable menu item ────────────────────────────────────
function MenuItem({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors",
        danger
          ? "text-vibe-red hover:bg-vibe-red/10"
          : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300"
      )}
      onClick={onClick}
    >
      <span className={cn("shrink-0", danger ? "text-vibe-red" : "text-vibe-text-muted")}>{icon}</span>
      {label}
    </button>
  )
}

// ── Afrobeat category card ────────────────────────────────
function AfrobeatCard({ category }: { category: typeof AFROBEAT_CATEGORIES[0] }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="group shrink-0 w-[160px] md:w-[180px] cursor-pointer"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden">
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
          <p className="font-heading text-sm font-semibold text-white text-center">{category.label}</p>
        </div>
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/0 group-hover:ring-white/10 transition-all" />
      </div>
    </motion.div>
  )
}
