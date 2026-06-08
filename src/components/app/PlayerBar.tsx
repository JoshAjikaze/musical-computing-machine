import { useRef, useState } from "react"
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
  const navigate   = useNavigate()
  const { currentTrack, isPlaying, volume, isMuted, progress, duration, repeatMode, isShuffle } =
    useAppSelector((s) => s.player)

  const [liked, setLiked]         = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const progressBarRef            = useRef<HTMLDivElement>(null)

  const progressPct = duration > 0
    ? ((isSeeking ? seekValue : progress) / duration) * 100
    : 0

  // ── Seek helpers ─────────────────────────────────────────────────────────
  function getTimeFromEvent(e: React.MouseEvent | React.TouchEvent): number {
    const bar = progressBarRef.current
    if (!bar || !duration) return 0
    const rect    = bar.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const ratio   = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return ratio * duration
  }

  function handleSeekStart(e: React.MouseEvent | React.TouchEvent) {
    if (!currentTrack) return
    setIsSeeking(true)
    setSeekValue(getTimeFromEvent(e))
  }

  function handleSeekMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isSeeking) return
    setSeekValue(getTimeFromEvent(e))
  }

  function handleSeekEnd(e: React.MouseEvent | React.TouchEvent) {
    if (!isSeeking) return
    const time = getTimeFromEvent(e)
    seekAudio(time)
    dispatch(setProgress(time))
    setIsSeeking(false)
  }

  // ── Volume ───────────────────────────────────────────────────────────────
  const effectiveVolume = isMuted ? 0 : volume
  const VolumeIcon      = isMuted || volume === 0 ? VolumeX : Volume2

  // ── Repeat icon ──────────────────────────────────────────────────────────
  const RepeatIcon   = repeatMode === "one" ? Repeat1 : Repeat
  const repeatActive = repeatMode !== "off"

  return (
    <div className="w-full bg-[#1a1a1a] border-t border-vibe-onyx-400 select-none">

      {/* Seekable progress bar */}
      <div
        ref={progressBarRef}
        className={cn(
          "h-1 bg-vibe-onyx-400 relative group",
          currentTrack ? "cursor-pointer" : "cursor-default",
        )}
        onMouseDown={handleSeekStart}
        onMouseMove={handleSeekMove}
        onMouseUp={handleSeekEnd}
        onMouseLeave={(e) => { if (isSeeking) handleSeekEnd(e) }}
        onTouchStart={handleSeekStart}
        onTouchMove={handleSeekMove}
        onTouchEnd={handleSeekEnd}
      >
        <div className="h-full bg-vibe-red" style={{ width: `${progressPct}%` }} />
        {currentTrack && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
              isSeeking && "opacity-100",
            )}
            style={{ left: `${progressPct}%` }}
          />
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 px-4 h-[60px]">

        {/* Track info — click to open Now Playing */}
        <button
          onClick={() => currentTrack && navigate("/listen/now-playing")}
          className={cn(
            "flex items-center gap-3 w-[220px] md:w-[260px] min-w-0 text-left group/info",
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
            className={cn(
              "hidden sm:block transition-colors",
              isShuffle ? "text-vibe-red" : "text-vibe-text-muted hover:text-white",
            )}
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
            className={cn(
              "hidden sm:block transition-colors",
              repeatActive ? "text-vibe-red" : "text-vibe-text-muted hover:text-white",
            )}
            aria-label={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 justify-end w-[220px] md:w-[260px]">
          <button
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "transition-colors",
              liked ? "text-vibe-red" : "text-vibe-text-secondary hover:text-white",
            )}
            aria-label="Like"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </button>

          <span className="text-xs text-vibe-text-muted tabular-nums hidden sm:block w-[80px] text-center">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleMute())}
              className="text-vibe-text-muted hover:text-white transition-colors shrink-0"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={effectiveVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                dispatch(setVolume(v))
              }}
              className="w-20 accent-vibe-red cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <button
            onClick={() => dispatch(toggleQueuePanel())}
            className="text-vibe-text-muted hover:text-white transition-colors hidden md:block"
            aria-label="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </button>

          <button
            onClick={() => currentTrack && navigate("/listen/now-playing")}
            className="text-vibe-text-muted hover:text-white transition-colors md:hidden"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
