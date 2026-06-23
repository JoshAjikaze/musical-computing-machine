/**
 * AudioEngine
 *
 * Renderless component — mounts a single HTMLAudioElement and keeps it in
 * sync with the Redux player slice in both directions:
 *
 *   Redux → Audio:  isPlaying, volume, isMuted, currentTrack.audioUrl, repeatMode
 *   Audio → Redux:  progress (timeupdate), duration (loadedmetadata), nextTrack (ended)
 *
 * Mount once inside App.tsx, outside any route, so it persists across navigation.
 */

import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import {
  setProgress,
  setDuration,
  nextTrack,
  pause,
} from "@/store/slices/playerSlice"

export function AudioEngine() {
  const dispatch = useAppDispatch()
  const { currentTrack, isPlaying, volume, isMuted, repeatMode } =
    useAppSelector((s) => s.player)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ── Initialise the audio element once ──────────────────────────────────
  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio
    _audioRef = audio

    const onTimeUpdate = () => dispatch(setProgress(audio.currentTime))
    const onLoadedMeta = () => dispatch(setDuration(audio.duration))
    const onEnded = () => {
      if (audio.loop) return          // repeatMode === 'one' handled via loop
      dispatch(nextTrack())
    }
    const onPause = () => {
      // Sync back if the browser paused for network reasons but Redux says playing
      // (we let the isPlaying effect handle intentional pauses)
    }
    const onError = (e: Event) => {
      console.error("[AudioEngine] error", (e.target as HTMLAudioElement).error)
      dispatch(pause())
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMeta)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("error", onError)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMeta)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("error", onError)
      audio.pause()
      audio.src = ""
      audioRef.current = null
      _audioRef = null
    }
  }, [dispatch])

  // ── Track change → load new src ────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!currentTrack) {
      audio.pause()
      audio.src = ""
      dispatch(setProgress(0))
      dispatch(setDuration(0))
      return
    }

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl
      audio.load()
      dispatch(setProgress(0))
    }
  }, [currentTrack?.audioUrl, dispatch])

  // ── Play / Pause ────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      // play() returns a promise — catch AbortError from rapid state changes
      const promise = audio.play()
      if (promise !== undefined) {
        promise.catch((err) => {
          if (err.name !== "AbortError") {
            console.error("[AudioEngine] play() failed:", err)
            dispatch(pause())
          }
        })
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, dispatch])

  // ── Volume ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : Math.min(1, Math.max(0, volume))
  }, [volume, isMuted])

  // ── Repeat mode ─────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = repeatMode === "one"
  }, [repeatMode])

  // renderless — no DOM output
  return null
}

/**
 * Expose a stable seek function so PlayerBar can call it without
 * needing direct access to the audio element ref.
 *
 * Usage in PlayerBar:
 *   import { seekAudio } from "@/components/app/AudioEngine"
 *   seekAudio(newTime)
 */
let _audioRef: HTMLAudioElement | null = null

export function seekAudio(time: number) {
  if (_audioRef) {
    _audioRef.currentTime = time
  }
}
