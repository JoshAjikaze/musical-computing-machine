import { useState, useRef, useLayoutEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { MoreVertical } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export interface TableAction {
  label:  string
  icon:   React.ElementType
  color?: string
  onClick: () => void
}

interface TableRowActionsProps {
  actions: TableAction[]
}

/**
 * Dropdown that portals to document.body so it is never clipped
 * by overflow:hidden on table wrappers.
 */
export function TableRowActions({ actions }: TableRowActionsProps) {
  const [open, setOpen]           = useState(false)
  const [coords, setCoords]       = useState({ top: 0, left: 0 })
  const buttonRef                 = useRef<HTMLButtonElement>(null)

  const reposition = useCallback(() => {
    if (!buttonRef.current) return
    const r = buttonRef.current.getBoundingClientRect()
    // Prefer opening downward; if not enough space below, open upward
    const menuH  = actions.length * 40 + 8
    const spaceBelow = window.innerHeight - r.bottom
    const top = spaceBelow >= menuH ? r.bottom + 4 : r.top - menuH - 4
    // Prefer right-aligned; clamp so it never overflows right edge
    const menuW = 144  // w-36
    const left  = Math.min(r.right - menuW, window.innerWidth - menuW - 8)
    setCoords({ top, left })
  }, [actions.length])

  const handleOpen = () => {
    reposition()
    setOpen(true)
  }

  // Close on scroll / resize
  useLayoutEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="p-1.5 text-vibe-text-muted hover:text-white rounded-sm hover:bg-vibe-onyx-400 transition-colors"
        aria-label="Row actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && createPortal(
        <>
          {/* Click-away layer */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpen(false)}
          />
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.12 } }}
              exit={   { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.1  } }}
              style={{ top: coords.top, left: coords.left }}
              className="fixed z-[9999] w-36 bg-vibe-onyx-200 border border-vibe-onyx-400 rounded-md shadow-xl"
            >
              {actions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => { setOpen(false); a.onClick() }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors hover:bg-vibe-onyx-300 first:rounded-t-md last:rounded-b-md ${a.color ?? "text-vibe-text-secondary hover:text-white"}`}
                >
                  <a.icon className="h-3.5 w-3.5 shrink-0" />
                  {a.label}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  )
}
