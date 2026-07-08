import { useRef, useState, useEffect, useCallback } from "react"
import { SkipBack, Play, Pause, SkipForward, Heart, Volume2, VolumeX, ChevronUp } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import {
  togglePlay, nextTrack, prevTrack,
  setVolume, toggleMute, setProgress, toggleNowPlayingPanel,
} from "@/store/slices/playerSlice"
import { useLikeTrackMutation, useGetLikedTracksQuery } from "@/store/api/vibeApi"
import { seekAudio } from "@/components/app/AudioEngine"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00"
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`
}

export function PlayerBar() {
  const dispatch = useAppDispatch()
  const { currentTrack, isPlaying, volume, isMuted, progress, duration } =
    useAppSelector((s) => s.player)

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const progressBarRef            = useRef<HTMLDivElement>(null)
  const isSeekingRef              = useRef(false)
  const durationRef               = useRef(duration)
  const hasTrackRef               = useRef(!!currentTrack)
  useEffect(() => { durationRef.current   = duration },      [duration])
  useEffect(() => { hasTrackRef.current   = !!currentTrack }, [currentTrack])

  // Like state — from API
  const [likeTrack]              = useLikeTrackMutation()
  const { data: likedTracksRaw } = useGetLikedTracksQuery()
  const likedIds = new Set(
    Array.isArray(likedTracksRaw)
      ? (likedTracksRaw as { id?: string; track_id?: string }[]).map((t) => t.id ?? t.track_id ?? "")
      : []
  )
  const isLiked = currentTrack ? (likedIds.has(currentTrack.id) || !!currentTrack.isLiked) : false

  async function handleLike() {
    if (!currentTrack) return
    try {
      await likeTrack(currentTrack.id).unwrap()
      toast.success(isLiked ? "Removed from favourites" : "Added to favourites")
    } catch {
      toast.error("Could not update favourites")
    }
  }

  const progressPct = duration > 0
    ? ((isSeeking ? seekValue : progress) / duration) * 100
    : 0

  const effectiveVolume = isMuted ? 0 : volume
  const VolumeIcon      = isMuted || volume === 0 ? VolumeX : Volume2

  // ── Coordinate → time ────────────────────────────────────
  function clientXToTime(clientX: number) {
    const bar = progressBarRef.current
    if (!bar || !durationRef.current) return 0
    const rect = bar.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * durationRef.current
  }

  // ── Mouse seek ───────────────────────────────────────────
  function handleMouseDown(e: React.MouseEvent) {
    if (!currentTrack) return
    isSeekingRef.current = true; setIsSeeking(true); setSeekValue(clientXToTime(e.clientX))
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isSeekingRef.current) return; setSeekValue(clientXToTime(e.clientX))
  }
  function handleMouseUp(e: React.MouseEvent) {
    if (!isSeekingRef.current) return
    const t = clientXToTime(e.clientX)
    seekAudio(t); dispatch(setProgress(t)); isSeekingRef.current = false; setIsSeeking(false)
  }

  // ── Touch seek (non-passive) ─────────────────────────────
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!hasTrackRef.current) return
    e.preventDefault(); isSeekingRef.current = true; setIsSeeking(true)
    setSeekValue(clientXToTime(e.touches[0].clientX))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSeekingRef.current) return
    e.preventDefault(); setSeekValue(clientXToTime(e.touches[0].clientX))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isSeekingRef.current) return
    const t = clientXToTime(e.changedTouches[0].clientX)
    seekAudio(t); dispatch(setProgress(t)); isSeekingRef.current = false; setIsSeeking(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    const el = progressBarRef.current
    if (!el) return
    el.addEventListener("touchstart", handleTouchStart, { passive: false })
    el.addEventListener("touchmove",  handleTouchMove,  { passive: false })
    el.addEventListener("touchend",   handleTouchEnd,   { passive: false })
    return () => {
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove",  handleTouchMove)
      el.removeEventListener("touchend",   handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Opens the docked sidebar (NowPlayingSidebar) instead of switching
  // routes — works the same from any page within a shell.
  const goToNowPlaying = () => currentTrack && dispatch(toggleNowPlayingPanel())

  return (
    <div
      className="w-full bg-[#1a1a1a] border-t border-vibe-onyx-400 select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={(e) => { if (isSeekingRef.current) handleMouseUp(e) }}
    >
      {/* ── MOBILE (< md) ── */}
      <div className="flex md:hidden flex-col">
        {/* Controls row */}
        <div className="flex items-center px-3 h-[56px] gap-2">
          {/* Cover + track info */}
          <button onClick={goToNowPlaying} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
            {currentTrack?.coverUrl
              ? <img src={currentTrack.coverUrl} alt={currentTrack.title} className="h-9 w-9 rounded-sm object-cover shrink-0" />
              : <div className="h-9 w-9 rounded-sm bg-vibe-onyx-300 shrink-0" />
            }
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate leading-tight">{currentTrack?.title ?? "Nothing playing"}</p>
              <p className="text-xs text-vibe-text-muted truncate">{currentTrack?.artist ?? ""}</p>
            </div>
          </button>

          {/* Controls */}
          <button onClick={() => dispatch(prevTrack())} className="p-1.5 text-vibe-text-secondary active:text-white">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={() => dispatch(togglePlay())}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
          >
            {isPlaying
              ? <Pause className="h-4 w-4 fill-vibe-onyx text-vibe-onyx" />
              : <Play  className="h-4 w-4 fill-vibe-onyx text-vibe-onyx ml-0.5" />
            }
          </button>
          <button onClick={() => dispatch(nextTrack())} className="p-1.5 text-vibe-text-secondary active:text-white">
            <SkipForward className="h-5 w-5" />
          </button>
          <button onClick={handleLike} className={cn("p-1.5 transition-colors", isLiked ? "text-vibe-red" : "text-vibe-text-secondary")}>
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </button>
          <button onClick={goToNowPlaying} className="p-1.5 text-vibe-text-muted active:text-white">
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar — below controls on mobile */}
        <div
          ref={progressBarRef}
          className={cn("relative h-1 bg-vibe-onyx-400", currentTrack ? "cursor-pointer" : "cursor-default")}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <div className="h-full bg-vibe-red transition-none" style={{ width: `${progressPct}%` }}>
            {/* Thumb dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* ── DESKTOP (≥ md) ── */}
      <div className="hidden md:flex items-center px-4 h-[60px] gap-4">

        {/* Cover + track info */}
        <button
          onClick={goToNowPlaying}
          className={cn(
            "flex items-center gap-3 min-w-0 shrink-0 text-left group/info",
            currentTrack ? "cursor-pointer" : "cursor-default"
          )}
        >
          {currentTrack ? (
            <>
              <img src={currentTrack.coverUrl} alt={currentTrack.title}
                className="h-9 w-9 rounded-sm object-cover shrink-0" />
              <div className="min-w-0 max-w-[140px]">
                <p className="text-sm font-medium text-white truncate leading-tight group-hover/info:text-white/80 transition-colors">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-vibe-text-muted truncate">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 opacity-40">
              <div className="h-9 w-9 rounded-sm bg-vibe-onyx-300 shrink-0" />
              <p className="text-sm text-vibe-text-muted">No track playing</p>
            </div>
          )}
        </button>

        {/* Transport controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => dispatch(prevTrack())}
            className="text-vibe-text-secondary hover:text-white transition-colors">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={() => dispatch(togglePlay())}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying
              ? <Pause className="h-4 w-4 fill-vibe-onyx text-vibe-onyx" />
              : <Play  className="h-4 w-4 fill-vibe-onyx text-vibe-onyx ml-0.5" />
            }
          </button>
          <button onClick={() => dispatch(nextTrack())}
            className="text-vibe-text-secondary hover:text-white transition-colors">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Like */}
        <button onClick={handleLike}
          className={cn("shrink-0 transition-colors", isLiked ? "text-vibe-red" : "text-vibe-text-secondary hover:text-white")}>
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </button>

        {/* Progress bar + timestamps — flex-1 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs text-vibe-text-muted tabular-nums shrink-0 w-8 text-right">
            {formatTime(progress)}
          </span>
          <div
            ref={progressBarRef}
            className={cn(
              "relative flex-1 h-1 bg-vibe-onyx-400 rounded-full group",
              currentTrack ? "cursor-pointer" : "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <div className="h-full bg-vibe-red rounded-full transition-none" style={{ width: `${progressPct}%` }}>
              <div
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  isSeeking && "opacity-100"
                )}
              />
            </div>
          </div>
          <span className="text-xs text-vibe-text-muted tabular-nums shrink-0 w-8">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => dispatch(toggleMute())}
            className="text-vibe-text-muted hover:text-white transition-colors">
            <VolumeIcon className="h-4 w-4" />
          </button>
          <input
            type="range" min={0} max={1} step={0.02}
            value={effectiveVolume}
            onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
            className="w-20 accent-vibe-red cursor-pointer"
          />
        </div>

        {/* Expand */}
        <button onClick={goToNowPlaying}
          className="text-vibe-text-muted hover:text-white transition-colors shrink-0">
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
