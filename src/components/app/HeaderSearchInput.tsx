import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Search, X } from "lucide-react"
import { useDebouncedValue } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"

/**
 * Debounced search box shared by UserLayout, AppLayout, and AdminLayout's
 * headers. Doesn't call the API itself — it just debounces what's typed and
 * routes to `${basePath}/search?q=...`, which is where SearchResultsPage
 * (shared across all three shells) actually calls useGlobalSearchQuery.
 *
 * - While already on the results page, updates replace history (so rapid
 *   typing doesn't fill up the back button with one entry per keystroke).
 * - From anywhere else, the first debounced non-empty value pushes a new
 *   entry, so back navigation returns to wherever the person was.
 * - Clearing the box only navigates away if already on the results page.
 */
export function HeaderSearchInput({
  basePath,
  className,
  inputClassName,
  placeholder = "Search",
}: {
  basePath: string
  className?: string
  inputClassName?: string
  placeholder?: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const searchPath = `${basePath}/search`
  const onSearchPage = location.pathname === searchPath

  const urlQ = onSearchPage ? new URLSearchParams(location.search).get("q") ?? "" : ""
  const [value, setValue] = useState(urlQ)
  const debounced = useDebouncedValue(value, 350)
  const lastPushed = useRef(urlQ)

  // Keep the box in sync if the URL's q param changes from elsewhere
  // (browser back/forward while on the results page).
  useEffect(() => {
    if (!onSearchPage) return
    const current = new URLSearchParams(location.search).get("q") ?? ""
    if (current !== lastPushed.current) {
      setValue(current)
      lastPushed.current = current
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, onSearchPage])

  useEffect(() => {
    const trimmed = debounced.trim()
    if (trimmed === lastPushed.current.trim()) return
    lastPushed.current = trimmed

    if (!trimmed) {
      if (onSearchPage) navigate(searchPath, { replace: true })
      return
    }
    navigate(`${searchPath}?q=${encodeURIComponent(trimmed)}`, { replace: onSearchPage })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  function submitNow() {
    const trimmed = value.trim()
    if (!trimmed) return
    lastPushed.current = trimmed
    navigate(`${searchPath}?q=${encodeURIComponent(trimmed)}`, { replace: onSearchPage })
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vibe-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitNow()
        }}
        placeholder={placeholder}
        aria-label="Search Vibe Garage"
        className={cn(
          "w-full pl-9 pr-8 rounded-full bg-vibe-onyx-300 border border-vibe-onyx-400 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted focus:outline-none focus:border-vibe-text-muted transition-colors",
          inputClassName
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vibe-text-muted hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
