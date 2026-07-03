import { useSearchParams } from "react-router-dom"
import { Search, Music2, Users } from "lucide-react"
import { TrackCard } from "@/components/app/TrackCard"
import { ArtistTile } from "@/components/app/ArtistTile"
import { useAppDispatch } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import { useGlobalSearchQuery, normaliseSearchResults } from "@/store/api/vibeApi"

/**
 * GET /explore/search?q= — single results page reused as-is under
 * /listen/search, /app/search, and /admin/search (each shell's
 * HeaderSearchInput routes here with the same ?q= param). Query results
 * are read straight from the URL rather than component state so a refresh
 * or a direct link reproduces the same results — same reasoning as
 * CollectionPage's :section param.
 */
export function SearchResultsPage() {
  const [params] = useSearchParams()
  const dispatch = useAppDispatch()
  const q = (params.get("q") ?? "").trim()

  const { data, isFetching, isError } = useGlobalSearchQuery(q, { skip: !q })
  const { tracks, artists } = normaliseSearchResults(data)
  const hasResults = tracks.length > 0 || artists.length > 0

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-vibe-text-muted px-4">
        <Search className="h-10 w-10 opacity-30" />
        <p className="text-sm">Start typing to search Vibe Garage</p>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6">
      <h1 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">
        Search results
      </h1>
      <p className="text-sm text-vibe-text-muted mb-6 truncate">
        {isFetching ? "Searching…" : `Results for "${q}"`}
      </p>

      {isFetching ? (
        <SearchResultsSkeleton />
      ) : isError ? (
        <EmptyState icon={<Search className="h-10 w-10 opacity-30" />} label="Couldn't load search results" />
      ) : !hasResults ? (
        <EmptyState icon={<Music2 className="h-10 w-10 opacity-30" />} label={`No results for "${q}"`} />
      ) : (
        <div className="space-y-8">
          {artists.length > 0 && (
            <section>
              <h2 className="font-heading text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-vibe-text-muted" />
                Artists
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-vibe">
                {artists.map((artist) => (
                  <ArtistTile key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {tracks.length > 0 && (
            <section>
              <h2 className="font-heading text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Music2 className="h-4 w-4 text-vibe-text-muted" />
                Tracks
              </h2>
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
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-vibe-text-muted">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-14 h-14 rounded-full bg-vibe-onyx-300 animate-pulse" />
            <div className="h-2.5 w-12 rounded bg-vibe-onyx-300 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full">
            <div className="aspect-[3/4] rounded-lg bg-vibe-onyx-300 animate-pulse mb-2" />
            <div className="h-3 w-3/4 rounded bg-vibe-onyx-300 animate-pulse mb-1.5" />
            <div className="h-2.5 w-1/2 rounded bg-vibe-onyx-300 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
