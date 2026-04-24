import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, suffix, ...props }, ref) => {
    if (icon || suffix) {
      return (
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-vibe-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-2 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:border-vibe-red focus-visible:ring-1 focus-visible:ring-vibe-red/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              suffix && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-vibe-text-muted">
              {suffix}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-2 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:border-vibe-red focus-visible:ring-1 focus-visible:ring-vibe-red/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
