import { useState } from "react"
import { MoreVertical, Music2, TrendingUp } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { UploadPanel } from "@/components/app/UploadPanel"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { playTrack } from "@/store/slices/playerSlice"
import { useGetMyTracksQuery, normaliseTrack } from "@/store/api/vibeApi"
import { cn } from "@/lib/utils"

const ALBUM_SLOT_COUNT = 4

export function MyMusicPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const dispatch = useAppDispatch()

  const { data: rawTracks = [], isLoading } = useGetMyTracksQuery()
  const { user } = useAppSelector((s) => s.auth)
  // Use stage name → display name → username as the artist label on own tracks
  const artistLabel = user?.stageName || user?.displayName || user?.username || ""
  const tracks = rawTracks.map((t) => normaliseTrack(t, artistLabel))

  // Sort by plays descending for the "Top 5" list
  const topFive = [...tracks].sort((a, b) => b.playCount - a.playCount).slice(0, 5)

  // Group unique albums (by album title, since some may share)
  const albumMap = new Map<string, { title: string; coverUrl: string }>()
  rawTracks.forEach((t) => {
    if (t.album && t.album !== "Single" && !albumMap.has(t.album)) {
      albumMap.set(t.album, { title: t.album, coverUrl: t.cover_path ?? "" })
    }
  })
  const albums = Array.from(albumMap.values())

  return (
    <>
      <div className="px-4 md:px-8 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">My music</h1>
            <p className="text-sm text-vibe-text-secondary mt-0.5">Manage your catalogue</p>
          </div>
          <Button size="default" rounded="full" onClick={() => setUploadOpen(true)} className="shrink-0">
            Upload music
          </Button>
        </div>

        {/* Albums + advert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
            <div className="flex items-center gap-2 mb-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" className="text-vibe-amber">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <span className="text-sm font-medium text-vibe-text-secondary">My albums</span>
            </div>
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex gap-4 pb-3">
                {isLoading
                  ? Array.from({ length: ALBUM_SLOT_COUNT }).map((_, i) => (
                      <div key={i} className="shrink-0 w-[180px] aspect-square rounded-md bg-vibe-onyx-300 animate-pulse" />
                    ))
                  : <>
                      {albums.map((a) => (
                        <AlbumCard key={a.title} title={a.title} coverUrl={a.coverUrl} />
                      ))}
                      {Array.from({ length: Math.max(0, ALBUM_SLOT_COUNT - albums.length) }).map((_, i) => (
                        <EmptyAlbumSlot key={`e-${i}`} />
                      ))}
                    </>
                }
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="hidden lg:flex rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 items-center justify-center min-h-[280px]">
            <span className="text-xs text-vibe-text-muted uppercase tracking-widest">Advert</span>
          </div>
        </div>

        {/* Top singles + advert */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-vibe-text-muted">My Top 5 Singles</span>
              <button className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">
                View all
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-sm bg-vibe-onyx-400 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 rounded bg-vibe-onyx-400 animate-pulse" />
                      <div className="h-2.5 w-20 rounded bg-vibe-onyx-300 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topFive.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-vibe-text-muted">
                <Music2 className="h-8 w-8 opacity-30" />
                <p className="text-xs">No tracks uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {topFive.map((track, i) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 py-2 group rounded-sm hover:bg-vibe-onyx-300 px-2 transition-colors cursor-pointer"
                    onClick={() => dispatch(playTrack({ track, queue: tracks }))}
                  >
                    <span className="text-sm text-vibe-text-muted w-4 shrink-0">{i + 1}.</span>
                    <div className="relative h-8 w-8 rounded-sm overflow-hidden shrink-0">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-vibe-onyx-400 flex items-center justify-center">
                          <Music2 className="h-3.5 w-3.5 text-vibe-text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-vibe-text-primary truncate leading-tight">{track.title}</p>
                      <p className="text-xs text-vibe-text-muted truncate">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {track.playCount > 0 && (
                        <span className="text-xs text-vibe-text-muted tabular-nums hidden sm:flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {track.playCount.toLocaleString()}
                        </span>
                      )}
                      <button
                        className="text-vibe-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 flex items-center justify-center min-h-[200px]">
            <span className="text-xs text-vibe-text-muted uppercase tracking-widest">Advert</span>
          </div>
        </div>

        {/* All tracks table */}
        {!isLoading && tracks.length > 0 && (
          <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-vibe-text-secondary">All tracks</span>
              <span className="text-xs text-vibe-text-muted">{tracks.length} total</span>
            </div>
            <div className="space-y-0.5">
              {tracks.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => dispatch(playTrack({ track, queue: tracks }))}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-md hover:bg-vibe-onyx-300 transition-colors cursor-pointer group"
                >
                  <span className="text-xs text-vibe-text-muted w-5 text-center tabular-nums shrink-0">
                    {idx + 1}
                  </span>
                  <div className="h-9 w-9 rounded-sm overflow-hidden shrink-0">
                    {track.coverUrl
                      ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-vibe-onyx-400 flex items-center justify-center">
                          <Music2 className="h-3.5 w-3.5 text-vibe-text-muted" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{track.title}</p>
                    <p className="text-xs text-vibe-text-muted truncate">{track.genre || track.album}</p>
                  </div>
                  <div className={cn("hidden sm:flex items-center gap-1 text-xs tabular-nums", track.isLiked ? "text-vibe-red" : "text-vibe-text-muted")}>
                    ♥ {track.likeCount}
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-xs text-vibe-text-muted tabular-nums">
                    ▶ {track.playCount}
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-vibe-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <UploadPanel open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  )
}

function AlbumCard({ title, coverUrl }: { title: string; coverUrl: string }) {
  return (
    <div className="shrink-0 w-[180px] md:w-[200px] cursor-pointer group">
      <div className="relative aspect-square rounded-md overflow-hidden mb-2">
        {coverUrl ? (
          <img src={coverUrl} alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-vibe-onyx-400 flex items-center justify-center">
            <Music2 className="h-8 w-8 text-vibe-text-muted opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <p className="absolute bottom-2 left-0 right-0 text-center text-sm font-heading font-semibold text-white tracking-widest uppercase px-2 truncate">
          {title}
        </p>
      </div>
    </div>
  )
}

function EmptyAlbumSlot() {
  return (
    <div className="shrink-0 w-[180px] md:w-[200px]">
      <div className="aspect-square rounded-md border border-vibe-onyx-400 bg-vibe-onyx-300 flex items-center justify-center">
        <span className="text-sm text-vibe-text-muted">Empty</span>
      </div>
    </div>
  )
}
