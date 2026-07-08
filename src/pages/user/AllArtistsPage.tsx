import { useNavigate } from "react-router-dom"
import { ArrowLeft, Users } from "lucide-react"
import { useGetAllArtistsQuery, normaliseArtistList } from "@/store/api/vibeApi"
import { ArtistTile } from "@/components/app/ArtistTile"

/**
 * GET /public/artists/all — full artist directory, distinct from the
 * "Popular Artists" show-all page (which is derived from the personalized
 * feed rather than a dedicated endpoint). Same grid/skeleton/empty-state
 * language as PopularArtistsPage for consistency. Clicking an artist goes
 * through ArtistTile, which already links to /artist/:username →
 * GET /public/artists/profile/{username}.
 */
export function AllArtistsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetAllArtistsQuery()
  const artists = normaliseArtistList(data)

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 shrink-0 rounded-full bg-vibe-onyx-300 flex items-center justify-center text-white hover:bg-vibe-onyx-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-white">Artists</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-vibe-onyx-300 animate-pulse" />
              <div className="h-2.5 w-12 rounded bg-vibe-onyx-300 animate-pulse" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-vibe-text-muted">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm">Couldn't load artists</p>
        </div>
      ) : artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-vibe-text-muted">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm">No artists to show yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6">
          {artists.map((artist) => (
            <ArtistTile key={artist.id} artist={artist} className="w-full" />
          ))}
        </div>
      )}
    </div>
  )
}
