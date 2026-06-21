import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Share2, Play, Pause, Heart, Music2, Disc3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack, togglePlay } from "@/store/slices/playerSlice"
import { useGetPublicTrackQuery, useLikeTrackMutation, normaliseTrack } from "@/store/api/vibeApi"
import { formatPlays, formatDuration } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ShareDialog } from "@/components/app/ShareDialog"

/**
 * Public track landing page — what a shared track link opens to. No login
 * required to view; Play and Like redirect to /login if the visitor isn't
 * signed in (see requireAuth below). Mirrors the auth-gating pattern used
 * in ArtistProfilePage, which has the same public/protected dual-use shape.
 */
export function TrackPage() {
  const { trackId } = useParams<{ trackId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const { currentTrack, isPlaying } = useAppSelector((s) => s.player)
  const [shareOpen, setShareOpen] = useState(false)

  const { data, isLoading, isError } = useGetPublicTrackQuery(trackId ?? "", { skip: !trackId })
  const [likeTrack, { isLoading: isLiking }] = useLikeTrackMutation()

  if (isLoading) return <TrackPageSkeleton />

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-vibe-text-muted px-4">
        <Music2 className="h-12 w-12 opacity-30" />
        <p className="text-sm">This track isn't available</p>
        <button onClick={() => navigate("/")} className="text-xs text-vibe-red underline">
          Go to Vibe Garage
        </button>
      </div>
    )
  }

  const track = normaliseTrack(data)
  const isActive = currentTrack?.id === track.id

  // Same fallback-slug heuristic already used in UserHomePage's ShareDialog
  // wiring — only used when the API doesn't give us an artist_username.
  const artistSlug =
    track.artistUsername ??
    (track.artist ? track.artist.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "") : null)

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      toast.info("Sign in to continue")
      navigate("/login")
      return
    }
    action()
  }

  function handlePlay() {
    requireAuth(() => {
      if (isActive) dispatch(togglePlay())
      else dispatch(playTrack({ track, queue: [track] }))
    })
  }

  async function handleLike() {
    requireAuth(async () => {
      try {
        await likeTrack(track.id).unwrap()
        toast.success("Added to your likes")
      } catch {
        toast.error("Could not like track")
      }
    })
  }

  return (
    <>
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share Track"
        label={track.title}
        sublabel={track.artist || undefined}
        coverUrl={track.coverUrl}
        artistUsername={artistSlug ?? undefined}
        artistId={track.artistId || undefined}
        trackId={track.id}
      />

      <div className="relative min-h-[70vh]">
        {/* Ambient backdrop using the cover art, matches NowPlayingPage's language */}
        {track.coverUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${track.coverUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-vibe-onyx/40 via-vibe-onyx to-vibe-onyx pointer-events-none" />

        <div className="relative px-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex flex-col items-center px-4 pt-8 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-vibe-onyx-300 overflow-hidden shadow-2xl mb-6"
          >
            {track.coverUrl ? (
              <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Disc3 className="h-16 w-16 text-vibe-text-muted opacity-40" />
              </div>
            )}
          </motion.div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white max-w-md truncate">
            {track.title}
          </h1>

          {artistSlug ? (
            <Link
              to={`/artist/${artistSlug}`}
              className="text-sm text-vibe-text-secondary hover:text-white transition-colors mt-1"
            >
              {track.artist}
            </Link>
          ) : (
            <p className="text-sm text-vibe-text-secondary mt-1">{track.artist}</p>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-vibe-text-muted">
            <span>{formatPlays(track.playCount)} plays</span>
            <span className="h-1 w-1 rounded-full bg-vibe-text-muted/50" />
            <span>{formatDuration(track.duration)}</span>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <Button onClick={handlePlay} size="lg" rounded="full" className="min-w-[140px] gap-2">
              {isActive && isPlaying ? (
                <><Pause className="h-4 w-4 fill-white" />Pause</>
              ) : (
                <><Play className="h-4 w-4 fill-white ml-0.5" />Play</>
              )}
            </Button>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "h-11 w-11 rounded-full flex items-center justify-center transition-colors",
                "bg-vibe-onyx-300 text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-400",
                track.isLiked && "text-vibe-red"
              )}
              aria-label="Like track"
            >
              <Heart className={cn("h-4 w-4", track.isLiked && "fill-vibe-red")} />
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="h-11 w-11 rounded-full flex items-center justify-center bg-vibe-onyx-300 text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-400 transition-colors"
              aria-label="Share track"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function TrackPageSkeleton() {
  return (
    <div className="flex flex-col items-center px-4 pt-20 pb-16 animate-pulse">
      <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-vibe-onyx-300 mb-6" />
      <div className="h-6 w-48 rounded bg-vibe-onyx-400 mb-2" />
      <div className="h-4 w-28 rounded bg-vibe-onyx-300 mb-6" />
      <div className="h-11 w-44 rounded-full bg-vibe-onyx-400" />
    </div>
  )
}
