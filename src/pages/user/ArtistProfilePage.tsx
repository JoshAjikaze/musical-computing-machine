import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft, Share2, CheckCircle2, Music2, Play,
  Headphones, Disc3, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack, togglePlay } from "@/store/slices/playerSlice"
import {
  useGetArtistProfileQuery,
  useFollowArtistMutation,
  useGetFollowStatusQuery,
} from "@/store/api/vibeApi"
import { assetUrl, cn } from "@/lib/utils"
import { formatDuration } from "@/lib/formatters"
import { toast } from "sonner"
import { ShareDialog } from "@/components/app/ShareDialog"

/**
 * Public-facing artist profile — viewed by listeners navigating from a
 * track card or a shared link. "Edit Profile" is intentionally absent here;
 * that action lives in the artist's own /app/profile dashboard, not on a
 * page that any listener can open.
 */
export function ArtistProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const { currentTrack, isPlaying } = useAppSelector((s) => s.player)

  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null)
  const [shareOpen, setShareOpen] = useState(false)

  const { data: profile, isLoading, isError } =
    useGetArtistProfileQuery(username ?? "", { skip: !username })

  const artistId = profile?.id
  // GET /public/artists/artist/{username}/follow-status → { isfollowed }.
  // Source of truth for the button's state, so it no longer resets on
  // refresh. Keyed by username — a different identifier than the follow
  // toggle below, which takes artist_id (see NOTE in vibeApi.ts).
  const { data: followStatus } = useGetFollowStatusQuery(username ?? "", { skip: !username })
  const [followArtist, { isLoading: isTogglingFollow }] = useFollowArtistMutation()

  // Clear the optimistic overlay once the real status catches up (either
  // confirming it or, on failure, reverting to what the server actually has).
  useEffect(() => { setOptimisticFollowing(null) }, [followStatus?.isfollowed])

  const following = optimisticFollowing ?? followStatus?.isfollowed ?? false

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      toast.info("Sign in to continue")
      navigate("/login")
      return
    }
    action()
  }

  async function handleFollow() {
    if (!artistId) return
    requireAuth(async () => {
      const next = !following
      // Optimistic flip for instant feedback; the effect above clears this
      // once getFollowStatus re-fetches (triggered by invalidatesTags).
      setOptimisticFollowing(next)
      try {
        await followArtist(artistId).unwrap()
      } catch {
        setOptimisticFollowing(!next)
        toast.error(next ? "Could not follow artist" : "Could not unfollow artist")
      }
    })
  }

  if (isLoading) return <ArtistProfileSkeleton />

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-vibe-text-muted">
        <Music2 className="h-12 w-12 opacity-30" />
        <p className="text-sm">Artist profile not found</p>
        <button onClick={() => navigate(-1)} className="text-xs text-vibe-red underline">
          Go back
        </button>
      </div>
    )
  }

  const displayName = (profile.stage_name?.trim() || profile.username?.trim() || "Artist").toString()
  const artistUsername = profile.username?.trim() || ""
  const avatarUrl = profile.avatar && !String(profile.avatar).includes("default-avatar")
    ? assetUrl(profile.avatar)
    : null
  const tracks = Array.isArray(profile.tracks) ? profile.tracks : []
  const stats = profile.stats ?? { total_streams: 0, track_count: 0 }

  function playAll() {
    if (!tracks.length) return
    requireAuth(() => {
      const queue = tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: displayName,
        artistId: profile?.id ?? "",
        artistUsername: artistUsername,
        coverUrl: assetUrl(t.cover_art),
        audioUrl: "",
        duration: t.duration,
        genre: "",
        playCount: 0,
        likeCount: 0,
        releaseDate: "",
      }))
      dispatch(playTrack({ track: queue[0], queue }))
    })
  }

  function playOne(track: (typeof tracks)[number]) {
    requireAuth(() => {
      const t = {
        id: track.id,
        title: track.title,
        artist: displayName,
        artistId: profile?.id ?? "",
        artistUsername: artistUsername,
        coverUrl: assetUrl(track.cover_art),
        audioUrl: "",
        duration: track.duration,
        genre: "",
        playCount: 0,
        likeCount: 0,
        releaseDate: "",
      }
      if (currentTrack?.id === track.id) dispatch(togglePlay())
      else dispatch(playTrack({ track: t, queue: [t] }))
    })
  }

  return (
    <div className="pb-8">
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share Artist"
        label={displayName}
        sublabel={`@${artistUsername}`}
        coverUrl={avatarUrl ?? undefined}
        artistId={profile.id}
        artistUsername={artistUsername}
      />

      <div className="relative h-48 md:h-64 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-vibe-onyx-200 via-vibe-onyx-300 to-black" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-vibe-onyx" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 -mt-12 relative z-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div className="relative shrink-0">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-vibe-onyx bg-vibe-onyx-300 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-heading text-3xl font-bold text-white">
                    {displayName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {profile.is_verified && (
              <CheckCircle2 className="absolute bottom-1 right-1 h-5 w-5 text-vibe-red fill-white" />
            )}
          </div>

          <div className="flex items-center gap-2 pb-1">
            <Button
              size="sm"
              rounded="full"
              variant={following ? "outline" : "default"}
              onClick={handleFollow}
              loading={isTogglingFollow}
              className="min-w-[90px]"
            >
              {following ? "Following" : "Follow"}
            </Button>
            {tracks.length > 0 && (
              <button
                onClick={playAll}
                className="h-10 w-10 rounded-full bg-vibe-red flex items-center justify-center shadow-lg hover:bg-vibe-red/90 active:scale-95 transition-all"
                aria-label="Play all"
              >
                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-heading text-2xl font-bold text-white">{displayName}</h1>
            {profile.is_verified && (
              <CheckCircle2 className="h-4 w-4 text-vibe-red shrink-0" />
            )}
          </div>
          <p className="text-sm text-vibe-text-muted mb-4">@{artistUsername}</p>

          <div className="flex items-center gap-6 flex-wrap">
            <StatPill icon={<Headphones className="h-3.5 w-3.5" />} label="Streams" value={stats.total_streams} />
            <StatPill icon={<Disc3 className="h-3.5 w-3.5" />} label="Tracks" value={stats.track_count} />
            {profile.joined_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-vibe-text-muted" />
                <span className="text-xs text-vibe-text-muted">Joined {profile.joined_date}</span>
              </div>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-vibe-text-secondary leading-relaxed mb-6 max-w-xl">
            {profile.bio}
          </p>
        )}

        <div className="border-b border-vibe-onyx-400 mb-5 pb-1">
          <h2 className="font-heading text-sm font-semibold text-white px-1">Tracks</h2>
        </div>

        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-vibe-text-muted">
            <Music2 className="h-10 w-10 opacity-25" />
            <p className="text-sm">No tracks yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {tracks.map((track, idx) => {
              const isActive = currentTrack?.id === track.id
              const isNowPlaying = isActive && isPlaying
              return (
                <button
                  key={track.id}
                  onClick={() => playOne(track)}
                  className={cn(
                    "flex items-center gap-4 w-full px-3 py-2.5 rounded-md transition-colors group text-left",
                    isActive ? "bg-vibe-red/10 hover:bg-vibe-red/15" : "hover:bg-vibe-onyx-300"
                  )}
                >
                  <span className={cn(
                    "text-xs w-5 text-center shrink-0 tabular-nums",
                    isActive ? "text-vibe-red" : "text-vibe-text-muted"
                  )}>
                    {isNowPlaying ? (
                      <span className="inline-flex gap-[2px] items-end h-3">
                        {[1, 2, 3].map((i) => (
                          <motion.span
                            key={i}
                            className="inline-block w-[2px] bg-vibe-red rounded-full"
                            animate={{ height: ["3px", "9px", "4px", "7px", "3px"] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </span>
                    ) : idx + 1}
                  </span>

                  <div className="h-9 w-9 rounded-sm bg-vibe-onyx-400 shrink-0 overflow-hidden">
                    {track.cover_art ? (
                      <img src={assetUrl(track.cover_art)} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="h-4 w-4 text-vibe-text-muted" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-vibe-red" : "text-white"
                    )}>
                      {track.title}
                    </p>
                    <p className="text-xs text-vibe-text-muted truncate">{displayName}</p>
                  </div>

                  <span className="text-xs text-vibe-text-muted tabular-nums shrink-0">
                    {track.duration > 0 ? formatDuration(track.duration) : "—"}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────
function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value?: number | null }) {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
        : n.toString()
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-vibe-text-muted">{icon}</span>
      <span className="text-sm font-semibold text-white">{fmt(safeValue)}</span>
      <span className="text-xs text-vibe-text-muted">{label}</span>
    </div>
  )
}

function ArtistProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 md:h-64 bg-vibe-onyx-300" />
      <div className="px-4 md:px-8 -mt-12 relative z-10">
        <div className="flex items-end justify-between mb-5">
          <div className="h-24 w-24 rounded-full bg-vibe-onyx-400 border-4 border-vibe-onyx" />
          <div className="h-9 w-24 rounded-full bg-vibe-onyx-400 mb-1" />
        </div>
        <div className="h-6 w-44 rounded bg-vibe-onyx-400 mb-2" />
        <div className="h-4 w-28 rounded bg-vibe-onyx-300 mb-5" />
        <div className="flex gap-6 mb-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-4 w-20 rounded bg-vibe-onyx-300" />)}
        </div>
        <div className="space-y-3 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center px-3">
              <div className="h-3 w-4 rounded bg-vibe-onyx-400" />
              <div className="h-9 w-9 rounded-sm bg-vibe-onyx-400" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 rounded bg-vibe-onyx-400" />
                <div className="h-3 w-20 rounded bg-vibe-onyx-300" />
              </div>
              <div className="h-3 w-8 rounded bg-vibe-onyx-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
