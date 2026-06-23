import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setCredentials, sessionExpired } from "@/store/slices/authSlice"
import { vibeApi, normaliseUser } from "@/store/api/vibeApi"

/**
 * Mounted once at the app root (see App.tsx). Handles two cases that
 * combine to cause "random" logouts on the PWA:
 *
 * 1. BOOT-TIME VALIDATION
 *    authSlice now reads the persisted token from localStorage synchronously
 *    so ProtectedRoute doesn't flash a redirect on every reload. But that
 *    token may have already expired while the app was closed (common on a
 *    PWA opened after days away). This component fires a GET /auth/me ping
 *    on mount: if it comes back 401, sessionExpired() clears the stale
 *    session and sends the user to /login with a clear explanation; if it
 *    comes back 200 it refreshes the user profile in Redux so the UI always
 *    reflects the latest server-side user data, not a days-old cached copy.
 *
 * 2. VISIBILITY-CHANGE REVALIDATION
 *    PWAs are suspended in the background by iOS/Android and can stay there
 *    for hours. When the user brings the app back to the foreground the JS
 *    resumes from wherever it paused — no page reload, no boot-time check.
 *    This listens for document.visibilitychange and re-pings /auth/me each
 *    time the app becomes visible, so an expired token is caught the moment
 *    the user opens the app again rather than mid-navigation.
 *
 * Both paths hit the same endpoint; RTK Query caches the result (tagged
 * 'User') so the ping is free on a warm cache and only costs a real network
 * round-trip when the cached entry is stale — which is exactly when it matters.
 */
export function AuthGuard() {
  const dispatch = useAppDispatch()
  const { token, isAuthenticated } = useAppSelector((s) => s.auth)
  const [triggerGetCurrentUser] = vibeApi.useLazyGetCurrentUserQuery()
  const lastCheckRef = useRef<number>(0)

  async function validateToken() {
    if (!token || !isAuthenticated) return

    // Throttle to one check per minute — visibilitychange can fire rapidly
    // (e.g. alt-tab) and we don't want to DDoS /auth/me
    const now = Date.now()
    if (now - lastCheckRef.current < 60_000) return
    lastCheckRef.current = now

    try {
      const result = await triggerGetCurrentUser()
      if (result.error) {
        // triggerGetCurrentUser is lazy — 401s here don't go through
        // baseQueryWithAuth's automatic sessionExpired dispatch, so we
        // handle it manually.
        if ('status' in result.error && result.error.status === 401) {
          dispatch(sessionExpired())
        }
      } else if (result.data) {
        // Refresh the Redux user profile with the latest server-side data
        dispatch(setCredentials({ user: normaliseUser(result.data), token: token! }))
      }
    } catch {
      // Network offline — don't log out, just let the user continue on the
      // cached state. The next successful API call that returns 401 will
      // trigger sessionExpired() via baseQueryWithAuth instead.
    }
  }

  // Boot-time check
  useEffect(() => {
    validateToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Foreground-resume check
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") validateToken()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated])

  return null
}
