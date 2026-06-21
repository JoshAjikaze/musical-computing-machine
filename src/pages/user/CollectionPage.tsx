import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Play, Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrackCard } from "@/components/app/TrackCard"
import { useAppDispatch } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import { vibeApi, type NEW_RELEASES, type Track, normaliseNewRelease } from "@/store/api/vibeApi"

/**
 * "Show all" destination for UserHomePage's Trending Singles and New
 * Releases sections — one reusable page, the dataset is picked by the
 * :section route param rather than by which button was clicked.
 *
 * A route param (not router/location state) on purpose: state disappears
 * on refresh or a direct link, a URL doesn't. See chat history for the
 * fuller reasoning.
 *
 * RTK Query generates one hook per endpoint, so we can't pick a hook at
 * runtime — both are called unconditionally below, each gated with `skip`
 * so only the one matching the current section actually fires.
 */
type SectionKey = "trending" | "new-releases"

const SECTION_META: Record<SectionKey, { title: string }> = {
  "trending":     { title: "Trending Singles" },
  "new-releases": { title: "New Releases" },
}

const PAGE_LIMIT = 50

export function CollectionPage() {
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const key: SectionKey | undefined =
    section === "trending" || section === "new-releases" ? section : undefined

  const trendingQuery = vibeApi.useGetDiscoveryTrendingQuery(
    { limit: PAGE_LIMIT },
    { skip: key !== "trending" }
  )
  const newReleasesQuery = vibeApi.useGetNewReleasesQuery(
    { limit: PAGE_LIMIT },
    { skip: key !== "new-releases" }
  )

  const { tracks, isLoading } = (() => {
    if (key === "trending") {
      return {
        tracks: (trendingQuery.data ?? []).map((t: NEW_RELEASES) => normaliseNewRelease(t)),
        isLoading: trendingQuery.isLoading,
      }
    }
    if (key === "new-releases") {
      return {
        tracks: (newReleasesQuery.data ?? []).map((t: NEW_RELEASES) => normaliseNewRelease(t)),
        isLoading: newReleasesQuery.isLoading,
      }
    }
    return { tracks: [] as Track[], isLoading: false }
  })()

  if (!key) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-vibe-text-muted px-4">
        <Music2 className="h-12 w-12 opacity-30" />
        <p className="text-sm">Unknown collection</p>
        <button onClick={() => navigate("/listen")} className="text-xs text-vibe-red underline">
          Back to Home
        </button>
      </div>
    )
  }

  const title = SECTION_META[key].title

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 shrink-0 rounded-full bg-vibe-onyx-300 flex items-center justify-center text-white hover:bg-vibe-onyx-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-white">{title}</h1>
      </div>

      {!isLoading && tracks.length > 0 && (
        <Button
          onClick={() => dispatch(playTrack({ track: tracks[0], queue: tracks }))}
          rounded="full"
          className="gap-2 mb-6"
        >
          <Play className="h-4 w-4 fill-white ml-0.5" />
          Play all
        </Button>
      )}

      {isLoading ? (
        <CollectionGridSkeleton />
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-vibe-text-muted">
          <Music2 className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nothing here yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              className="w-full"
              onPlay={() => dispatch(playTrack({ track, queue: tracks }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CollectionGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="w-full">
          <div className="aspect-[3/4] rounded-lg bg-vibe-onyx-300 animate-pulse mb-2" />
          <div className="h-3 w-3/4 rounded bg-vibe-onyx-300 animate-pulse mb-1.5" />
          <div className="h-2.5 w-1/2 rounded bg-vibe-onyx-300 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
