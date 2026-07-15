import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { isAdSenseConfigured, updateAdConsent } from "@/lib/adsense"
import { getStoredAdConsent } from "@/lib/consent"
import { cn } from "@/lib/utils"

/**
 * Lightweight consent banner for AdSense — not a full CMP/Funding Choices
 * integration, but enough to satisfy Google's baseline requirement that
 * personalized ads not be requested without an affirmative choice (see
 * ensureAdsQueue() in lib/adsense.ts, which defaults to non-personalized
 * ads until "personalized" is explicitly chosen here).
 *
 * Shown to everyone (not geo-restricted) — see the NOTE in lib/consent.ts
 * on why, and how to add geo-targeting later if wanted.
 *
 * Renders nothing if AdSense isn't configured, or once a choice has already
 * been stored.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  // /app and /listen always reserve a PlayerBar strip at the bottom (even
  // with nothing playing) — sit above it there instead of covering it.
  const hasPlayerBar = location.pathname.startsWith("/app") || location.pathname.startsWith("/listen")

  useEffect(() => {
    if (isAdSenseConfigured && !getStoredAdConsent()) setVisible(true)
  }, [])

  if (!visible) return null

  function choose(consent: "personalized" | "non-personalized") {
    updateAdConsent(consent)
    setVisible(false)
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-[60] bg-vibe-onyx-200 border-t border-vibe-onyx-400 px-4 py-4 md:px-8",
        hasPlayerBar ? "bottom-[76px] md:bottom-[61px]" : "bottom-0"
      )}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <p className="text-xs text-vibe-text-secondary leading-relaxed flex-1">
          We use cookies to show ads. You can allow personalised ads, or limit us to
          non-personalised ones — see our{" "}
          <Link to="/privacy-policy" className="text-vibe-amber hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => choose("non-personalized")}>
            Non-personalised only
          </Button>
          <Button size="sm" onClick={() => choose("personalized")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  )
}
