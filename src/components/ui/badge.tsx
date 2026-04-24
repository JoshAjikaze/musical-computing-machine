import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-heading font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-vibe-red/15 text-vibe-red border border-vibe-red/30",
        secondary: "bg-vibe-onyx-300 text-vibe-text-secondary border border-vibe-onyx-400",
        outline: "border border-vibe-onyx-400 text-vibe-text-secondary",
        amber: "bg-vibe-amber/15 text-vibe-amber border border-vibe-amber/30",
        purple: "bg-vibe-purple/15 text-vibe-purple-light border border-vibe-purple/30",
        success: "bg-green-500/15 text-green-400 border border-green-500/30",
        premium: "bg-gradient-to-r from-vibe-amber/20 to-vibe-red/20 text-vibe-amber border border-vibe-amber/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
