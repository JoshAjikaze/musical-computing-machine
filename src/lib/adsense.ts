/**
 * Google AdSense — config + script loader.
 *
 * Deliberately a no-op everywhere until VITE_ADSENSE_PUBLISHER_ID is set
 * (local dev, or before the site is AdSense-approved): AdSlot renders
 * nothing and loadAdSenseScript() never injects the script tag. This means
 * shipping this code is safe today and "turns on" the moment a real
 * publisher ID is added to the environment — no code change needed.
 *
 * NOTE: getting a publisher ID requires an approved AdSense account on the
 * live, deployed site (see the requirements list this was scoped from).
 * There's no real ID to bake in here.
 */

export const ADSENSE_PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID as string | undefined

export const isAdSenseConfigured = !!ADSENSE_PUBLISHER_ID?.trim()

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

let scriptRequested = false

/**
 * Injects the AdSense loader script once, app-wide. Safe to call multiple
 * times — only the first call (with a configured publisher ID) does
 * anything. Call this once near the app root, not per-component.
 */
export function loadAdSenseScript() {
  if (scriptRequested || !isAdSenseConfigured || typeof document === 'undefined') return
  scriptRequested = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}
