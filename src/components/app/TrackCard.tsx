import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Play, MoreHorizontal, Heart, Plus, ListMusic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { addToQueue } from "@/store/slices/playerSlice"
import { addTrackToPlaylist } from "@/store/slices/playlistSlice"
import {
  type Track,
  useAddTrackToPlaylistApiMutation, useLikeTrackMutation, useGetLikedTracksQuery,
} from "@/store/api/vibeApi"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ShareDialog } from "@/components/app/ShareDialog"

type TrackMenuAction =
  | { type: "add_to_playlist"; playlistId: string; playlistName: string }
  | { type: "add_to_queue" }
  | { type: "add_to_favourites" }
  | { type: "share" }
  | { type: "view_artist"; artistId: string }

/**
 * Track card with the full context menu (queue, favourite, add-to-playlist,
 * share, view artist) — used anywhere a grid or horizontal scroller of
 * tracks is needed: UserHomePage's sections and CollectionPage's "show all"
 * grid both render this. Extracted from what used to be UserHomePage's
 * private TrendingCard so the two don't duplicate ~150 lines of menu logic.
 *
 * `className` lets callers override sizing — default is the fixed width the
 * home page's horizontal scrollers expect; CollectionPage passes "w-full"
 * so the card fills its CSS grid cell instead.
 */
export function TrackCard({
  track,
  onPlay,
  className,
}: {
  track: Track
  onPlay: () => void
  className?: string
}) {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const { currentTrack, isPlaying } = useAppSelector((s) => s.player)
  const playlists = useAppSelector((s) => s.playlists.playlists)
  const isActive  = currentTrack?.id === track.id

  const [menuOpen, setMenuOpen]   = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const menuRef                   = useRef<HTMLDivElement>(null)

  const [addTrackApi]            = useAddTrackToPlaylistApiMutation()
  const [likeTrack]              = useLikeTrackMutation()
  const { data: likedTracksRaw } = useGetLikedTracksQuery()

  // Derive liked state from the server response so it's always accurate
  const likedIds = new Set(
    Array.isArray(likedTracksRaw)
      ? (likedTracksRaw as { id?: string; track_id?: string }[]).map((t) => t.id ?? t.track_id ?? "")
      : []
  )
  const isLiked = likedIds.has(track.id) || !!track.isLiked

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [menuOpen])

  async function handleLike() {
    try {
      await likeTrack(track.id).unwrap()
      toast.success(isLiked ? "Removed from favourites" : "Added to favourites")
    } catch {
      toast.error("Could not update favourites")
    }
  }

  function handleAction(action: TrackMenuAction) {
    setMenuOpen(false)
    switch (action.type) {
      case "add_to_queue":
        dispatch(addToQueue(track))
        toast.success(`Added "${track.title}" to queue`)
        break
      case "add_to_favourites":
        handleLike()
        break
      case "add_to_playlist":
        dispatch(addTrackToPlaylist({ playlistId: action.playlistId, track }))
        addTrackApi({ playlist_id: action.playlistId, track_id: track.id })
          .unwrap()
          .then(() => toast.success(`Added to "${action.playlistName}"`))
          .catch(() => toast.error(`Couldn't add to "${action.playlistName}"`))
        break
      case "share":
        setShareOpen(true)
        break
      case "view_artist": {
        // Prefer the real username slug — the artist profile page calls
        // GET /public/artists/{username} which only accepts usernames, not
        // UUIDs. artistId is kept as a last resort (it may not resolve, but
        // it's better than navigating nowhere at all).
        const dest = track.artistUsername ?? track.artistId
        if (dest) navigate(`/listen/artist/${dest}`)
        break
      }
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      // onClick on the wrapper makes the whole card tappable on mobile where
      // the hover-overlay play button is never visible. The play button and
      // the ellipsis inside both call e.stopPropagation() so they still fire
      // their own handlers on desktop without also triggering this.
      onClick={onPlay}
      className={cn("group/card relative shrink-0 w-[160px] md:w-[180px] cursor-pointer", className)}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-vibe-onyx-300" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Hover overlay with play + ellipsis */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-200",
          "opacity-0 group-hover/card:opacity-100"
        )}>
          {/* Play button — centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); onPlay() }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Play className="h-4 w-4 fill-vibe-onyx text-vibe-onyx ml-0.5" />
            </button>
          </div>

          {/* Ellipsis — top right. Always visible on touch (no hover), positioned
              at top-right so it doesn't overlap the play area. stopPropagation
              prevents the card-level onClick from also firing. */}
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover/card:opacity-100 active:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {/* Like indicator */}
          {isLiked && (
            <div className="absolute top-2 left-2">
              <Heart className="h-3.5 w-3.5 text-vibe-red fill-vibe-red" />
            </div>
          )}
        </div>

        {/* Equaliser animation when playing */}
        {isActive && isPlaying && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-[2px] pointer-events-none">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} className="w-[3px] bg-vibe-red rounded-full"
                animate={{ height: ["4px", "12px", "6px", "10px", "4px"] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Below-card row: title + artist + persistent menu button (touch-friendly) */}
      <div className="flex items-start justify-between gap-1 px-0.5">
        <div className="min-w-0">
          <p className={cn(
            "font-heading text-xs font-bold uppercase tracking-wide truncate",
            isActive ? "text-vibe-red" : "text-white"
          )}>
            {track.title}
          </p>
          <p className="text-[10px] text-vibe-text-muted truncate mt-0.5">{track.artist}</p>
        </div>
        {/* Ellipsis outside the card image — always tappable on mobile.
            The one inside the image is hover-only on desktop; this one is
            the persistent fallback for touch. */}
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-vibe-text-muted hover:text-white transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.13 }}
            className={cn(
              "absolute right-0 top-2 z-50",
              "w-52 bg-vibe-onyx-100 border border-vibe-onyx-400 rounded-xl shadow-2xl",
              "py-1.5 overflow-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Track summary */}
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-vibe-onyx-400 mb-1">
              {track.coverUrl && (
                <img src={track.coverUrl} alt={track.title} className="h-7 w-7 rounded-sm object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{track.title}</p>
                <p className="text-[10px] text-vibe-text-muted truncate">{track.artist}</p>
              </div>
            </div>

            <MenuItem
              icon={<Heart className={cn("h-3.5 w-3.5", isLiked && "fill-vibe-red text-vibe-red")} />}
              label={isLiked ? "Remove from favourites" : "Add to favourites"}
              onClick={() => handleAction({ type: "add_to_favourites" })}
            />
            <MenuItem
              icon={<ListMusic className="h-3.5 w-3.5" />}
              label="Add to queue"
              onClick={() => handleAction({ type: "add_to_queue" })}
            />

            {/* Add to playlist sub-section */}
            {playlists.length > 0 && (
              <>
                <div className="mx-3 my-1 h-px bg-vibe-onyx-400" />
                <p className="px-3 py-1 text-[10px] font-medium text-vibe-text-muted uppercase tracking-wider">
                  Add to playlist
                </p>
                {playlists.slice(0, 5).map((pl) => (
                  <MenuItem
                    key={pl.id}
                    icon={
                      pl.coverUrl
                        ? <img src={pl.coverUrl} alt={pl.name} className="h-3.5 w-3.5 rounded-[2px] object-cover" />
                        : <Plus className="h-3.5 w-3.5" />
                    }
                    label={pl.name}
                    onClick={() => handleAction({ type: "add_to_playlist", playlistId: pl.id, playlistName: pl.name })}
                  />
                ))}
              </>
            )}

            <div className="mx-3 my-1 h-px bg-vibe-onyx-400" />
            <MenuItem
              icon={<span className="text-[11px]">👤</span>}
              label="View artist"
              onClick={() => handleAction({ type: "view_artist", artistId: track.artistId })}
            />
            <MenuItem
              icon={<span className="text-[11px]">🔗</span>}
              label="Share"
              onClick={() => handleAction({ type: "share" })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share dialog — portalled to document.body */}
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share"
        label={track.title}
        sublabel={track.artist || undefined}
        coverUrl={track.coverUrl}
        artistUsername={(() => {
          if (track.artistUsername) return track.artistUsername
          if (track.artist) {
            const slug = track.artist.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "")
            return slug || undefined
          }
          return undefined
        })()}
        artistId={track.artistId || undefined}
        trackId={track.id}
      />
    </motion.div>
  )
}

function MenuItem({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors",
        danger
          ? "text-vibe-red hover:bg-vibe-red/10"
          : "text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-300"
      )}
      onClick={onClick}
    >
      <span className={cn("shrink-0", danger ? "text-vibe-red" : "text-vibe-text-muted")}>{icon}</span>
      {label}
    </button>
  )
}
