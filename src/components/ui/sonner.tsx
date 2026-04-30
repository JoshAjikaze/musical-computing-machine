import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-vibe-bg-card group-[.toaster]:text-vibe-text-main group-[.toaster]:border-vibe-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-vibe-text-muted",
          actionButton:
            "group-[.toast]:bg-vibe-primary group-[.toast]:text-vibe-text-main",
          cancelButton:
            "group-[.toast]:bg-vibe-secondary group-[.toast]:text-vibe-text-muted",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
