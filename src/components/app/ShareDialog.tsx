/**
 * ShareDialog — Portal-based share sheet.
 *
 * Always shows two one-click copyable URL pills:
 *   • Artist profile → {base_url}/artist/{username}
 *   • Track          → {base_url}/track/{track_id}
 *
 * Both routes are public (see App.tsx) — no login required to open a
 * shared link. The artist link is keyed by *username*, not artistId:
 * the only public artist-lookup endpoint (GET /public/artists/{username})
 * takes a username, so an id-based link would have nothing to resolve it
 * against.
 */

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Copy, Check, Twitter, MessageCircle, Send, QrCode, Link2,
  Music2, User,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useGetArtistQrCodeQuery } from "@/store/api/vibeApi"

// ── Constants ──────────────────────────────────────────────
const BASE_URL = "https://vibegarage.app"

export const artistShareUrl = (username: string) =>
  `${BASE_URL}/artist/${username}`

export const trackShareUrl = (trackId: string) =>
  `${BASE_URL}/track/${trackId}`

// ── Types ──────────────────────────────────────────────────
export interface ShareDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  coverUrl?: string
  label: string
  sublabel?: string
  /**
   * Drives the QR Code tab AND the artist share URL — the QR endpoint
   * (GET /public/artists/{username}/qrcode) and the public artist page
   * (GET /public/artists/{username}) both key off username, not artistId.
   */
  artistUsername?: string
  /**
   * Kept for callers that have it on hand (e.g. follow/like actions
   * elsewhere) — not used to build the share URL, since the public artist
   * route is username-based. See artistUsername.
   */
  artistId?: string
  /** Track ID → {base_url}/track/{track_id} */
  trackId?: string
}

type Tab = "link" | "qr"

interface QrCodeResponse {
  qr_code_url?: string
  url?: string
  image_url?: string
}

// ── Portal ─────────────────────────────────────────────────
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

// ── CopyPill ───────────────────────────────────────────────
function CopyPill({
  icon,
  label,
  url,
}: {
  icon: React.ReactNode
  label: string
  url: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(`${label} link copied`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy link")
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
        "bg-vibe-onyx-300 hover:bg-vibe-onyx-400 active:scale-[0.98]",
        copied && "ring-1 ring-green-500/40"
      )}
    >
      <span className={cn(
        "shrink-0 h-7 w-7 rounded-lg flex items-center justify-center",
        "bg-vibe-onyx-400 text-vibe-text-muted group-hover:text-white transition-colors"
      )}>
        {icon}
      </span>

      <div className="flex-1 min-w-0 text-left">
        <p className="text-[10px] font-medium text-vibe-text-muted uppercase tracking-wider leading-none mb-0.5">
          {label}
        </p>
        <p className="text-xs text-vibe-text-secondary font-mono truncate">{url}</p>
      </div>

      <span className={cn(
        "shrink-0 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all",
        copied
          ? "bg-green-500/20 text-green-400"
          : "bg-vibe-onyx-200 text-vibe-text-muted group-hover:text-white"
      )}>
        {copied
          ? <><Check className="h-3 w-3" />Copied</>
          : <><Copy className="h-3 w-3" />Copy</>
        }
      </span>
    </button>
  )
}

// ── Main component ─────────────────────────────────────────
export function ShareDialog({
  open,
  onClose,
  title = "Share",
  coverUrl,
  label,
  sublabel,
  artistUsername,
  trackId,
}: ShareDialogProps) {
  const [tab, setTab] = useState<Tab>("link")

  useEffect(() => { if (open) setTab("link") }, [open])
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Artist share URL is public and username-based:
  // {base_url}/artist/{username} — see artistShareUrl() above.
  const artistUrl = artistUsername ? artistShareUrl(artistUsername) : null
  const trackUrl  = trackId        ? trackShareUrl(trackId)         : null

  // QR tab only available when we have an actual username (QR endpoint requires one)
  const hasQr = !!artistUsername

  // Primary URL for social share buttons — prefer artist, fall back to track
  const primaryUrl     = artistUrl ?? trackUrl ?? ""
  const encodedPrimary = encodeURIComponent(primaryUrl)
  const encodedLabel   = encodeURIComponent(label)

  const socials = [
    {
      icon:  <Twitter className="h-4 w-4" />,
      label: "X / Twitter",
      href:  `https://twitter.com/intent/tweet?url=${encodedPrimary}&text=${encodedLabel}`,
      color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    },
    {
      icon:  <MessageCircle className="h-4 w-4" />,
      label: "WhatsApp",
      href:  `https://wa.me/?text=${encodedLabel}%20${encodedPrimary}`,
      color: "hover:bg-[#25D366]/10 hover:text-[#25D366]",
    },
    {
      icon:  <Send className="h-4 w-4" />,
      label: "Telegram",
      href:  `https://t.me/share/url?url=${encodedPrimary}&text=${encodedLabel}`,
      color: "hover:bg-[#229ED9]/10 hover:text-[#229ED9]",
    },
  ]

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            key="share-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: 40, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 34, mass: 0.8 }}
              className={cn(
                "relative w-full md:w-[420px] mx-4 mb-4 md:mb-0",
                "rounded-2xl bg-vibe-onyx-100 border border-vibe-onyx-400 shadow-2xl overflow-hidden",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-vibe-onyx-400">
                <h2 className="font-heading text-base font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-vibe-text-muted hover:text-white hover:bg-vibe-onyx-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Preview row */}
              <div className="flex items-center gap-3 px-5 py-4 bg-vibe-onyx-200/50">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={label}
                    className="h-11 w-11 rounded-lg object-cover shrink-0 shadow-md"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-lg bg-vibe-onyx-300 shrink-0 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-vibe-text-muted" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{label}</p>
                  {sublabel && (
                    <p className="text-xs text-vibe-text-muted truncate">{sublabel}</p>
                  )}
                </div>
              </div>

              {/* Tabs — only when QR username is available */}
              {hasQr && (
                <div className="flex border-b border-vibe-onyx-400">
                  {(["link", "qr"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative",
                        tab === t ? "text-white" : "text-vibe-text-muted hover:text-vibe-text-secondary"
                      )}
                    >
                      {t === "link"
                        ? <><Link2 className="h-3.5 w-3.5" />Share Links</>
                        : <><QrCode className="h-3.5 w-3.5" />QR Code</>
                      }
                      {tab === t && (
                        <motion.div
                          layoutId="share-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibe-red rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Content */}
              <div>
                {(!hasQr || tab === "link") ? (
                  <div className="px-5 py-4 space-y-4">
                    {/* URL Pills — always render both when data is available */}
                    <div className="space-y-2">
                      {artistUrl && (
                        <CopyPill
                          icon={<User className="h-3.5 w-3.5" />}
                          label="Artist Profile"
                          url={artistUrl}
                        />
                      )}
                      {trackUrl && (
                        <CopyPill
                          icon={<Music2 className="h-3.5 w-3.5" />}
                          label="Track"
                          url={trackUrl}
                        />
                      )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-vibe-onyx-400" />
                      <span className="text-[10px] font-medium text-vibe-text-muted uppercase tracking-wider">
                        Share via
                      </span>
                      <div className="flex-1 h-px bg-vibe-onyx-400" />
                    </div>

                    {/* Social buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex flex-col items-center gap-1.5 py-3 rounded-xl",
                            "bg-vibe-onyx-300 text-vibe-text-muted transition-colors",
                            s.color
                          )}
                        >
                          {s.icon}
                          <span className="text-[10px] font-medium leading-none">{s.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <QrPanel
                    username={artistUsername!}
                    label={label}
                    artistUrl={artistUrl!}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}

// ── QR Panel ───────────────────────────────────────────────
function QrPanel({
  username,
  label,
  artistUrl,
}: {
  username: string
  label: string
  artistUrl: string
}) {
  const { data, isLoading, isError } = useGetArtistQrCodeQuery(username, { skip: !username })
  const [copied, setCopied] = useState(false)

  const qrUrl = (() => {
    if (!data) return null
    const d = data as QrCodeResponse
    return d.qr_code_url ?? d.url ?? d.image_url ?? null
  })()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(artistUrl)
      setCopied(true)
      toast.success("Profile link copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy link")
    }
  }

  return (
    <div className="px-5 py-5 flex flex-col items-center gap-4">
      <div className="w-52 h-52 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse" />
            <span className="text-xs text-gray-400">Generating…</span>
          </div>
        ) : isError || !qrUrl ? (
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <QrCode className="h-8 w-8 text-gray-300" />
            <p className="text-xs text-gray-400">QR code unavailable</p>
          </div>
        ) : (
          <img src={qrUrl} alt={`QR code for ${label}`} className="w-full h-full object-contain p-2" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-vibe-text-muted mt-0.5">Scan to open artist profile</p>
      </div>

      <div className="flex gap-2 w-full">
        <button
          onClick={handleCopy}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all",
            copied
              ? "bg-green-500/20 text-green-400"
              : "bg-vibe-onyx-300 text-vibe-text-secondary hover:text-white hover:bg-vibe-onyx-400"
          )}
        >
          {copied
            ? <><Check className="h-3.5 w-3.5" />Copied!</>
            : <><Copy className="h-3.5 w-3.5" />Copy Link</>
          }
        </button>
        {qrUrl && (
          <a
            href={qrUrl}
            download={`${username}-qr.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-vibe-red text-xs font-medium text-white hover:bg-vibe-red/90 transition-colors active:scale-95"
          >
            <QrCode className="h-3.5 w-3.5" />
            Download QR
          </a>
        )}
      </div>
    </div>
  )
}
