import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change: number       // percentage, positive = up
  period?: string
  className?: string
}

export function StatCard({ icon, label, value, change, period = "vs last 7 days", className }: StatCardProps) {
  const isUp = change >= 0

  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vibe-onyx-300">
          {icon}
        </div>
        <span className="text-sm text-vibe-text-secondary">{label}</span>
      </div>

      <p className="font-heading text-3xl font-bold text-white">{value}</p>

      <div className="flex items-center gap-1.5">
        {isUp
          ? <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          : <TrendingDown className="h-3.5 w-3.5 text-vibe-red" />
        }
        <span className={cn("text-xs font-medium", isUp ? "text-green-400" : "text-vibe-red")}>
          {isUp ? "+" : ""}{change}%
        </span>
        <span className="text-xs text-vibe-text-muted">{period}</span>
      </div>
    </div>
  )
}
