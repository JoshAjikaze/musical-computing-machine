import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Supabase public storage base URL for all VibeGarage assets.
 * Every audio_path and cover_path returned by the backend is a relative
 * key that must be prefixed with this base to produce a fetchable URL.
 */
export const SUPABASE_STORAGE_BASE =
  "https://tatswhuxpbxzlprjfvln.supabase.co/storage/v1/object/public/vibegarage/"

/**
 * Resolve a raw backend path (e.g. "tracks/abc.mp3" or a full URL) into
 * the full Supabase public URL.
 *
 * - Already-absolute URLs (http/https) are returned unchanged.
 * - null / undefined / empty string returns "" (falsy — safe for <img src> and audio.src).
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return SUPABASE_STORAGE_BASE + path.replace(/^\//, "")
}

/**
 * Best-effort username slug derived from an artist's display name, for use
 * only when the backend hasn't given us a real `artist_username`. The
 * public artist route (/artist/:username) needs a real username to resolve
 * against GET /public/artists/{username} — this is a fallback guess, not a
 * guarantee it'll match. Same heuristic that was previously duplicated
 * inline in ShareDialog, TrackCard, and TrackPage; centralized here.
 */
export function slugifyArtistName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "")
}
