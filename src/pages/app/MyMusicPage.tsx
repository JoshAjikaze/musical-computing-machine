import { useState } from "react"
import { MoreVertical } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { UploadPanel } from "@/components/app/UploadPanel"

// ── Mock data (matches design exactly) ───────────────────
const MY_ALBUMS = [
  {
    id: "a1",
    title: "XODUS",
    coverUrl: "https://picsum.photos/seed/xodus/300/300",
  },
  {
    id: "a2",
    title: "HARVEST",
    coverUrl: "https://picsum.photos/seed/harvest/300/300",
  },
]

// Total slots shown in the grid = 4 visible + scroll
const ALBUM_SLOT_COUNT = 4

const TOP_SINGLES = [
  { rank: 1, title: "Miles away",   artist: "Chalee Dip", coverUrl: "https://picsum.photos/seed/s1/40/40" },
  { rank: 2, title: "Kung Fu",      artist: "Chalee Dip", coverUrl: "https://picsum.photos/seed/s2/40/40" },
  { rank: 3, title: "Know ya",      artist: "Chalee Dip", coverUrl: "https://picsum.photos/seed/s3/40/40" },
  { rank: 4, title: "Standard",     artist: "Chalee Dip", coverUrl: "https://picsum.photos/seed/s4/40/40" },
  { rank: 5, title: "The Stimulus", artist: "Yknade",     coverUrl: "https://picsum.photos/seed/s5/40/40" },
]

export function MyMusicPage() {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <>
      <div className="px-4 md:px-8 py-6 space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">My music</h1>
            <p className="text-sm text-vibe-text-secondary mt-0.5">Manage your catalogue</p>
          </div>
          <Button size="default" rounded="full" onClick={() => setUploadOpen(true)} className="shrink-0">
            Upload music
          </Button>
        </div>

        {/* Albums + advert row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Albums section */}
          <div className="lg:col-span-2 rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-5">
              {/* Small album icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" className="text-vibe-amber">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
              <span className="text-sm font-medium text-vibe-text-secondary">My albums</span>
            </div>

            {/* Album grid — horizontal scroll on mobile */}
            <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex gap-4 pb-3">
              {/* Real albums */}
              {MY_ALBUMS.map((album) => (
                <AlbumCard key={album.id} title={album.title} coverUrl={album.coverUrl} />
              ))}
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, ALBUM_SLOT_COUNT - MY_ALBUMS.length) }).map((_, i) => (
                <EmptyAlbumSlot key={`empty-${i}`} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Advert placeholder */}
          <div className="hidden lg:flex rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 items-center justify-center min-h-[280px]">
            <span className="text-xs text-vibe-text-muted uppercase tracking-widest">Advert</span>
          </div>
        </div>

        {/* Top singles + advert row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top 5 Singles */}
          <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-vibe-text-muted">My Top 5 Singles</span>
              <button className="text-xs text-vibe-amber hover:text-vibe-amber-light transition-colors">
                View all
              </button>
            </div>

            <div className="space-y-1">
              {TOP_SINGLES.map((track) => (
                <div key={track.rank} className="flex items-center gap-3 py-2 group rounded-sm hover:bg-vibe-onyx-300 px-2 transition-colors cursor-pointer">
                  <span className="text-sm text-vibe-text-muted w-4 shrink-0">{track.rank}.</span>
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="h-8 w-8 rounded-sm object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-vibe-text-primary truncate leading-tight">{track.title}</p>
                    <p className="text-xs text-vibe-text-muted truncate">{track.artist}</p>
                  </div>
                  <button className="text-vibe-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Advert */}
          <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 flex items-center justify-center min-h-[200px]">
            <span className="text-xs text-vibe-text-muted uppercase tracking-widest">Advert</span>
          </div>
        </div>

      </div>

      <UploadPanel open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  )
}

// ── Album card ────────────────────────────────────────────
function AlbumCard({ title, coverUrl }: { title: string; coverUrl: string }) {
  return (
    <div className="shrink-0 w-[180px] md:w-[200px] cursor-pointer group">
      <div className="relative aspect-square rounded-md overflow-hidden mb-2">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Dark gradient overlay at bottom for title legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <p className="absolute bottom-2 left-0 right-0 text-center text-sm font-heading font-semibold text-white tracking-widest uppercase px-2 truncate">
          {title}
        </p>
      </div>
    </div>
  )
}

// ── Empty album slot ──────────────────────────────────────
function EmptyAlbumSlot() {
  return (
    <div className="shrink-0 w-[180px] md:w-[200px]">
      <div className="aspect-square rounded-md border border-vibe-onyx-400 bg-vibe-onyx-300 flex items-center justify-center">
        <span className="text-sm text-vibe-text-muted">Empty</span>
      </div>
    </div>
  )
}
