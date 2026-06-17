import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Share2, CheckCircle2, Music2, Play,
  MoreVertical, Users, Headphones, Disc3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import {
  useGetArtistProfileQuery,
  useFollowArtistMutation,
  normaliseTrack,
  type ArtistProfileOut,
} from "@/store/api/vibeApi"
import { assetUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ShareDialog } from "@/components/app/ShareDialog"

type Tab = "top_tracks" | "albums"

export function ArtistProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)

  const [tab, setTab]         = useState<Tab>("top_tracks")
  const [following, setFollowing] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const { data: profile, isLoading, isError } =
    useGetArtistProfileQuery(username ?? "", { skip: !username })

  const [followArtist, { isLoading: isFollowing }] = useFollowArtistMutation()

  const isOwnProfile = user?.username === username

  async function handleFollow() {
    if (!profile?.id) return
    try {
      await followArtist(profile.id).unwrap()
      setFollowing((v) => !v)
    } catch {
      toast.error("Could not follow artist")
    }
  }

  if (isLoading) return <ArtistProfileSkeleton />
  if (isError || !profile) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-vibe-text-muted">
      <Music2 className="h-12 w-12 opacity-30" />
      <p className="text-sm">Artist profile not found</p>
      <button onClick={() => navigate(-1)} className="text-xs text-vibe-red underline">Go back</button>
    </div>
  )

  const topTracks = (profile.top_tracks ?? []).map((t) => normaliseTrack(t))
  const albums    = profile.albums ?? []

  return (
    <>
    <ShareDialog
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      title="Share Artist"
      label={profile.display_name ?? profile.stage_name ?? profile.username}
      sublabel={`@${profile.username}`}
      coverUrl={profile.avatar_url ? assetUrl(profile.avatar_url) : undefined}
      artistUsername={profile.username}
    />
    <div className="pb-8">
      {/* ── Hero / Banner ── */}
      <div className="relative h-56 md:h-72 bg-vibe-onyx-300 overflow-hidden">
        {profile.banner_url ? (
          <img
            src={assetUrl(profile.banner_url)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          // Gradient fallback matching brand palette
          <div className="w-full h-full bg-gradient-to-br from-vibe-onyx-200 via-vibe-onyx-300 to-black" />
        )}
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-vibe-onyx" />

        {/* Top bar actions */}
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

      {/* ── Profile info row ── */}
      <div className="px-4 md:px-8 -mt-12 relative z-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-vibe-onyx bg-vibe-onyx-300 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={assetUrl(profile.avatar_url)}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-heading text-3xl font-bold text-white">
                    {(profile.display_name ?? profile.username ?? "?").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {profile.is_verified && (
              <CheckCircle2 className="absolute bottom-1 right-1 h-5 w-5 text-vibe-red fill-white" />
            )}
          </div>

          {/* Follow / Edit CTA */}
          <div className="flex items-center gap-2 pb-1">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" rounded="full">
                Edit profile
              </Button>
            ) : (
              <Button
                size="sm"
                rounded="full"
                variant={following ? "outline" : "default"}
                onClick={handleFollow}
                loading={isFollowing}
                className="min-w-[100px]"
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}
            {/* Play all button */}
            {topTracks.length > 0 && (
              <button
                onClick={() => dispatch(playTrack({ track: topTracks[0], queue: topTracks }))}
                className="h-10 w-10 rounded-full bg-vibe-red flex items-center justify-center shadow-lg hover:bg-vibe-red/90 active:scale-95 transition-all"
              >
                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Name + stats */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-heading text-2xl font-bold text-white">
              {profile.display_name ?? profile.stage_name ?? profile.username}
            </h1>
            {profile.is_verified && (
              <CheckCircle2 className="h-4 w-4 text-vibe-red shrink-0" />
            )}
          </div>
          <p className="text-sm text-vibe-text-muted mb-4">@{profile.username}</p>

          {/* Stats row */}
          <div className="flex items-center gap-6 flex-wrap">
            <StatPill icon={<Users className="h-3.5 w-3.5" />}
              label="Followers" value={profile.followers ?? 0} />
            <StatPill icon={<Headphones className="h-3.5 w-3.5" />}
              label="Streams"   value={profile.total_plays ?? 0} />
            <StatPill icon={<Disc3 className="h-3.5 w-3.5" />}
              label="Tracks"    value={profile.total_tracks ?? 0} />
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-vibe-text-secondary leading-relaxed mb-6 max-w-xl">
            {profile.bio}
          </p>
        )}

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 border-b border-vibe-onyx-400 mb-5">
          {(["top_tracks", "albums"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors relative",
                tab === t
                  ? "text-white"
                  : "text-vibe-text-muted hover:text-vibe-text-secondary"
              )}
            >
              {t === "top_tracks" ? "Top Tracks" : "Albums"}
              {tab === t && (
                <motion.div
                  layoutId="artist-profile-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibe-red rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          {tab === "top_tracks" ? (
            <motion.div
              key="tracks"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {topTracks.length === 0 ? (
                <EmptyState label="No tracks yet" />
              ) : (
                <div className="space-y-0.5">
                  {topTracks.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      rank={idx + 1}
                      track={track}
                      onPlay={() => dispatch(playTrack({ track, queue: topTracks }))}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="albums"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {albums.length === 0 ? (
                <EmptyState label="No albums yet" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
    return n.toString()
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-vibe-text-muted">{icon}</span>
      <span className="text-sm font-semibold text-white">{fmt(value)}</span>
      <span className="text-xs text-vibe-text-muted">{label}</span>
    </div>
  )
}

function TrackRow({
  rank, track, onPlay,
}: {
  rank: number
  track: ReturnType<typeof normaliseTrack>
  onPlay: () => void
}) {
  const { currentTrack, isPlaying } = useAppSelector((s) => s.player)
  const isActive = currentTrack?.id === track.id

  return (
    <button
      onClick={onPlay}
      className="flex items-center gap-4 w-full px-3 py-2.5 rounded-md hover:bg-vibe-onyx-300 transition-colors group text-left"
    >
      <span className={cn("text-xs w-5 text-center shrink-0 tabular-nums",
        isActive ? "text-vibe-red" : "text-vibe-text-muted")}
      >
        {isActive && isPlaying ? (
          <span className="inline-flex gap-[2px] items-end h-3">
            {[1,2,3].map((i) => (
              <motion.span key={i} className="inline-block w-[2px] bg-vibe-red rounded-full"
                animate={{ height: ["3px","9px","4px","7px","3px"] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i*0.15 }}
              />
            ))}
          </span>
        ) : rank}
      </span>

      <div className="h-9 w-9 rounded-sm bg-vibe-onyx-400 shrink-0 overflow-hidden">
        {track.coverUrl
          ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          : <Music2 className="h-4 w-4 text-vibe-text-muted m-auto mt-2.5" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate",
          isActive ? "text-vibe-red" : "text-white")}>{track.title}</p>
        <p className="text-xs text-vibe-text-muted truncate">{track.artist}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-vibe-text-muted tabular-nums hidden sm:block">
          {track.playCount > 0
            ? track.playCount >= 1_000_000
              ? `${(track.playCount/1_000_000).toFixed(1)}M`
              : track.playCount >= 1_000
                ? `${(track.playCount/1_000).toFixed(0)}K`
                : track.playCount
            : "—"
          }
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-vibe-text-muted hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </button>
  )
}

function AlbumCard({ album }: { album: NonNullable<ArtistProfileOut["albums"]>[0] }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square rounded-lg bg-vibe-onyx-400 overflow-hidden mb-2">
        {album.cover_path ? (
          <img
            src={assetUrl(album.cover_path)}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="h-10 w-10 text-vibe-text-muted opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <p className="absolute bottom-2 left-2 right-2 font-heading text-sm font-bold text-white uppercase tracking-wide truncate">
          {album.title}
        </p>
      </div>
      <p className="text-xs text-vibe-text-muted">{album.track_count} tracks</p>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-vibe-text-muted">
      <Music2 className="h-10 w-10 opacity-25" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

function ArtistProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 md:h-72 bg-vibe-onyx-300" />
      <div className="px-4 md:px-8 -mt-12 relative z-10">
        <div className="flex items-end justify-between mb-5">
          <div className="h-24 w-24 rounded-full bg-vibe-onyx-400 border-4 border-vibe-onyx" />
          <div className="h-9 w-24 rounded-full bg-vibe-onyx-400" />
        </div>
        <div className="h-6 w-48 rounded bg-vibe-onyx-400 mb-2" />
        <div className="h-4 w-24 rounded bg-vibe-onyx-300 mb-5" />
        <div className="flex gap-6 mb-6">
          {[1,2,3].map((i) => <div key={i} className="h-4 w-20 rounded bg-vibe-onyx-300" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="h-9 w-9 rounded-sm bg-vibe-onyx-400" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 rounded bg-vibe-onyx-400" />
                <div className="h-3 w-24 rounded bg-vibe-onyx-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
