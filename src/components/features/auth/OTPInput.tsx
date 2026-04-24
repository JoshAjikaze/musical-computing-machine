import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  verified?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  verified = false,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // ✅ Use index access + nullish fallback — no space padding
  const digits = Array.from({ length }, (_, i) => value[i] ?? "")

  const focusSlot = useCallback(
    (index: number) => {
      inputRefs.current[Math.min(Math.max(index, 0), length - 1)]?.focus()
    },
    [length]
  )

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1)
    const next = Array.from({ length }, (_, i) =>
      i === index ? char : value[i] ?? ""
    )
    onChange(next.join("")) // ✅ No trimEnd — slots are "" not " "
    if (char) focusSlot(index + 1)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (value[index]) {
        const next = Array.from({ length }, (_, i) =>
          i === index ? "" : value[i] ?? ""
        )
        onChange(next.join(""))
      } else {
        focusSlot(index - 1)
      }
    }
    if (e.key === "ArrowLeft") focusSlot(index - 1)
    if (e.key === "ArrowRight") focusSlot(index + 1)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    // Pad pasted value to fill remaining slots with ""
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "")
    onChange(next.join(""))
    focusSlot(Math.min(pasted.length, length - 1))
  }

  return (
    <div className={cn("flex gap-3", className)}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "h-14 w-14 rounded-lg text-center text-xl font-heading font-semibold",
            "bg-vibe-onyx-300 text-white caret-vibe-red",
            "border transition-colors duration-150",
            "focus:outline-none focus:ring-1",
            verified
              ? "border-green-500 focus:border-green-500 focus:ring-green-500/30"
              : digit
              ? "border-vibe-onyx-400 focus:border-vibe-red focus:ring-vibe-red/30"
              : "border-vibe-onyx-400 focus:border-vibe-red focus:ring-vibe-red/30",
            "placeholder:text-vibe-text-muted"
          )}
          placeholder={digit ? "" : "·"}
        />
      ))}
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
