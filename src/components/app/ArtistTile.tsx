import { Link } from "react-router-dom"
import { User } from "lucide-react"
import { cn, slugifyArtistName } from "@/lib/utils"
import type { Track } from "@/store/api/vibeApi"

export interface PopularArtist {
  id: string
  name: string
  /** No dedicated avatar field is available from the feed this is derived
   *  from — falls back to that artist's track cover art. */
  avatarUrl: string
  /** Best-effort slug — see slugifyArtistName(). May not resolve. */
  usernameSlug: string
}

/**
 * Dedupe a track list down to the unique artists behind it, in order of
 * first appearance. Used to make "Popular Artist" reflect the artists
 * whose tracks are actually displayed, rather than a separately-curated
 * list — see UserExplorePage and PopularArtistsPage, which both derive
 * from the same getPersonalizedFeed() result.
 */
export function deriveArtistsFromTracks(tracks: Track[]): PopularArtist[] {
  const seen = new Map<string, PopularArtist>()
  for (const t of tracks) {
    if (!t.artistId || seen.has(t.artistId)) continue
    if (!t.artist || t.artist === "Unknown Artist") continue
    seen.set(t.artistId, {
      id: t.artistId,
      name: t.artist,
      avatarUrl: t.coverUrl,
      usernameSlug: t.artistUsername ?? slugifyArtistName(t.artist),
    })
  }
  return Array.from(seen.values())
}

/**
 * Artist avatar + name, linking to the public artist page. Used by both
 * UserExplorePage's horizontal scroller and PopularArtistsPage's full grid.
 */
export function ArtistTile({ artist, className }: { artist: PopularArtist; className?: string }) {
  return (
    <Link
      to={`/artist/${artist.usernameSlug}`}
      className={cn(
        "shrink-0 flex flex-col items-center gap-2 group transition-transform duration-200 hover:-translate-y-0.5",
        className
      )}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-vibe-onyx-400 group-hover:ring-vibe-red/40 transition-all bg-vibe-onyx-300 flex items-center justify-center shrink-0">
        {artist.avatarUrl ? (
          <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <User className="h-5 w-5 text-vibe-text-muted" />
        )}
      </div>
      <p className="text-xs text-vibe-text-secondary text-center leading-tight w-16 truncate group-hover:text-white transition-colors">
        {artist.name}
      </p>
    </Link>
  )
}
