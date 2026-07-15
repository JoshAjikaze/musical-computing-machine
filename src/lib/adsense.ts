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
import { getStoredAdConsent, setStoredAdConsent, type AdConsent } from './consent'

export const ADSENSE_PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID as string | undefined

export const isAdSenseConfigured = !!ADSENSE_PUBLISHER_ID?.trim()

declare global {
  interface Window {
    // Loosely typed as `any` — this is Google's own ad-queue array, which
    // also carries extra flags (requestNonPersonalizedAds) set directly on
    // the same object. Not worth a stricter type for a third-party global
    // we don't control the shape of.
    adsbygoogle: any
  }
}

/**
 * Ensures window.adsbygoogle exists and carries the current consent choice
 * BEFORE anything pushes to it. Idempotent — safe to call from both
 * loadAdSenseScript() and every AdSlot mount, regardless of which runs
 * first (React doesn't guarantee parent-before-child effect order).
 *
 * Defaults to non-personalized ads (requestNonPersonalizedAds = 1) until
 * the person has explicitly chosen "personalized" via ConsentBanner — a
 * no-consent-yet state should never mean "assume it's fine to personalize".
 * This is Google's documented lightweight alternative to a full CMP
 * integration (see: "Restrict data processing" / non-personalized ads).
 */
export function ensureAdsQueue() {
  if (typeof window === 'undefined') return
  window.adsbygoogle = window.adsbygoogle || []
  const consent = getStoredAdConsent()
  window.adsbygoogle.requestNonPersonalizedAds = consent === 'personalized' ? 0 : 1
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
  ensureAdsQueue()

  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

/**
 * Called by ConsentBanner when the person makes a choice. Persists it and
 * updates the live flag immediately — takes effect for ad requests made
 * from this point on. Slots already rendered before the choice was made
 * aren't retroactively swapped (AdSense doesn't support that mid-session);
 * in practice the banner shows before any ad has had a chance to load.
 */
export function updateAdConsent(consent: AdConsent) {
  setStoredAdConsent(consent)
  ensureAdsQueue()
}

