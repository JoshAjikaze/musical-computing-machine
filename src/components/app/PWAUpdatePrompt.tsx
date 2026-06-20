import { useEffect } from "react"
import { toast } from "sonner"
import { useRegisterSW } from "virtual:pwa-register/react"

/**
 * Mounts once at the app root (see App.tsx). Wires vite-plugin-pwa's
 * registration lifecycle (registerType: 'prompt') into the app's existing
 * Sonner toast conventions instead of silently auto-updating mid-session
 * or doing nothing.
 */
export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Poll for an updated worker periodically while the tab stays open —
      // otherwise updates are only ever checked for on full page load.
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error("[PWA] Service worker registration failed:", error)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      toast.success("Vibe Garage is ready to work offline", { duration: 4000 })
      setOfflineReady(false)
    }
  }, [offlineReady, setOfflineReady])

  useEffect(() => {
    if (needRefresh) {
      toast("A new version of Vibe Garage is available", {
        duration: Infinity,
        action: {
          label: "Refresh",
          onClick: () => updateServiceWorker(true),
        },
      })
    }
  }, [needRefresh, updateServiceWorker])

  return null
}
