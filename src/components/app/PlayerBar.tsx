import { useState } from "react"
import { SkipBack, Play, Pause, SkipForward, Heart, Volume2, ChevronUp } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { togglePlay, nextTrack, prevTrack, setVolume } from "@/store/slices/playerSlice"
import { cn } from "@/lib/utils"

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`
}

export function PlayerBar() {
  const dispatch = useAppDispatch()
  const { currentTrack, isPlaying, volume, progress, duration } = useAppSelector((s) => s.player)
  const [liked, setLiked] = useState(false)

  // Always render bar so layout doesn't jump; hide content when no track
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="w-full bg-[#1a1a1a] border-t border-vibe-onyx-400">
      {/* Progress bar */}
      <div className="h-1 bg-vibe-onyx-400 relative">
        <div
          className="h-full bg-vibe-red transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
        {/* Thumb dot */}
        {currentTrack && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-vibe-red -ml-1.5"
            style={{ left: `${progressPct}%` }}
          />
        )}
      </div>

      <div className="flex items-center gap-3 px-4 h-[60px]">
        {/* Track info */}
        <div className="flex items-center gap-3 w-[220px] md:w-[260px] min-w-0">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="h-9 w-9 rounded-sm object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">
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
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 flex-1">
          <button
            onClick={() => dispatch(prevTrack())}
            className="text-vibe-text-secondary hover:text-white transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={() => dispatch(togglePlay())}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-vibe-text-primary transition-colors"
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
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 justify-end w-[220px] md:w-[260px]">
          {/* Like */}
          <button
            onClick={() => setLiked((v) => !v)}
            className={cn("transition-colors", liked ? "text-vibe-red" : "text-vibe-text-secondary hover:text-white")}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </button>

          {/* Time */}
          <span className="text-xs text-vibe-text-muted tabular-nums hidden sm:block">
            {formatTime(progress)}
          </span>

          {/* Volume — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-vibe-text-muted" />
            <input
              type="range" min={0} max={1} step={0.02}
              value={volume}
              onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
              className="w-20 accent-vibe-red cursor-pointer"
            />
          </div>

          {/* Expand chevron */}
          <button className="text-vibe-text-muted hover:text-white transition-colors">
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
