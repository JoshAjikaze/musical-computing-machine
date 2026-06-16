import { useRef, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  SkipBack, Play, Pause, SkipForward,
  Heart, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, ChevronUp, ListMusic,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import {
  togglePlay, nextTrack, prevTrack,
  setVolume, toggleMute,
  cycleRepeat, toggleShuffle,
  setProgress, toggleQueuePanel,
} from "@/store/slices/playerSlice"
import { seekAudio } from "@/components/app/AudioEngine"
import { cn } from "@/lib/utils"

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00"
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`
}

export function PlayerBar() {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const {
    currentTrack, isPlaying, volume, isMuted,
    progress, duration, repeatMode, isShuffle,
  } = useAppSelector((s) => s.player)

  const [liked, setLiked]         = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const progressBarRef            = useRef<HTMLDivElement>(null)

  // Keep seeking state in a ref too so touch callbacks (closed over on mount)
  // always read the latest value without re-registering listeners
  const isSeekingRef  = useRef(false)
  const durationRef   = useRef(duration)
  const hasTrackRef   = useRef(!!currentTrack)
  useEffect(() => { durationRef.current = duration },    [duration])
  useEffect(() => { hasTrackRef.current = !!currentTrack }, [currentTrack])

  const progressPct = duration > 0
    ? ((isSeeking ? seekValue : progress) / duration) * 100
    : 0

  // ── Shared coordinate → time helper ────────────────────────────────────
  function clientXToTime(clientX: number): number {
    const bar = progressBarRef.current
    if (!bar || !durationRef.current) return 0
    const rect  = bar.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return ratio * durationRef.current
  }

  // ── Mouse seek (React synthetic — works fine on desktop) ───────────────
  function handleMouseDown(e: React.MouseEvent) {
    if (!currentTrack) return
    isSeekingRef.current = true
    setIsSeeking(true)
    setSeekValue(clientXToTime(e.clientX))
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isSeekingRef.current) return
    setSeekValue(clientXToTime(e.clientX))
  }
  function handleMouseUp(e: React.MouseEvent) {
    if (!isSeekingRef.current) return
    const time = clientXToTime(e.clientX)
    seekAudio(time)
    dispatch(setProgress(time))
    isSeekingRef.current = false
    setIsSeeking(false)
  }

  // ── Touch seek — imperative, { passive: false } so preventDefault works ─
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!hasTrackRef.current) return
    e.preventDefault()                         // stop page scroll while scrubbing
    isSeekingRef.current = true
    setIsSeeking(true)
    setSeekValue(clientXToTime(e.touches[0].clientX))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSeekingRef.current) return
    e.preventDefault()
    setSeekValue(clientXToTime(e.touches[0].clientX))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isSeekingRef.current) return
    const touch = e.changedTouches[0]
    const time  = clientXToTime(touch.clientX)
    seekAudio(time)
    dispatch(setProgress(time))
    isSeekingRef.current = false
    setIsSeeking(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  // Register non-passive touch listeners on the progress bar element
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

  // ── Volume / Repeat icons ────────────────────────────────────────────────
  const effectiveVolume = isMuted ? 0 : volume
  const VolumeIcon      = isMuted || volume === 0 ? VolumeX : Volume2
  const RepeatIcon      = repeatMode === "one" ? Repeat1 : Repeat
  const repeatActive    = repeatMode !== "off"

  const goToNowPlaying = () => currentTrack && navigate("/listen/now-playing")

  return (
    <div
      className="w-full bg-[#1a1a1a] border-t border-vibe-onyx-400 select-none"
      // Catch stray mouseup outside the progress bar so seek always commits
      onMouseUp={handleMouseUp}
      onMouseLeave={(e) => { if (isSeekingRef.current) handleMouseUp(e) }}
    >

      {/* ── Progress bar ── */}
      <div
        ref={progressBarRef}
        className={cn(
          "relative bg-vibe-onyx-400 group",
          "h-3 md:h-1",
          currentTrack ? "cursor-pointer" : "cursor-default",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // touch handlers are attached imperatively above
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-vibe-onyx-400">
          <div className="h-full bg-vibe-red transition-none" style={{ width: `${progressPct}%` }} />
        </div>
        {currentTrack && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white z-10",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
              isSeeking && "opacity-100",
            )}
            style={{ left: `${progressPct}%` }}
          />
        )}
      </div>

      {/* ── MOBILE layout (< md) ── */}
      <div className="flex md:hidden items-center px-3 h-[60px] gap-3">
        {/* Track info — tappable to open Now Playing */}
        <button
          onClick={goToNowPlaying}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
        >
          {currentTrack?.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="h-9 w-9 rounded-sm object-cover shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-sm bg-vibe-onyx-300 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">
              {currentTrack?.title ?? "Nothing playing"}
            </p>
            <p className="text-xs text-vibe-text-muted truncate">
              {currentTrack?.artist ?? ""}
            </p>
          </div>
        </button>

        {/* Mobile essential controls: like · prev · play · next · expand */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "p-1.5 transition-colors",
              liked ? "text-vibe-red" : "text-vibe-text-secondary",
            )}
            aria-label="Like"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </button>

          <button
            onClick={() => dispatch(prevTrack())}
            className="p-1.5 text-vibe-text-secondary active:text-white transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={() => dispatch(togglePlay())}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying
              ? <Pause className="h-4 w-4 fill-vibe-onyx text-vibe-onyx" />
              : <Play  className="h-4 w-4 fill-vibe-onyx text-vibe-onyx ml-0.5" />
            }
          </button>

          <button
            onClick={() => dispatch(nextTrack())}
            className="p-1.5 text-vibe-text-secondary active:text-white transition-colors"
            aria-label="Next"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          <button
            onClick={goToNowPlaying}
            className="p-1.5 text-vibe-text-muted active:text-white transition-colors"
            aria-label="Open now playing"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── DESKTOP layout (≥ md) ── */}
      <div className="hidden md:flex items-center gap-3 px-4 h-[60px]">

        {/* Track info */}
        <button
          onClick={goToNowPlaying}
          className={cn(
            "flex items-center gap-3 w-[260px] min-w-0 text-left group/info",
            currentTrack ? "cursor-pointer" : "cursor-default"
          )}
        >
          {currentTrack ? (
            <>
              <div className="relative shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="h-9 w-9 rounded-sm object-cover"
                />
                <div className="absolute inset-0 rounded-sm bg-black/40 flex items-center justify-center opacity-0 group-hover/info:opacity-100 transition-opacity">
                  <ChevronUp className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <div className="min-w-0">
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

        {/* Centre controls */}
        <div className="flex items-center justify-center gap-3 flex-1">
          <button
            onClick={() => dispatch(toggleShuffle())}
            className={cn("transition-colors", isShuffle ? "text-vibe-red" : "text-vibe-text-muted hover:text-white")}
            aria-label="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <button
            onClick={() => dispatch(prevTrack())}
            className="text-vibe-text-secondary hover:text-white transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={() => dispatch(togglePlay())}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying
              ? <Pause className="h-4 w-4 fill-vibe-onyx text-vibe-onyx" />
              : <Play  className="h-4 w-4 fill-vibe-onyx text-vibe-onyx ml-0.5" />
            }
          </button>

          <button
            onClick={() => dispatch(nextTrack())}
            className="text-vibe-text-secondary hover:text-white transition-colors"
            aria-label="Next"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          <button
            onClick={() => dispatch(cycleRepeat())}
            className={cn("transition-colors", repeatActive ? "text-vibe-red" : "text-vibe-text-muted hover:text-white")}
            aria-label={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 justify-end w-[260px]">
          <button
            onClick={() => setLiked((v) => !v)}
            className={cn("transition-colors", liked ? "text-vibe-red" : "text-vibe-text-secondary hover:text-white")}
            aria-label="Like"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </button>

          <span className="text-xs text-vibe-text-muted tabular-nums w-[80px] text-center">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleMute())}
              className="text-vibe-text-muted hover:text-white transition-colors shrink-0"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={0} max={1} step={0.02}
              value={effectiveVolume}
              onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
              className="w-20 accent-vibe-red cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <button
            onClick={() => dispatch(toggleQueuePanel())}
            className="text-vibe-text-muted hover:text-white transition-colors"
            aria-label="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
