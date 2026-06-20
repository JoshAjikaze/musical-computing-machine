import { useState } from "react"
import { CheckCircle2, Download, Share2, SquarePlus, Smartphone } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePwaInstall } from "@/hooks/usePwaInstall"

export interface InstallAppDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Triggered from the Download links in Navbar and Footer. Behavior branches
 * on what the platform actually supports:
 *  - Android / desktop Chrome & Edge: native install prompt
 *  - iOS Safari: there's no programmatic install API at all — manual
 *    "Share → Add to Home Screen" steps
 *  - iOS Chrome/Firefox/etc: those can't install on iOS regardless, so we
 *    point the user to Safari
 *  - already installed: say so
 *  - everything else (desktop Firefox/Safari, or Chrome before its
 *    engagement heuristics fire): generic fallback guidance
 */
export function InstallAppDialog({ open, onClose }: InstallAppDialogProps) {
  const { state, promptInstall } = usePwaInstall()
  const [installing, setInstalling] = useState(false)

  const handleInstall = async () => {
    setInstalling(true)
    try {
      const outcome = await promptInstall()
      if (outcome === "accepted") {
        toast.success("Vibe Garage is installing…")
        onClose()
      } else if (outcome === "dismissed") {
        // user saw the native prompt and said no — leave the dialog open
      } else {
        toast.error("Install isn't available right now")
      }
    } finally {
      setInstalling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/pwa-icons/icon-192.png"
              alt=""
              className="h-12 w-12 rounded-xl shrink-0"
            />
            <div>
              <DialogTitle className="mb-0">Vibe Garage</DialogTitle>
              <p className="text-xs text-vibe-text-muted">Free • Installs in seconds</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-2">
          {state === "installed" && (
            <div className="flex items-start gap-3 text-sm text-vibe-text-secondary">
              <CheckCircle2 className="h-5 w-5 text-vibe-amber shrink-0 mt-0.5" />
              <p>You already have Vibe Garage installed. Look for it on your home screen or app launcher.</p>
            </div>
          )}

          {state === "installable" && (
            <DialogDescription>
              Get faster access, offline playback for recently played tracks, and notifications —
              right from your home screen.
            </DialogDescription>
          )}

          {state === "ios-safari" && (
            <div className="space-y-3 text-sm text-vibe-text-secondary">
              <p>Add Vibe Garage to your Home Screen:</p>
              <ol className="space-y-2.5">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vibe-onyx-300 text-xs font-semibold text-white">1</span>
                  <Share2 className="h-4 w-4 shrink-0 text-vibe-text-muted" />
                  <span>Tap the <strong className="text-white">Share</strong> icon in Safari's toolbar</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vibe-onyx-300 text-xs font-semibold text-white">2</span>
                  <SquarePlus className="h-4 w-4 shrink-0 text-vibe-text-muted" />
                  <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vibe-onyx-300 text-xs font-semibold text-white">3</span>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-vibe-text-muted" />
                  <span>Tap <strong className="text-white">Add</strong> to confirm</span>
                </li>
              </ol>
            </div>
          )}

          {state === "ios-other" && (
            <div className="flex items-start gap-3 text-sm text-vibe-text-secondary">
              <Smartphone className="h-5 w-5 text-vibe-text-muted shrink-0 mt-0.5" />
              <p>
                On iOS, apps can only be installed from <strong className="text-white">Safari</strong>.
                Open this page in Safari, then tap Share → Add to Home Screen.
              </p>
            </div>
          )}

          {state === "unsupported" && (
            <div className="flex items-start gap-3 text-sm text-vibe-text-secondary">
              <Smartphone className="h-5 w-5 text-vibe-text-muted shrink-0 mt-0.5" />
              <p>
                Open this page in <strong className="text-white">Chrome</strong>, <strong className="text-white">Edge</strong>, or
                another Chromium-based browser on desktop or Android, then look for the install icon
                in the address bar — or revisit this page in a moment, some browsers take a few
                seconds to offer it.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {state === "installable" ? (
            <Button onClick={handleInstall} loading={installing} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Install
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose} className="w-full">
              Got it
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
