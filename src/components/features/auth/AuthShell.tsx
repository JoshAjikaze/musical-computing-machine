import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { VibeGarageLogo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"

interface AuthShellProps {
  children: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  className?: string
}

export function AuthShell({ children, showBack = false, onBack, className }: AuthShellProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    /* Full-page backdrop with the purple/red bottom glow matching the designs */
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Bottom glow — purple left, red right — exactly as in designs */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-48 z-0">
        <div className="absolute bottom-0 left-0 w-2/3 h-40 bg-[#6C3EB8]/30 blur-[80px] rounded-full -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-1/3 h-32 bg-[#C8102E]/20 blur-[60px] rounded-full translate-x-1/4" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-[560px] bg-[#1c1c1c] rounded-2xl px-14 py-12",
          className
        )}
      >
        {/* Back arrow */}
        {showBack && (
          <button
            onClick={handleBack}
            className="absolute top-7 left-7 text-white hover:text-vibe-text-secondary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* Logo — centred at top */}
        <div className="flex justify-center mb-8">
          <VibeGarageLogo size="md" />
        </div>

        {children}
      </div>
    </div>
  )
}
