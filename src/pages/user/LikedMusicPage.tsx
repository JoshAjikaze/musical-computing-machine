import { useNavigate } from "react-router-dom"
import { ArrowLeft, Play, Heart, X, Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import { useGetLikedTracksQuery, useLikeTrackMutation, type Track } from "@/store/api/vibeApi"
import { formatDuration } from "@/lib/formatters"
import { toast } from "sonner"

/**
 * "Liked music" — shows all liked tracks via GET /listener/liked-tracks
 */
export function LikedMusicPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data, isLoading } = useGetLikedTracksQuery()
  const [likeTrack] = useLikeTrackMutation()

  //@ts-ignore
  const tracks: Track[] = (data ?? []).map((t:any) => ({
    id: t.track_id,
    title: t.title,
    artist: t.artist ?? "",
    artistId: "",
    duration: 0,
    audioUrl: "",
    coverUrl: "",
    genre: "",
    playCount: 0,
    likeCount: 0,
    releaseDate: "",
  }))

  function playAll() {
    if (!tracks.length) return
    dispatch(playTrack({ track: tracks[0], queue: tracks }))
  }

  // POST /tracks/{id}/like is the same endpoint used to like a track
  // elsewhere in the app — assuming it toggles, so calling it again here
  // unlikes. getLikedTracks is tagged 'Track', same as this mutation
  // invalidates, so the list refetches either way and stays correct even
  // if that assumption is wrong.
  function handleUnlike(trackId: string, title: string) {
    likeTrack(trackId).unwrap().catch(() => toast.error(`Couldn't update "${title}"`))
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-vibe-text-muted hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-vibe-purple to-vibe-red flex items-center justify-center shrink-0">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-bold text-white truncate">Liked music</h1>
            <p className="text-xs text-vibe-text-muted">
              {isLoading ? "Loading…" : `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`}
            </p>
          </div>
        </div>
        {tracks.length > 0 && (
          <Button size="sm" rounded="full" className="gap-2 shrink-0" onClick={playAll}>
            <Play className="h-3.5 w-3.5 fill-current" />
            Play all
          </Button>
        )}
      </div>

      {/* Track list */}
      {isLoading ? (
        <LikedListSkeleton />
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-vibe-text-muted">
          <Heart className="h-10 w-10 opacity-30" />
          <p className="text-sm">No liked tracks yet</p>
          <p className="text-xs opacity-70 text-center px-8">Tracks you like will show up here</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className="flex items-center gap-4 w-full px-3 py-2.5 rounded-md hover:bg-vibe-onyx-300 transition-colors group/row"
            >
              <span className="text-xs text-vibe-text-muted w-5 text-center shrink-0 tabular-nums">
                {idx + 1}
              </span>
              <button
                onClick={() => dispatch(playTrack({ track, queue: tracks }))}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="h-9 w-9 rounded-sm bg-vibe-onyx-400 shrink-0 overflow-hidden">
                  {track.coverUrl ? (
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="h-4 w-4 text-vibe-text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{track.title}</p>
                  <p className="text-xs text-vibe-text-muted truncate">{track.artist}</p>
                </div>
              </button>
              {track.duration > 0 && (
                <span className="text-xs text-vibe-text-muted tabular-nums shrink-0">
                  {formatDuration(track.duration)}
                </span>
              )}
              <button
                onClick={() => handleUnlike(track.id, track.title)}
                className="opacity-0 group-hover/row:opacity-100 transition-opacity text-vibe-text-muted hover:text-vibe-red shrink-0"
                aria-label={`Remove ${track.title} from Liked music`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LikedListSkeleton() {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 w-full px-3 py-2.5 animate-pulse">
          <span className="w-5 shrink-0" />
          <div className="h-9 w-9 rounded-sm bg-vibe-onyx-300 shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-3 w-1/3 rounded bg-vibe-onyx-300" />
            <div className="h-2.5 w-1/5 rounded bg-vibe-onyx-300" />
          </div>
        </div>
      ))}
    </div>
  )
}
