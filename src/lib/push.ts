/**
 * Web Push utilities.
 *
 * Browser support notes (this matters a lot on "mobile" specifically):
 *  - Android Chrome/Firefox: full support, works whether or not the PWA
 *    has been "installed" to the home screen.
 *  - iOS Safari: push notifications only work once the app has been
 *    added to the home screen (Share → Add to Home Screen) AND the
 *    device is on iOS 16.4+. There is no API to detect "installed" state
 *    reliably, so isPushSupported() will return true on capable iOS
 *    versions even if the user is in the regular Safari tab — the actual
 *    subscribe() call will reject in that case and the UI should treat
 *    that rejection as "ask the user to add to home screen first".
 */

/** Convert a URL-safe base64 VAPID public key into the Uint8Array pushManager.subscribe() expects. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export interface SerializedPushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

function serializeSubscription(sub: PushSubscription): SerializedPushSubscription {
  const json = sub.toJSON()
  return {
    endpoint: json.endpoint!,
    keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
  }
}

/**
 * Request Notification permission (if not already decided) and subscribe
 * via the active service worker registration. Returns null if unsupported,
 * permission was denied, or no VAPID key is configured.
 */
export async function subscribeToPush(
  vapidPublicKey: string | undefined
): Promise<SerializedPushSubscription | null> {
  if (!isPushSupported() || !vapidPublicKey) return null

  const permission = await Notification.requestPermission()
  if (permission !== "granted") return null

  const registration = await navigator.serviceWorker.ready

  const existing = await registration.pushManager.getSubscription()
  if (existing) return serializeSubscription(existing)

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as ArrayBuffer,
  })

  return serializeSubscription(subscription)
}

export async function getExistingPushSubscription(): Promise<SerializedPushSubscription | null> {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  return existing ? serializeSubscription(existing) : null
}

export async function unsubscribeFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (!existing) return null
  const endpoint = existing.endpoint
  await existing.unsubscribe()
  return endpoint
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported"
  return Notification.permission
}
