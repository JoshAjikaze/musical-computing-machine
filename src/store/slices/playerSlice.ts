import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Track } from '../api/vibeApi'

type RepeatMode = 'off' | 'all' | 'one'

interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  isMuted: boolean
  volume: number       // 0–1
  progress: number     // seconds
  duration: number     // seconds
  repeatMode: RepeatMode
  isShuffle: boolean
  isQueueVisible: boolean
}

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isMuted: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  repeatMode: 'off',
  isShuffle: false,
  isQueueVisible: false,
}

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playTrack(state, action: PayloadAction<{ track: Track; queue?: Track[] }>) {
      const { track, queue } = action.payload
      state.currentTrack = track
      state.isPlaying = true
      state.progress = 0
      if (queue) {
        state.queue = queue
        state.queueIndex = queue.findIndex((t) => t.id === track.id)
      }
    },
    togglePlay(state) {
      state.isPlaying = !state.isPlaying
    },
    pause(state) {
      state.isPlaying = false
    },
    resume(state) {
      state.isPlaying = true
    },
    setProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.min(1, Math.max(0, action.payload))
      if (state.volume > 0) state.isMuted = false
    },
    toggleMute(state) {
      state.isMuted = !state.isMuted
    },
    nextTrack(state) {
      if (!state.queue.length) return
      const next = state.isShuffle
        ? Math.floor(Math.random() * state.queue.length)
        : state.queueIndex + 1

      if (next >= state.queue.length) {
        if (state.repeatMode === 'all') {
          state.queueIndex = 0
          state.currentTrack = state.queue[0]
        } else {
          state.isPlaying = false
        }
        return
      }
      state.queueIndex = next
      state.currentTrack = state.queue[next]
      state.progress = 0
    },
    prevTrack(state) {
      if (!state.queue.length) return
      if (state.progress > 3) {
        state.progress = 0
        return
      }
      const prev = Math.max(0, state.queueIndex - 1)
      state.queueIndex = prev
      state.currentTrack = state.queue[prev]
      state.progress = 0
    },
    cycleRepeat(state) {
      const modes: RepeatMode[] = ['off', 'all', 'one']
      const idx = modes.indexOf(state.repeatMode)
      state.repeatMode = modes[(idx + 1) % modes.length]
    },
    toggleShuffle(state) {
      state.isShuffle = !state.isShuffle
    },
    addToQueue(state, action: PayloadAction<Track>) {
      state.queue.push(action.payload)
    },
    clearQueue(state) {
      state.queue = []
      state.queueIndex = -1
    },
    toggleQueuePanel(state) {
      state.isQueueVisible = !state.isQueueVisible
    },
  },
})

export const {
  playTrack,
  togglePlay,
  pause,
  resume,
  setProgress,
  setDuration,
  setVolume,
  toggleMute,
  nextTrack,
  prevTrack,
  cycleRepeat,
  toggleShuffle,
  addToQueue,
  clearQueue,
  toggleQueuePanel,
} = playerSlice.actions

export default playerSlice.reducer
