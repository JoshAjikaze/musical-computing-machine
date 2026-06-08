import { useState, useRef } from "react"
import { ImagePlus, Loader2, Music2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppDispatch } from "@/hooks/redux"
import { addPlaylist, setPlaylistCover } from "@/store/slices/playlistSlice"
import {
  useCreatePlaylistMutation,
  useUploadPlaylistCoverMutation,
} from "@/store/api/vibeApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onClose: () => void
}

export function CreatePlaylistDialog({ open, onClose }: Props) {
  const dispatch = useAppDispatch()

  const [name, setName]             = useState("")
  const [coverFile, setCoverFile]   = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [createPlaylist, { isLoading: isCreating }] = useCreatePlaylistMutation()
  const [uploadCover,    { isLoading: isUploading }] = useUploadPlaylistCoverMutation()

  const isBusy = isCreating || isUploading

  function handleCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return

    try {
      // 1 — create playlist
      const res = await createPlaylist({ name: trimmed }).unwrap() as { id?: string; playlist_id?: string }
      const id  = (res as Record<string, unknown>)?.id as string
               ?? (res as Record<string, unknown>)?.playlist_id as string
               ?? crypto.randomUUID()

      dispatch(addPlaylist({ id, name: trimmed }))

      // 2 — optionally upload cover
      if (coverFile) {
        const fd = new FormData()
        fd.append("file", coverFile)
        await uploadCover({ playlist_id: id, file: fd }).unwrap()
        if (coverPreview) dispatch(setPlaylistCover({ id, coverUrl: coverPreview }))
      }

      toast.success(`"${trimmed}" created`)
      handleClose()
    } catch {
      toast.error("Could not create playlist. Please try again.")
    }
  }

  function handleClose() {
    if (isBusy) return
    setName("")
    setCoverFile(null)
    setCoverPreview(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cpd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            key="cpd-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "fixed z-50 inset-0 m-auto",
              "w-full max-w-sm h-fit",
              "bg-vibe-onyx-100 border border-vibe-onyx-400 rounded-xl shadow-2xl",
              "p-6 flex flex-col gap-5"
            )}
          >
            <h2 className="font-heading text-lg font-semibold text-white">New playlist</h2>

            {/* Cover art picker */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "mx-auto flex flex-col items-center justify-center gap-2",
                "w-28 h-28 rounded-xl border-2 border-dashed",
                "transition-colors duration-150",
                coverPreview
                  ? "border-transparent"
                  : "border-vibe-onyx-400 hover:border-vibe-text-muted",
                "overflow-hidden relative group"
              )}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <ImagePlus className="h-5 w-5 text-white" />
                    <span className="text-[10px] text-white">Change</span>
                  </div>
                </>
              ) : (
                <>
                  <Music2 className="h-7 w-7 text-vibe-text-muted" />
                  <span className="text-[10px] text-vibe-text-muted text-center leading-tight px-1">
                    Add cover
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPick}
            />

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="text-xs text-vibe-text-muted font-medium">Playlist name</label>
              <Input
                placeholder="My playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                maxLength={80}
                autoFocus
              />
              <p className="text-right text-[10px] text-vibe-text-muted">{name.length}/80</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                size="default"
                rounded="full"
                className="flex-1"
                onClick={handleClose}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                size="default"
                rounded="full"
                className="flex-1"
                onClick={handleSubmit}
                disabled={!name.trim() || isBusy}
              >
                {isBusy
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Creating…</>
                  : "Create"
                }
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
