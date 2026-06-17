import { cn } from "@/lib/utils"
import Logo from '@/assets/images/Logo.svg'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: { icon: 200, text: "text-lg" },
  md: { icon: 200, text: "text-2xl" },
  lg: { icon: 200, text: "text-4xl" },
}

export function VibeGarageLogo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Vinyl disc icon */}
      <img src={Logo} alt="Logo" width={sizes[size].icon} height={sizes[size].icon} />
      {!iconOnly && (
        <span
          className={cn(
            "font-display tracking-tight text-white leading-none hidden",
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
