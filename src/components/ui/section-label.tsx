import { cn } from "@/lib/utils"

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

/** Small uppercase label used to introduce each section — e.g. "OUR FEATURES" */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span className="block h-px w-8 bg-vibe-red/50" />
      <span className="font-heading text-xs font-semibold uppercase tracking-[0.25em] text-vibe-red">
        {children}
      </span>
      <span className="block h-px w-8 bg-vibe-red/50" />
    </div>
  )
}

interface SectionHeadingProps {
  children: React.ReactNode
  className?: string
  centered?: boolean
}

export function SectionHeading({ children, className, centered = false }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "font-heading text-display-lg font-bold text-vibe-text-primary",
        centered && "text-center",
        className
      )}
    >
      {children}
    </h2>
  )
}
