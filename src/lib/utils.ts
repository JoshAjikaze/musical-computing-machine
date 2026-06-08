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
