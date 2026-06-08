/**
 * QueuePanel
 * Slides in from the right over the PlayerBar area.
 * Shows the current track + upcoming queue.
 * Toggled via Redux isQueueVisible.
 */
import { X, Music2, GripVertical } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { toggleQueuePanel, playTrack } from "@/store/slices/playerSlice"
import { cn } from "@/lib/utils"

export function QueuePanel() {
  const dispatch = useAppDispatch()
  const { isQueueVisible, currentTrack, queue, queueIndex } = useAppSelector((s) => s.player)

  const upNext = queue.slice(queueIndex + 1)
  const played = queue.slice(0, queueIndex)

  return (
    <AnimatePresence>
      {isQueueVisible && (
        <>
          {/* Backdrop — only on mobile */}
          <motion.div
            key="queue-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => dispatch(toggleQueuePanel())}
          />

          {/* Panel */}
          <motion.div
            key="queue-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "fixed bottom-[61px] right-0 z-40",
              "w-full md:w-80 lg:w-96",
              "bg-vibe-onyx-100 border-t border-l border-vibe-onyx-400",
              "flex flex-col",
              "max-h-[70vh] md:max-h-[60vh]",
              "shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-vibe-onyx-400 shrink-0">
              <h3 className="font-heading text-sm font-semibold text-white">Queue</h3>
              <button
                onClick={() => dispatch(toggleQueuePanel())}
                className="text-vibe-text-muted hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-vibe">

              {/* Now playing */}
              {currentTrack && (
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[10px] font-medium text-vibe-text-muted uppercase tracking-widest mb-2">
                    Now playing
                  </p>
                  <QueueTrackRow
                    track={currentTrack}
                    isActive
                    onClick={() => {}}
                  />
                </div>
              )}

              {/* Up next */}
              {upNext.length > 0 && (
                <div className="px-4 pt-3 pb-2">
                  <p className="text-[10px] font-medium text-vibe-text-muted uppercase tracking-widest mb-2">
                    Up next
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {upNext.map((track) => (
                      <QueueTrackRow
                        key={track.id}
                        track={track}
                        onClick={() => dispatch(playTrack({ track, queue }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Previously played */}
              {played.length > 0 && (
                <div className="px-4 pt-3 pb-4">
                  <p className="text-[10px] font-medium text-vibe-text-muted uppercase tracking-widest mb-2">
                    Previously played
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {played.map((track) => (
                      <QueueTrackRow
                        key={track.id}
                        track={track}
                        muted
                        onClick={() => dispatch(playTrack({ track, queue }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!currentTrack && queue.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-vibe-text-muted">
                  <Music2 className="h-10 w-10 opacity-30" />
                  <p className="text-sm">Queue is empty</p>
                  <p className="text-xs text-center px-8 opacity-70">
                    Play a song to start filling your queue
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Single row in the queue ───────────────────────────────
function QueueTrackRow({
  track,
  isActive = false,
  muted = false,
  onClick,
}: {
  track: { id: string; title: string; artist: string; coverUrl: string; duration: number }
  isActive?: boolean
  muted?: boolean
  onClick: () => void
}) {
  function fmt(s: number) {
    if (!s) return ""
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-2 py-2 rounded-md text-left transition-colors",
        isActive
          ? "bg-vibe-onyx-300"
          : "hover:bg-vibe-onyx-300/60",
        muted && "opacity-40"
      )}
    >
      {/* Drag handle — decorative */}
      <GripVertical className="h-3.5 w-3.5 text-vibe-text-muted shrink-0 opacity-50" />

      {/* Cover */}
      <div className="shrink-0 relative">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="h-8 w-8 rounded-sm object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-sm bg-vibe-onyx-400 flex items-center justify-center">
            <Music2 className="h-3.5 w-3.5 text-vibe-text-muted" />
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 rounded-sm bg-black/40 flex items-center justify-center">
            <div className="flex items-end gap-[2px] h-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-[2px] bg-vibe-red rounded-full"
                  animate={{ height: ["3px", "10px", "5px", "8px", "3px"] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xs font-medium truncate",
          isActive ? "text-vibe-red" : "text-white"
        )}>
          {track.title}
        </p>
        <p className="text-[10px] text-vibe-text-muted truncate">{track.artist}</p>
      </div>

      {/* Duration */}
      {track.duration > 0 && (
        <span className="text-[10px] text-vibe-text-muted tabular-nums shrink-0">
          {fmt(track.duration)}
        </span>
      )}
    </button>
  )
}
