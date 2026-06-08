import { useState } from "react"
import { Play, MoreHorizontal, Plus, Trash2, Music2, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { deletePlaylist, setActivePlaylist } from "@/store/slices/playlistSlice"
import { playTrack } from "@/store/slices/playerSlice"
import { CreatePlaylistDialog } from "@/components/app/CreatePlaylistDialog"
import { cn } from "@/lib/utils"
import type { Playlist } from "@/store/slices/playlistSlice"

const FILTER_TABS = ["Playlists", "Artists", "Albums", "Downloads"] as const
type FilterTab = typeof FILTER_TABS[number]

export function UserLibraryPage() {
  const [activeTab, setActiveTab]   = useState<FilterTab>("Playlists")
  const [createOpen, setCreateOpen] = useState(false)

  const dispatch         = useAppDispatch()
  const { playlists, activePlaylistId } = useAppSelector((s) => s.playlists)
  const activePlaylist   = playlists.find((p) => p.id === activePlaylistId) ?? null

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Library</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">Your favourite songs are here</p>
        </div>
        <Button size="default" rounded="full" className="shrink-0">
          Get free V coins
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); dispatch(setActivePlaylist(null)) }}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors duration-150",
              activeTab === tab
                ? "border-vibe-text-secondary bg-vibe-onyx-400 text-white"
                : "border-vibe-onyx-400 bg-transparent text-vibe-text-secondary hover:border-vibe-text-muted hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active filter chip */}
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-vibe-onyx-300 border border-vibe-onyx-400 text-vibe-text-secondary">
          {activeTab}
        </span>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "Playlists" ? (
          activePlaylist
            ? <PlaylistDetail key="detail" playlist={activePlaylist} onBack={() => dispatch(setActivePlaylist(null))} />
            : <PlaylistsGrid
                key="grid"
                playlists={playlists}
                onOpen={(id) => dispatch(setActivePlaylist(id))}
                onDelete={(id) => dispatch(deletePlaylist(id))}
                onNew={() => setCreateOpen(true)}
              />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <AmberBoxIllustration />
            <p className="font-heading text-lg font-semibold text-white">Empty</p>
          </motion.div>
        )}
      </AnimatePresence>

      <CreatePlaylistDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

// ── Playlists grid ────────────────────────────────────────
function PlaylistsGrid({
  playlists,
  onOpen,
  onDelete,
  onNew,
}: {
  playlists: Playlist[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}) {
  const [menuId, setMenuId] = useState<string | null>(null)

  return (
    <motion.div
      key="playlists-grid"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="space-y-2"
    >
      {/* Create new row */}
      <button
        onClick={onNew}
        className="flex items-center gap-4 p-3 w-full rounded-md border border-dashed border-vibe-onyx-400 hover:border-vibe-text-muted hover:bg-vibe-onyx-300/30 transition-colors group"
      >
        <div className="h-12 w-12 rounded-md bg-vibe-onyx-300 border border-vibe-onyx-400 flex items-center justify-center shrink-0">
          <Plus className="h-5 w-5 text-vibe-text-muted group-hover:text-white transition-colors" />
        </div>
        <p className="text-sm font-medium text-vibe-text-secondary group-hover:text-white transition-colors">
          New playlist
        </p>
      </button>

      {/* Existing playlists */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-vibe-text-muted">
          <Music2 className="h-10 w-10 opacity-30" />
          <p className="text-sm">No playlists yet</p>
          <p className="text-xs opacity-70">Create your first playlist above</p>
        </div>
      ) : (
        playlists.map((pl) => (
          <div
            key={pl.id}
            className="relative flex items-center gap-4 p-3 rounded-md hover:bg-vibe-onyx-300 transition-colors cursor-pointer group"
            onClick={() => onOpen(pl.id)}
          >
            {/* Cover */}
            <div className="relative shrink-0">
              <div className="h-12 w-12 rounded-md bg-vibe-onyx-400 overflow-hidden flex items-center justify-center">
                {pl.coverUrl ? (
                  <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                ) : (
                  <Music2 className="h-5 w-5 text-vibe-text-muted" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4 fill-white text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-vibe-text-primary truncate">{pl.name}</p>
              <p className="text-xs text-vibe-text-muted mt-0.5">
                {pl.tracks.length} {pl.tracks.length === 1 ? "track" : "tracks"} · My playlist
              </p>
            </div>

            {/* Context menu trigger */}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity text-vibe-text-muted hover:text-white p-1"
              onClick={(e) => { e.stopPropagation(); setMenuId(menuId === pl.id ? null : pl.id) }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Inline context menu */}
            <AnimatePresence>
              {menuId === pl.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-3 top-full mt-1 z-20 bg-vibe-onyx-200 border border-vibe-onyx-400 rounded-lg shadow-xl py-1 w-44"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-vibe-red hover:bg-vibe-onyx-300 transition-colors"
                    onClick={() => { onDelete(pl.id); setMenuId(null) }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete playlist
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))
      )}
    </motion.div>
  )
}

// ── Playlist detail view ──────────────────────────────────
function PlaylistDetail({ playlist, onBack }: { playlist: Playlist; onBack: () => void }) {
  const dispatch = useAppDispatch()

  function playAll() {
    if (!playlist.tracks.length) return
    dispatch(playTrack({ track: playlist.tracks[0], queue: playlist.tracks }))
  }

  return (
    <motion.div
      key="playlist-detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-vibe-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-14 w-14 rounded-lg bg-vibe-onyx-400 shrink-0 overflow-hidden flex items-center justify-center">
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <Music2 className="h-6 w-6 text-vibe-text-muted" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-bold text-white truncate">{playlist.name}</h2>
            <p className="text-xs text-vibe-text-muted">{playlist.tracks.length} tracks</p>
          </div>
        </div>
        {playlist.tracks.length > 0 && (
          <Button size="sm" rounded="full" className="gap-2 shrink-0" onClick={playAll}>
            <Play className="h-3.5 w-3.5 fill-current" />
            Play all
          </Button>
        )}
      </div>

      {/* Track list */}
      {playlist.tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-vibe-text-muted">
          <Music2 className="h-10 w-10 opacity-30" />
          <p className="text-sm">No tracks yet</p>
          <p className="text-xs opacity-70 text-center px-8">
            Tracks you add to this playlist will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {playlist.tracks.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => dispatch(playTrack({ track, queue: playlist.tracks }))}
              className="flex items-center gap-4 w-full px-3 py-2.5 rounded-md hover:bg-vibe-onyx-300 transition-colors group text-left"
            >
              <span className="text-xs text-vibe-text-muted w-5 text-center shrink-0 tabular-nums">
                {idx + 1}
              </span>
              <div className="h-9 w-9 rounded-sm bg-vibe-onyx-400 shrink-0 overflow-hidden">
                {track.coverUrl
                  ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Music2 className="h-4 w-4 text-vibe-text-muted" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{track.title}</p>
                <p className="text-xs text-vibe-text-muted truncate">{track.artist}</p>
              </div>
              {track.duration > 0 && (
                <span className="text-xs text-vibe-text-muted tabular-nums shrink-0">
                  {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, "0")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Empty state illustration ──────────────────────────────
function AmberBoxIllustration() {
  return (
    <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 55 L60 70 L100 55 L100 90 L60 105 L20 90 Z" fill="#E8952A" />
      <path d="M20 55 L20 90 L60 105 L60 70 Z" fill="#C8771A" />
      <path d="M20 55 L60 40 L60 55 L20 55 Z" fill="#F4A435" />
      <path d="M60 40 L100 55 L60 55 Z" fill="#E8952A" />
      <path d="M20 55 L8 38 L48 24 L60 40 Z" fill="#F4A435" />
      <path d="M100 55 L112 38 L72 24 L60 40 Z" fill="#FBBC5A" />
      <line x1="60" y1="40" x2="60" y2="70" stroke="#C8771A" strokeWidth="1" />
      <path d="M100 55 L112 38 L92 30 L80 47 Z" fill="#FBCA6A" opacity="0.5" />
    </svg>
  )
}
