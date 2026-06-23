import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  verified?: boolean
  className?: string
}

/**
 * Mobile-reliable OTP input.
 *
 * Uses a single <input> stretched over the entire widget rather than one
 * input per digit. This eliminates every class of mobile keyboard bug:
 *  - Android's soft keyboard fires "Unidentified" / keyCode 229 for most
 *    keys (including Backspace) when composing — the onChange event still
 *    fires reliably, so we can diff the old vs new value instead.
 *  - iOS native SMS code auto-fill works because autoComplete="one-time-code"
 *    targets a single <input> element.
 *  - Touch targets are the full row, not six tiny 30-px boxes.
 *
 * Visually the hidden input still shows a styled slot-grid beneath it so
 * the UI looks exactly like the original design.
 */
export function OTPInput({
  length = 6,
  value,
  onChange,
  verified = false,
  className,
}: OTPInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)

  // Keep cursor at the end so Android keyboards stay in "append" mode
  useEffect(() => {
    const el = inputRef.current
    if (!el || !focused) return
    const end = el.value.length
    el.setSelectionRange(end, end)
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, length)
    onChange(raw)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    onChange(pasted)
  }

  const activeSlot = Math.min(value.length, length - 1)

  const slotBorder = (i: number) => {
    if (verified) return "border-green-500"
    if (focused && i === activeSlot) return "border-vibe-red ring-1 ring-vibe-red/30"
    return "border-vibe-onyx-400"
  }

  return (
    <div
      className={cn("relative flex gap-2 sm:gap-3 w-full select-none", className)}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Hidden native input — spans the full row, invisible but interactive */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={value}
        maxLength={length}
        onChange={handleChange}
        onPaste={handlePaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="One-time password"
        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
      />

      {/* Visual slot grid */}
      {Array.from({ length }, (_, i) => {
        const char = value[i] ?? ""
        const isCursor = focused && i === value.length && i < length

        return (
          <div
            key={i}
            className={cn(
              "min-w-0 flex-1 aspect-square rounded-lg flex items-center justify-center",
              "bg-vibe-onyx-300 border transition-colors duration-150",
              "text-lg sm:text-xl font-heading font-semibold text-white",
              slotBorder(i)
            )}
            aria-hidden="true"
          >
            {char ? (
              <span>{char}</span>
            ) : isCursor ? (
              /* Blinking caret */
              <span className="w-[2px] h-[1.1em] bg-vibe-red animate-pulse rounded-full" />
            ) : (
              <span className="text-vibe-text-muted opacity-40">·</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Countdown timer hook ──────────────────────────────────
export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running || seconds <= 0) {
      setRunning(false)
      return
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [running, seconds])

  const restart = () => {
    setSeconds(initialSeconds)
    setRunning(true)
  }

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

  return { seconds, formatted, running, isDone: seconds === 0, restart }
}
