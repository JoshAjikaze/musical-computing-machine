import { cn } from "@/lib/utils"

interface StepProgressBarProps {
  steps: number       // total steps
  current: number     // 1-based current step
  className?: string
}

export function StepProgressBar({ steps, current, className }: StepProgressBarProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length: steps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-300",
            i < current ? "bg-vibe-amber" : "bg-vibe-onyx-400"
          )}
        />
      ))}
    </div>
  )
}
