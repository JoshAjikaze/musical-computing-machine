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
import { useRecordStreamMutation } from "@/store/api/vibeApi"

export function AudioEngine() {
  const dispatch = useAppDispatch()
  const { currentTrack, isPlaying, volume, isMuted, repeatMode } =
    useAppSelector((s) => s.player)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [recordStream] = useRecordStreamMutation()

  // The timeupdate listener below is registered once, on mount — these
  // refs let it always read the *current* track and mutation trigger
  // without needing to be torn down and re-registered on every track
  // change (which would mean re-attaching listeners on every play).
  const currentTrackRef = useRef(currentTrack)
  useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])

  const recordStreamRef = useRef(recordStream)
  useEffect(() => { recordStreamRef.current = recordStream }, [recordStream])

  // Whether the current pass through the track is still eligible to fire
  // the halfway stream POST. Starts armed, fires once when crossing the
  // halfway point, then re-arms itself the moment playback is back below
  // halfway — via a seek back, a manual replay, or a repeat-one loop — so
  // each fresh listen counts again (Spotify-style), not just the first.
  const streamArmedRef = useRef(true)

  // ── Initialise the audio element once ──────────────────────────────────
  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio
    _audioRef = audio

    const onTimeUpdate  = () => {
      dispatch(setProgress(audio.currentTime))

      // POST /tracks/stream/{track_id} once per listen, the moment we
      // cross the halfway mark — and again on a replay/seek-back/loop,
      // since streamArmedRef re-arms below the halfway point.
      const track = currentTrackRef.current
      if (track && audio.duration > 0 && !Number.isNaN(audio.duration)) {
        const halfway = audio.duration / 2
        if (audio.currentTime < halfway) {
          streamArmedRef.current = true
        } else if (streamArmedRef.current) {
          streamArmedRef.current = false
          recordStreamRef.current(track.id).catch((err) => {
            // Non-critical analytics ping — log and move on. Deliberately
            // not re-arming here: this pass already crossed halfway, so
            // retrying immediately would just spam the endpoint on every
            // remaining timeupdate tick if it keeps failing. The next
            // genuine replay/seek-back will naturally re-arm it.
            console.error("[AudioEngine] recordStream failed:", err)
          })
        }
      }
    }
    const onLoadedMeta  = () => dispatch(setDuration(audio.duration))
    const onEnded       = () => {
      if (audio.loop) return          // repeatMode === 'one' handled via loop
      dispatch(nextTrack())
    }
    const onPause       = () => {
      // Sync back if the browser paused for network reasons but Redux says playing
      // (we let the isPlaying effect handle intentional pauses)
    }
    const onError = (e: Event) => {
      console.error("[AudioEngine] error", (e.target as HTMLAudioElement).error)
      dispatch(pause())
    }

    audio.addEventListener("timeupdate",    onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMeta)
    audio.addEventListener("ended",         onEnded)
    audio.addEventListener("pause",         onPause)
    audio.addEventListener("error",         onError)

    return () => {
      audio.removeEventListener("timeupdate",    onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMeta)
      audio.removeEventListener("ended",         onEnded)
      audio.removeEventListener("pause",         onPause)
      audio.removeEventListener("error",         onError)
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
      streamArmedRef.current = true
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
