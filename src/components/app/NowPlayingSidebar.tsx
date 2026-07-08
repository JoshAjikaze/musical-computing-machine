/**
 * NowPlayingSidebar
 * Docked panel showing the full now-playing UI (art, controls, progress,
 * volume) without leaving the current route — toggled from PlayerBar
 * instead of navigating to /listen/now-playing. Mounted in both
 * UserLayout and AppLayout, same pattern as QueuePanel.
 */
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { toggleNowPlayingPanel } from "@/store/slices/playerSlice"
import { NowPlayingBody } from "@/pages/user/NowPlayingPage"

export function NowPlayingSidebar() {
  const dispatch = useAppDispatch()
  const isVisible = useAppSelector((s) => s.player.isNowPlayingVisible)

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop — only on mobile, where the panel is full-width */}
          <motion.div
            key="now-playing-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => dispatch(toggleNowPlayingPanel())}
          />

          {/* Panel */}
          <motion.div
            key="now-playing-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-16 bottom-[61px] right-0 z-40 w-full md:w-[420px] bg-vibe-onyx border-l border-vibe-onyx-400 shadow-2xl overflow-y-auto scrollbar-vibe"
          >
            <NowPlayingBody onClose={() => dispatch(toggleNowPlayingPanel())} className="min-h-full" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
