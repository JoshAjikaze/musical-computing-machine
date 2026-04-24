import { Play } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import type { Track } from "@/store/api/vibeApi"
import { cn } from "@/lib/utils"

// ── Mock data (matches designs) ───────────────────────────
const TRENDING_SINGLES: Track[] = [
  { id: "ts1", title: "MILES AWAY",       artist: "Chalee Dip", artistId: "a1", duration: 207,
    coverUrl: "https://picsum.photos/seed/miles/300/300",    audioUrl: "", genre: "Afrobeats", playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts2", title: "HARVEST",          artist: "Vdeeze",     artistId: "a2", duration: 214,
    coverUrl: "https://picsum.photos/seed/harvest2/300/300", audioUrl: "", genre: "Afrobeats", playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts3", title: "LOVE YOU",         artist: "Jon mills",  artistId: "a3", duration: 198,
    coverUrl: "https://picsum.photos/seed/loveyou/300/300",  audioUrl: "", genre: "R&B",       playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts4", title: "PIECE OF MY HEART", artist: "Wiz Queen Ft Davbine", artistId: "a4", duration: 221,
    coverUrl: "https://picsum.photos/seed/piece/300/300",    audioUrl: "", genre: "Pop",       playCount: 0, likeCount: 0, releaseDate: "" },
  { id: "ts5", title: "GOLDEN HOUR",      artist: "Raye",       artistId: "a5", duration: 187,
    coverUrl: "https://picsum.photos/seed/golden/300/300",   audioUrl: "", genre: "R&B",       playCount: 0, likeCount: 0, releaseDate: "" },
]

const AFROBEAT_CATEGORIES = [
  { id: "c1", label: "Afropop",     images: ["seed/af1a/150/150","seed/af1b/150/150","seed/af1c/150/150","seed/af1d/150/150"] },
  { id: "c2", label: "Street jamz", images: ["seed/af2a/150/150","seed/af2b/150/150","seed/af2c/150/150","seed/af2d/150/150"] },
  { id: "c3", label: "Afro fusion", images: ["seed/af3a/150/150","seed/af3b/150/150","seed/af3c/150/150","seed/af3d/150/150"] },
  { id: "c4", label: "Dancehall",   images: ["seed/af4a/150/150","seed/af4b/150/150","seed/af4c/150/150","seed/af4d/150/150"] },
  { id: "c5", label: "Highlife",    images: ["seed/af5a/150/150","seed/af5b/150/150","seed/af5c/150/150","seed/af5d/150/150"] },
]

export function UserHomePage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const displayName = user?.displayName ?? "Desire"

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Welcome, {displayName}</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">What do you want to listen to today?</p>
        </div>
        <Button size="default" rounded="full" className="shrink-0">
          Get free V coins
        </Button>
      </div>

      {/* Trending singles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">Trending singles</h2>
          <button className="flex items-center gap-1 text-xs text-vibe-text-muted hover:text-white transition-colors">
            Show all
            <span className="text-vibe-red">→</span>
          </button>
        </div>

        <ScrollArea className="w-full" orientation="horizontal">
          <div className="flex gap-4 pb-3" style={{ scrollSnapType: "x mandatory" }}>
            {TRENDING_SINGLES.map((track) => (
              <TrendingCard
                key={track.id}
                track={track}
                onPlay={() => dispatch(playTrack({ track, queue: TRENDING_SINGLES }))}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Afrobeat mix for you */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">Afrobeat mix for you</h2>
          <button className="flex items-center gap-1 text-xs text-vibe-text-muted hover:text-white transition-colors">
            Show all
            <span className="text-vibe-red">→</span>
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
    </div>
  )
}

// ── Trending track card ───────────────────────────────────
function TrendingCard({
  track, onPlay,
}: { track: Track; onPlay: () => void }) {
  const { currentTrack, isPlaying } = useAppSelector((s) => s.player)
  const isActive = currentTrack?.id === track.id

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="group shrink-0 w-[160px] md:w-[180px] cursor-pointer"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient + title overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button on hover */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          "opacity-0 group-hover:opacity-100"
        )}>
          <button
            onClick={onPlay}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Play className="h-4 w-4 fill-vibe-onyx text-vibe-onyx ml-0.5" />
          </button>
        </div>

        {/* Active indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-[2px]">
            {[1,2,3].map((i) => (
              <motion.div key={i} className="w-[3px] bg-vibe-red rounded-full"
                animate={{ height: ["4px","12px","6px","10px","4px"] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* Bottom title */}
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
    </motion.div>
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
        {/* 2×2 collage */}
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

        {/* Gradient + label */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
          <p className="font-heading text-sm font-semibold text-white text-center">{category.label}</p>
        </div>
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/0 group-hover:ring-white/10 transition-all" />
      </div>
    </motion.div>
  )
}
