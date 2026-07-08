/// <reference lib="webworker" />
/**
 * Vibe Garage service worker.
 *
 * Built via vite-plugin-pwa's `injectManifest` strategy — `self.__WB_MANIFEST`
 * below gets replaced at build time with the real precache list. We write the
 * rest by hand because we need custom push-notification handlers and a
 * hand-tuned audio caching strategy that `generateSW` can't give us.
 */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { RangeRequestsPlugin } from 'workbox-range-requests'

declare const self: ServiceWorkerGlobalScope

// ─────────────────────────────────────────────────────────
// App shell — precache + offline fallback for navigations
// ─────────────────────────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))

clientsClaim()

// Only activate a waiting worker when the client explicitly asks (see
// PWAUpdatePrompt.tsx) — registerType is 'prompt', not 'autoUpdate', so we
// never interrupt someone mid-session with a surprise reload.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// ─────────────────────────────────────────────────────────
// Audio — "recently played" cache
//
// CacheFirst + RangeRequestsPlugin is Workbox's documented recipe for
// scrubbable cached media: the audio element seeks via HTTP Range requests,
// and RangeRequestsPlugin slices the full cached response to satisfy them.
// One real-world caveat: this only works once a *full* 200 response has been
// cached. If the very first request for a track already carries a Range
// header (some browsers do this for preload="metadata"), that response comes
// back 206 and — per CacheableResponsePlugin's statuses:[200] — is not
// stored. In practice the track still gets cached on a subsequent full
// fetch (e.g. on play), so this self-heals after the first listen.
// ─────────────────────────────────────────────────────────
registerRoute(
  ({ request, url }) =>
    request.destination === 'audio' && url.hostname.endsWith('supabase.co'),
  new CacheFirst({
    cacheName: 'vibe-garage-audio',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 30, // ~last 30 tracks played, oldest evicted first
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  })
)

// ─────────────────────────────────────────────────────────
// Google AdSense — never cache. Registered ahead of the image/API rules
// below (Workbox matches routes in registration order, first match wins)
// so an ad request never falls through to the generic image
// StaleWhileRevalidate rule. Ads must always be fetched fresh, and
// caching third-party ad responses violates AdSense policy anyway — this
// is a deliberate passthrough, not a caching strategy.
// ─────────────────────────────────────────────────────────
const ADSENSE_HOSTNAMES = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'googletagservices.com',
]

registerRoute(
  ({ url }) => ADSENSE_HOSTNAMES.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)),
  new NetworkOnly()
)

// ─────────────────────────────────────────────────────────
// Cover art / avatars — stale-while-revalidate (instant from cache,
// refreshed in the background)
// ─────────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'vibe-garage-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 14 * 24 * 60 * 60 }),
    ],
  })
)

// ─────────────────────────────────────────────────────────
// API GETs — network-first so data is always fresh when online, with a
// short timeout that falls back to cache when offline/flaky. Never touches
// POST/PATCH/PUT/DELETE — those should always hit the network or fail
// loudly, never be served stale.
// ─────────────────────────────────────────────────────────
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'https://vibegarage-backend.onrender.com'
const API_ORIGIN = new URL(API_BASE).origin

registerRoute(
  ({ url, request }) => url.origin === API_ORIGIN && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'vibe-garage-api',
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  })
)

// ─────────────────────────────────────────────────────────
// Push notifications
// ─────────────────────────────────────────────────────────
interface PushPayload {
  title?: string
  body?: string
  icon?: string
  url?: string
  tag?: string
}

self.addEventListener('push', (event: PushEvent) => {
  let data: PushPayload = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data?.text() ?? '' }
  }

  const title = data.title ?? 'Vibe Garage'
  const options: NotificationOptions = {
    body: data.body ?? '',
    icon: data.icon ?? '/pwa-icons/icon-192.png',
    badge: '/pwa-icons/icon-192.png',
    tag: data.tag,
    data: { url: data.url ?? '/listen' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data?.url as string) ?? '/listen'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(url))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
