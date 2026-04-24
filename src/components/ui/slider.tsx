import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "progress"
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative w-full grow overflow-hidden rounded-full bg-vibe-onyx-400",
        variant === "progress" ? "h-1 group-hover:h-1.5 transition-all duration-150" : "h-1"
      )}
    >
      <SliderPrimitive.Range className="absolute h-full bg-vibe-red rounded-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block rounded-full bg-white border-2 border-vibe-red shadow-md",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vibe-red focus-visible:ring-offset-1 focus-visible:ring-offset-vibe-onyx",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "progress"
          ? "h-3 w-3 opacity-0 group-hover:opacity-100"
          : "h-4 w-4"
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
