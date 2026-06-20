import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingPushSubscription,
  getNotificationPermission,
} from "@/lib/push"
import { useSubscribePushMutation, useUnsubscribePushMutation } from "@/store/api/vibeApi"

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function usePushNotifications() {
  const [subscribePush] = useSubscribePushMutation()
  const [unsubscribePush] = useUnsubscribePushMutation()

  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const supported = isPushSupported()

  useEffect(() => {
    if (!supported) {
      setIsChecking(false)
      return
    }
    getExistingPushSubscription()
      .then((sub) => setIsSubscribed(!!sub))
      .finally(() => setIsChecking(false))
  }, [supported])

  const enable = useCallback(async () => {
    if (!supported) {
      toast.error("Push notifications aren't supported on this browser")
      return
    }
    setIsLoading(true)
    try {
      const sub = await subscribeToPush(VAPID_PUBLIC_KEY)
      if (!sub) {
        const permission = getNotificationPermission()
        toast.error(
          permission === "denied"
            ? "Notifications are blocked — enable them in your browser/site settings"
            : "Couldn't enable notifications"
        )
        return
      }
      await subscribePush(sub).unwrap()
      setIsSubscribed(true)
      toast.success("Notifications enabled")
    } catch {
      toast.error("Couldn't enable notifications")
    } finally {
      setIsLoading(false)
    }
  }, [supported, subscribePush])

  const disable = useCallback(async () => {
    setIsLoading(true)
    try {
      const endpoint = await unsubscribeFromPush()
      if (endpoint) await unsubscribePush({ endpoint }).unwrap()
      setIsSubscribed(false)
      toast.info("Notifications turned off")
    } catch {
      toast.error("Couldn't turn off notifications")
    } finally {
      setIsLoading(false)
    }
  }, [unsubscribePush])

  return {
    isSupported: supported,
    isSubscribed,
    isChecking,
    isLoading,
    toggle: (next: boolean) => (next ? enable() : disable()),
  }
}
