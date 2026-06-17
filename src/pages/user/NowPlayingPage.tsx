import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown, SkipBack, Play, Pause, SkipForward,
  Heart, Volume2, VolumeX, Repeat, Repeat1,
  Shuffle, ListMusic, MoreHorizontal, Music2,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import {
  togglePlay, nextTrack, prevTrack,
  setVolume, toggleMute, cycleRepeat,
  toggleShuffle, setProgress, toggleQueuePanel,
} from "@/store/slices/playerSlice"
import { useLikeTrackMutation, useGetLikedTracksQuery } from "@/store/api/vibeApi"
import { seekAudio } from "@/components/app/AudioEngine"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00"
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`
}

export function NowPlayingPage() {
  const navigate   = useNavigate()
  const dispatch   = useAppDispatch()
  const {
    currentTrack, isPlaying, volume, isMuted,
    progress, duration, repeatMode, isShuffle,
  } = useAppSelector((s) => s.player)

  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)
  const progressBarRef            = useRef<HTMLDivElement>(null)

  const isSeekingRef = useRef(false)
  const durationRef  = useRef(duration)
  const hasTrackRef  = useRef(!!currentTrack)
  useEffect(() => { durationRef.current = duration },     [duration])
  useEffect(() => { hasTrackRef.current = !!currentTrack }, [currentTrack])

  // Like state — derived from API
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
  const RepeatIcon      = repeatMode === "one" ? Repeat1 : Repeat
  const repeatActive    = repeatMode !== "off"

  function clientXToTime(clientX: number): number {
    const bar = progressBarRef.current
    if (!bar || !durationRef.current) return 0
    const rect  = bar.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * durationRef.current
  }

  // Mouse (desktop)
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
    const t = clientXToTime(e.clientX)
    seekAudio(t); dispatch(setProgress(t))
    isSeekingRef.current = false; setIsSeeking(false)
  }

  // Touch (mobile) — non-passive so preventDefault works
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!hasTrackRef.current) return
    e.preventDefault()
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
    const t = clientXToTime(e.changedTouches[0].clientX)
    seekAudio(t); dispatch(setProgress(t))
    isSeekingRef.current = false; setIsSeeking(false)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.35, ease: [0.32, 0, 0.17, 1] }}
      className="relative flex flex-col min-h-screen bg-vibe-onyx overflow-hidden"
    >
      {/* ── Ambient background blur from cover art ── */}
      <AnimatePresence mode="wait">
        {currentTrack?.coverUrl && (
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 pointer-events-none"
          >
            <img
              src={currentTrack.coverUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-[80px] scale-125 opacity-25"
            />
            {/* Radial vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-vibe-onyx/60 via-transparent to-vibe-onyx/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1 px-6 md:px-10 max-w-lg mx-auto w-full pt-safe">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-5 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">Now Playing</p>
          </div>
          <button className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Cover art */}
        <div className="flex-1 flex items-center justify-center py-6 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTrack?.id ?? "empty"}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: isPlaying ? 1 : 0.92, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0, 0.17, 1] }}
              className="w-full max-w-[min(100%,320px)] aspect-square"
            >
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-black/60"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-vibe-onyx-300 border border-vibe-onyx-400 flex items-center justify-center">
                  <Music2 className="h-20 w-20 text-vibe-text-muted opacity-30" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Track info + like */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTrack?.id + "-title"}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="font-heading text-2xl font-bold text-white truncate"
              >
                {currentTrack?.title ?? "Nothing playing"}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-white/60 mt-0.5 truncate">
              {currentTrack?.artist ?? "Play a track to get started"}
            </p>
          </div>
          <button
            onClick={handleLike}
            className={cn(
              "shrink-0 mt-1 transition-all duration-200",
              isLiked ? "text-vibe-red scale-110" : "text-white/50 hover:text-white"
            )}
          >
            <Heart className={cn("h-6 w-6", isLiked && "fill-current")} />
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="mb-2"
          onMouseUp={handleMouseUp}
          onMouseLeave={(e) => { if (isSeekingRef.current) handleMouseUp(e) }}
        >
          <div
            ref={progressBarRef}
            className={cn(
              "h-1 bg-white/15 rounded-full relative group",
              currentTrack ? "cursor-pointer" : "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            // touch handlers attached imperatively above
          >
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: `${progressPct}%` }}
            />
            {currentTrack && (
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  isSeeking && "opacity-100"
                )}
                style={{ left: `${progressPct}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-white/40 tabular-nums">{formatTime(progress)}</span>
            <span className="text-[11px] text-white/40 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => dispatch(toggleShuffle())}
            className={cn(
              "p-2 rounded-full transition-colors",
              isShuffle ? "text-vibe-red" : "text-white/50 hover:text-white"
            )}
          >
            <Shuffle className="h-5 w-5" />
          </button>

          <button
            onClick={() => dispatch(prevTrack())}
            className="p-2 text-white hover:text-white/70 transition-colors"
          >
            <SkipBack className="h-6 w-6" />
          </button>

          <button
            onClick={() => dispatch(togglePlay())}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying
              ? <Pause className="h-6 w-6 fill-vibe-onyx text-vibe-onyx" />
              : <Play  className="h-6 w-6 fill-vibe-onyx text-vibe-onyx ml-0.5" />
            }
          </button>

          <button
            onClick={() => dispatch(nextTrack())}
            className="p-2 text-white hover:text-white/70 transition-colors"
          >
            <SkipForward className="h-6 w-6" />
          </button>

          <button
            onClick={() => dispatch(cycleRepeat())}
            className={cn(
              "p-2 rounded-full transition-colors",
              repeatActive ? "text-vibe-red" : "text-white/50 hover:text-white"
            )}
          >
            <RepeatIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Volume + queue */}
        <div className="flex items-center gap-3 pb-8">
          <button
            onClick={() => dispatch(toggleMute())}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            <VolumeIcon className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={0} max={1} step={0.02}
            value={effectiveVolume}
            onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
            className="flex-1 accent-white cursor-pointer h-1"
          />
          <button
            onClick={() => dispatch(toggleQueuePanel())}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            <ListMusic className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
