/**
 * AlbumDetailsDialog — GET /albums/{album_id} + DELETE /albums/{album_id}
 *
 * Opened from an album card. Fetches the full album (title + track list) on
 * open, and lets the artist delete the album with a one-tap-to-arm,
 * one-tap-to-confirm pattern (mirrors the inline delete confirms used
 * elsewhere in the app, just inside a dialog instead of a popover menu).
 */

import { useEffect, useState } from "react"
import { Music2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGetAlbumByIdQuery, useDeleteAlbumMutation } from "@/store/api/vibeApi"
import { assetUrl } from "@/lib/utils"

export interface AlbumDetailsDialogProps {
  albumId: string | null
  open: boolean
  onClose: () => void
}

export function AlbumDetailsDialog({ albumId, open, onClose }: AlbumDetailsDialogProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { data: album, isLoading, isError } = useGetAlbumByIdQuery(albumId ?? "", {
    skip: !albumId || !open,
  })
  const [deleteAlbum, { isLoading: isDeleting }] = useDeleteAlbumMutation()

  // Reset the armed "confirm delete" state whenever a different album opens
  useEffect(() => {
    if (open) setConfirmingDelete(false)
  }, [open, albumId])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setConfirmingDelete(false)
      onClose()
    }
  }

  const handleDeleteClick = async () => {
    if (!albumId) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    try {
      await deleteAlbum(albumId).unwrap()
      toast.success("Album deleted")
      setConfirmingDelete(false)
      onClose()
    } catch {
      toast.error("Couldn't delete album. Please try again.")
      setConfirmingDelete(false)
    }
  }

  const trackCount = album?.tracks?.length ?? 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isLoading ? "Loading album…" : album?.title || "Album"}</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Fetching track list"
              : isError
                ? "Couldn't load this album's details"
                : `${trackCount} ${trackCount === 1 ? "track" : "tracks"}`}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 max-h-80 overflow-y-auto space-y-1">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-11 rounded-md bg-vibe-onyx-300 animate-pulse" />
            ))
          ) : isError ? (
            <p className="text-sm text-vibe-text-muted py-4">
              Something went wrong loading this album. Please try again.
            </p>
          ) : trackCount === 0 ? (
            <p className="text-sm text-vibe-text-muted py-4">No tracks in this album yet.</p>
          ) : (
            album!.tracks.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-vibe-onyx-300 transition-colors"
              >
                <span className="text-xs text-vibe-text-muted w-4 shrink-0">{i + 1}.</span>
                <div className="h-9 w-9 rounded-sm overflow-hidden shrink-0 bg-vibe-onyx-400 flex items-center justify-center">
                  {t.cover_path ? (
                    <img
                      src={assetUrl(t.cover_path)}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music2 className="h-3.5 w-3.5 text-vibe-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-vibe-text-primary truncate">{t.title}</p>
                  {t.genre && <p className="text-xs text-vibe-text-muted truncate">{t.genre}</p>}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            loading={isDeleting}
            disabled={isLoading}
          >
            {isDeleting ? "Deleting…" : confirmingDelete ? "Confirm delete" : "Delete album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
