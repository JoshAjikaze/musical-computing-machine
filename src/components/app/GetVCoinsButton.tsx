import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/**
 * "Get free V coins" CTA — appears on Home, Explore, and Library. Vcoins
 * isn't live yet (balance is hardcoded to 0 in UserLayout's topbar), so
 * this surfaces a "coming soon" toast instead of doing nothing or pretending
 * to start a flow that doesn't exist.
 */
export function GetVCoinsButton({ className }: { className?: string }) {
  return (
    <Button
      size="default"
      rounded="full"
      className={cn("shrink-0", className)}
      onClick={() => toast.info("Vcoins are coming soon!", {
        description: "We're still building this out — check back later.",
      })}
    >
      Get free V coins
    </Button>
  )
}
