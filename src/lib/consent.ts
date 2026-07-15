/**
 * Ad consent — local persistence for the personalized-vs-non-personalized
 * ads choice, read by lib/adsense.ts before ads are requested.
 *
 * NOTE: this banner is shown to everyone, not geo-restricted to EU/UK
 * visitors. That's the deliberately simple, always-compliant option —
 * geo-targeting it would need a geo-IP lookup (e.g. via Cloudflare/Netlify
 * headers or a geolocation API) that isn't wired up yet. Swap in geo logic
 * here later if you want the banner to only show for EU/UK traffic.
 */

export type AdConsent = 'personalized' | 'non-personalized'

const STORAGE_KEY = 'vg_ad_consent'

export function getStoredAdConsent(): AdConsent | null {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(STORAGE_KEY)
  return v === 'personalized' || v === 'non-personalized' ? v : null
}

export function setStoredAdConsent(consent: AdConsent) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, consent)
}
