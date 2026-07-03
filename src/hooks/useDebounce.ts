import { useEffect, useState } from "react"

/**
 * Returns `value`, but only after it hasn't changed for `delayMs`.
 * Used to debounce header search inputs before firing /explore/search or
 * navigating, so we don't hit the API on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
