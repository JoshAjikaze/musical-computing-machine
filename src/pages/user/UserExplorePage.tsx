import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Play, Heart, Music2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import { vibeApi, type Track, normaliseTrack } from "@/store/api/vibeApi"
import { ArtistTile, deriveArtistsFromTracks } from "@/components/app/ArtistTile"
import { AdSlot } from "@/components/app/AdSlot"
import { GetVCoinsButton } from "@/components/app/GetVCoinsButton"
import { formatPlays } from "@/lib/formatters"
import { cn } from "@/lib/utils"

// ── Mock data ─────────────────────────────────────────────
// Browse Categories is a filter UI only — the feed endpoint doesn't return
// a genre field, so there's nothing live to filter by yet. Left as-is.
const CATEGORIES = ["All", "Gospel", "HIP-HOP/Rap", "Pop", "Rock", "Jazz", "Afro beats", "R/B Soul"]

const POPULAR_ARTISTS_PREVIEW_LIMIT = 12

export function UserExplorePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [activeCategory, setActiveCategory] = useState("All")
  const [featuredIdx, setFeaturedIdx]       = useState(0)
  const [liked, setLiked]                   = useState(false)

  // Single source of truth for "tracks displayed" on this page — both the
  // Featured carousel and Popular Artist (derived below) read from this,
  // so "popular artists" always matches the artists actually shown here.
  const { data: feedRaw, isLoading } = vibeApi.useGetPersonalizedFeedQuery()
  const tracksDisplayed: Track[] = (feedRaw ?? []).map((t) => normaliseTrack(t))

  const popularArtists = deriveArtistsFromTracks(tracksDisplayed)
  const popularArtistsPreview = popularArtists.slice(0, POPULAR_ARTISTS_PREVIEW_LIMIT)

  // Auto-advance carousel every 4s
  useEffect(() => {
    if (tracksDisplayed.length < 2) return
    const id = setInterval(() => {
      setFeaturedIdx((i) => (i + 1) % tracksDisplayed.length)
    }, 4000)
    return () => clearInterval(id)
  }, [tracksDisplayed.length])

  // Clamp in case the list shrinks (e.g. a refetch returns fewer items)
  const featured = tracksDisplayed[featuredIdx] ?? tracksDisplayed[0]

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Explore</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">
            You might want to check out these artists
          </p>
        </div>
        <GetVCoinsButton />
      </div>

      {/* Browse Categories */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-4">
        <p className="text-xs font-medium text-vibe-text-muted mb-3">Browse Categories</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors duration-150",
                activeCategory === cat
                  ? "border-vibe-text-secondary bg-vibe-onyx-400 text-white"
                  : "border-vibe-onyx-400 bg-transparent text-vibe-text-secondary hover:border-vibe-text-muted hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured — live from the personalized feed */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5 overflow-hidden">
        <div className="flex items-start justify-between gap-2 mb-4">
          <span className="text-xs font-medium text-vibe-text-muted uppercase tracking-wider">Featured</span>
          {/* Dot navigation */}
          {tracksDisplayed.length > 1 && (
            <div className="flex items-center gap-1.5">
              {tracksDisplayed.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIdx(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    featuredIdx === i
                      ? "w-4 h-2 bg-white"
                      : "w-2 h-2 bg-vibe-onyx-400 hover:bg-vibe-text-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <FeaturedSkeleton />
        ) : !featured ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-vibe-text-muted">
            <Music2 className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nothing to explore yet</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={featured.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-6"
            >
              {/* Text side */}
              <div className="flex-1 min-w-0 space-y-2">
                <h2 className="font-display text-4xl text-white leading-none truncate">{featured.title}</h2>
                <p className="text-sm text-vibe-text-secondary">
                  {featured.artist ? <>{featured.artist} &nbsp;·&nbsp; </> : null}
                  {formatPlays(featured.playCount)} plays
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    size="sm"
                    rounded="full"
                    className="gap-2 px-5"
                    onClick={() => dispatch(playTrack({ track: featured, queue: tracksDisplayed }))}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Play now
                  </Button>
                  <button
                    onClick={() => setLiked((v) => !v)}
                    className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
                      liked
                        ? "border-vibe-red bg-vibe-red/10 text-vibe-red"
                        : "border-vibe-onyx-400 bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:border-vibe-text-muted"
                    )}
                  >
                    <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                  </button>
                </div>
              </div>

              {/* Cover art */}
              <div className="shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-lg overflow-hidden bg-vibe-onyx-300">
                {featured.coverUrl && (
                  <img
                    src={featured.coverUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Example ad placement — deliberately between content sections, well
          away from PlayerBar/QueuePanel/NowPlayingSidebar to avoid
          accidental-click layouts AdSense's policy flags. Renders nothing
          until VITE_ADSENSE_PUBLISHER_ID is set (see lib/adsense.ts).
          NOTE: "0000000000" is a placeholder — swap in a real ad unit's
          data-ad-slot ID from the AdSense dashboard once one exists. */}
      <AdSlot slot="0000000000" className="my-2" />

      {/* Popular Artists — derived from the same tracksDisplayed above */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">Popular Artist</h2>
          {popularArtists.length > 0 && (
            <button
              onClick={() => navigate("/listen/popular-artists")}
              className="text-xs text-vibe-text-muted hover:text-white transition-colors"
            >
              Show all
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-vibe-onyx-300 animate-pulse" />
                <div className="h-2.5 w-12 rounded bg-vibe-onyx-300 animate-pulse" />
              </div>
            ))}
          </div>
        ) : popularArtistsPreview.length === 0 ? (
          <p className="text-sm text-vibe-text-muted py-4">No artists to show yet</p>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
            {popularArtistsPreview.map((artist) => (
              <ArtistTile key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function FeaturedSkeleton() {
  return (
    <div className="flex items-center gap-6 animate-pulse">
      <div className="flex-1 min-w-0 space-y-3">
        <div className="h-9 w-2/3 rounded bg-vibe-onyx-300" />
        <div className="h-4 w-1/3 rounded bg-vibe-onyx-300" />
        <div className="h-9 w-32 rounded-full bg-vibe-onyx-300 mt-3" />
      </div>
      <div className="shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-lg bg-vibe-onyx-300" />
    </div>
  )
}
