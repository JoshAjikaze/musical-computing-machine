import { useNavigate } from "react-router-dom"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import {
  type NEW_RELEASES, vibeApi, type Track, normaliseNewRelease,
} from "@/store/api/vibeApi"
import { TrackCard } from "@/components/app/TrackCard"
import { AfrobeatCard } from "@/components/app/AfrobeatCard"
import { GetVCoinsButton } from "@/components/app/GetVCoinsButton"
import { AFROBEAT_CATEGORIES } from "@/data/afrobeatCategories"

// ── Page ─────────────────────────────────────────────────
export function UserHomePage() {
  const dispatch = useAppDispatch()
  const navigate  = useNavigate()
  const { user } = useAppSelector((s) => s.auth)
  const displayName = user?.displayName ?? "Desire"

  const { data: trendingRaw, isLoading: trendingLoading } =
    vibeApi.useGetDiscoveryTrendingQuery({ limit: 10 })

  const trendingTracks: Track[] = (trendingRaw ?? []).map((t: NEW_RELEASES) =>
    normaliseNewRelease(t)
  )

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
        <GetVCoinsButton />
      </div>

      {/* Trending singles — live from API */}
      <TrackSection
        title="Trending singles"
        tracks={trendingTracks}
        isLoading={trendingLoading}
        queue={trendingTracks}
        onShowAll={() => navigate("/listen/collection/trending")}
      />

      {/* Afrobeat mix */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">Mixes for you</h2>
          <button
            onClick={() => navigate("/listen/afrobeat-mixes")}
            className="flex items-center gap-1 text-xs text-vibe-text-muted hover:text-white transition-colors"
          >
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
        onShowAll={() => navigate("/listen/collection/new-releases")}
      />
    </div>
  )

  function TrackSection({
    title, tracks, isLoading, queue, hideWhenEmpty, onShowAll,
  }: {
    title: string
    tracks: Track[]
    isLoading: boolean
    queue: Track[]
    hideWhenEmpty?: boolean
    onShowAll: () => void
  }) {
    if (hideWhenEmpty && !isLoading && tracks.length === 0) return null

    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onShowAll}
            className="flex items-center gap-1 text-xs text-vibe-text-muted hover:text-white transition-colors"
          >
            Show all <span className="text-vibe-red">→</span>
          </button>
        </div>

        {isLoading ? (
          <TrackSkeletons />
        ) : (
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex gap-4 pb-3" style={{ scrollSnapType: "x mandatory" }}>
              {tracks.map((track) => (
                <TrackCard
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
