import { useEffect, useId, useRef } from "react"
import { ADSENSE_PUBLISHER_ID, isAdSenseConfigured, ensureAdsQueue } from "@/lib/adsense"
import { cn } from "@/lib/utils"

/**
 * Reusable AdSense unit. Renders nothing if VITE_ADSENSE_PUBLISHER_ID isn't
 * set (see lib/adsense.ts), so it's safe to drop into pages before the site
 * has AdSense approval — it just won't show anything until configured.
 *
 * `slot` is the ad unit's data-ad-slot ID from the AdSense dashboard —
 * there's no real one to default to here, so every call site must pass its
 * own once ad units exist. Keep slots away from PlayerBar / QueuePanel /
 * NowPlayingSidebar — Google's policy flags layouts where ads sit next to
 * controls people tap frequently, since it reads as accidental-click bait.
 */
export function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  className,
  layout,
}: {
  slot: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid"
  responsive?: boolean
  className?: string
  /** For in-feed/in-article units — matches data-ad-layout in the AdSense dashboard. */
  layout?: string
}) {
  const insRef = useRef<HTMLModElement>(null)
  const pushedRef = useRef(false)
  const id = useId()

  useEffect(() => {
    if (!isAdSenseConfigured || pushedRef.current || !insRef.current) return
    try {
      ensureAdsQueue()
      window.adsbygoogle.push({})
      pushedRef.current = true
    } catch {
      // AdSense not finished loading, blocked by an ad blocker, etc. — fail
      // silently, this is a non-critical UI element.
    }
    // Re-run if the slot id changes (a different ad unit was swapped in).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot])

  if (!isAdSenseConfigured) return null

  return (
    <ins
      key={id}
      ref={insRef}
      className={cn("adsbygoogle block", className)}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
      data-ad-layout={layout}
    />
  )
}
