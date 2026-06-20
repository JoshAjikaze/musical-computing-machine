import { useCallback, useEffect, useState } from "react"

/**
 * `beforeinstallprompt` isn't in lib.dom.d.ts yet — every browser that
 * supports it (Chrome, Edge, Android browsers) agrees on this shape.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): Promise<void>
}

export type PwaInstallState =
  | "installed"     // already running as the installed app
  | "installable"   // we captured a real beforeinstallprompt — can prompt natively
  | "ios-safari"    // iOS Safari — only path is the manual Share → Add to Home Screen
  | "ios-other"     // iOS but Chrome/Firefox/etc — those can't install at all on iOS
  | "unsupported"   // desktop Firefox/Safari, or Chrome before its heuristics fire

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  // iPadOS 13+ identifies as "MacIntel" — touch points is the tell.
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || isIPadOS
}

function detectIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  // Every iOS browser is WebKit under the hood, but only Safari itself can
  // add a site to the home screen — Chrome/Firefox/Edge-on-iOS cannot,
  // regardless of how "Chrome-like" their UI is.
  return detectIOS() && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(detectStandalone())

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!deferredPrompt) return "unavailable"
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome
  }, [deferredPrompt])

  const state: PwaInstallState = isInstalled
    ? "installed"
    : deferredPrompt
    ? "installable"
    : detectIOSSafari()
    ? "ios-safari"
    : detectIOS()
    ? "ios-other"
    : "unsupported"

  return { state, promptInstall }
}
