import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border border-vibe-onyx-400 rounded-sm mb-3 bg-vibe-onyx-200 overflow-hidden",
      "transition-colors duration-200 hover:border-vibe-onyx-400/80",
      "data-[state=open]:border-vibe-red/30 data-[state=open]:bg-vibe-onyx-300",
      className
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between px-5 py-4 text-sm font-body font-medium text-vibe-text-primary text-left",
        "transition-all duration-200",
        "hover:text-white",
        "focus-vibe",
        "[&[data-state=open]>svg.plus-icon]:hidden",
        "[&[data-state=open]>svg.minus-icon]:block",
        "[&[data-state=closed]>svg.plus-icon]:block",
        "[&[data-state=closed]>svg.minus-icon]:hidden",
        className
      )}
      {...props}
    >
      {children}
      <Plus className="plus-icon h-4 w-4 shrink-0 text-vibe-red transition-transform duration-200" />
      <Minus className="minus-icon h-4 w-4 shrink-0 text-vibe-red transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("px-5 pb-5 text-vibe-text-secondary leading-relaxed", className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
