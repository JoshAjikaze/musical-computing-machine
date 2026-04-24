import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: { icon: 20, text: "text-lg" },
  md: { icon: 26, text: "text-2xl" },
  lg: { icon: 36, text: "text-4xl" },
}

export function VibeGarageLogo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Vinyl disc icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Outer disc */}
        <circle cx="16" cy="16" r="15" fill="#1A1A1A" stroke="#C8102E" strokeWidth="1.5" />
        {/* Groove rings */}
        <circle cx="16" cy="16" r="11" stroke="#2E2E2E" strokeWidth="0.75" fill="none" />
        <circle cx="16" cy="16" r="8" stroke="#2E2E2E" strokeWidth="0.75" fill="none" />
        <circle cx="16" cy="16" r="5" stroke="#2E2E2E" strokeWidth="0.75" fill="none" />
        {/* Label area */}
        <circle cx="16" cy="16" r="4.5" fill="#C8102E" />
        {/* Center hole */}
        <circle cx="16" cy="16" r="1.5" fill="#0A0A0A" />
        {/* Sound wave accent - top left */}
        <path
          d="M7 10 Q9 8 11 10"
          stroke="#F4A435"
          strokeWidth="1.25"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {!iconOnly && (
        <span
          className={cn(
            "font-display tracking-tight text-white leading-none",
            s.text
          )}
        >
          Vibe<span className="text-vibe-red">Garage</span>
        </span>
      )}
    </div>
  )
}

// Favicon / compact version
export function VibeFavicon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="6" fill="#C8102E" />
      <circle cx="16" cy="16" r="10" fill="#0A0A0A" />
      <circle cx="16" cy="16" r="6" fill="#1A1A1A" />
      <circle cx="16" cy="16" r="2" fill="#C8102E" />
      <path d="M16 6 L18 10 L16 8 L14 10 Z" fill="#F4A435" />
    </svg>
  )
}
