import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Track } from '../api/vibeApi'

export interface Playlist {
  id: string
  name: string
  coverUrl?: string
  tracks: Track[]
  createdAt: string
}

interface PlaylistState {
  playlists: Playlist[]
  /** id of the playlist currently open in the detail view */
  activePlaylistId: string | null
}

const initialState: PlaylistState = {
  playlists: [],
  activePlaylistId: null,
}

export const playlistSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    /** Called after a successful createPlaylist API response */
    addPlaylist(state, action: PayloadAction<{ id: string; name: string }>) {
      state.playlists.push({
        id: action.payload.id,
        name: action.payload.name,
        tracks: [],
        createdAt: new Date().toISOString(),
      })
    },
    setPlaylists(state, action: PayloadAction<Playlist[]>) {
      state.playlists = action.payload
    },
    setPlaylistCover(state, action: PayloadAction<{ id: string; coverUrl: string }>) {
      const pl = state.playlists.find((p) => p.id === action.payload.id)
      if (pl) pl.coverUrl = action.payload.coverUrl
    },
    addTrackToPlaylist(state, action: PayloadAction<{ playlistId: string; track: Track }>) {
      const pl = state.playlists.find((p) => p.id === action.payload.playlistId)
      if (pl && !pl.tracks.find((t) => t.id === action.payload.track.id)) {
        pl.tracks.push(action.payload.track)
      }
    },
    removeTrackFromPlaylist(state, action: PayloadAction<{ playlistId: string; trackId: string }>) {
      const pl = state.playlists.find((p) => p.id === action.payload.playlistId)
      if (pl) pl.tracks = pl.tracks.filter((t) => t.id !== action.payload.trackId)
    },
    deletePlaylist(state, action: PayloadAction<string>) {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload)
      if (state.activePlaylistId === action.payload) state.activePlaylistId = null
    },
    setActivePlaylist(state, action: PayloadAction<string | null>) {
      state.activePlaylistId = action.payload
    },
  },
})

export const {
  addPlaylist,
  setPlaylists,
  setPlaylistCover,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  setActivePlaylist,
} = playlistSlice.actions

export default playlistSlice.reducer
