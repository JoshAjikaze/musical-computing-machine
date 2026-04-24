import { Component, type ErrorInfo, type ReactNode } from "react"
import { RefreshCw, AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  /** Optional custom fallback — defaults to the Vibe Garage error screen */
  fallback?: ReactNode
}

interface State {
  hasError:  boolean
  error:     Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    // In production you would forward to an error tracking service here
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-8 text-center">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vibe-red/15 ring-1 ring-vibe-red/30">
            <AlertTriangle className="h-8 w-8 text-vibe-red" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-bold text-white">
              Something went wrong
            </h2>
            <p className="text-sm text-vibe-text-secondary max-w-sm">
              An unexpected error occurred in this section. You can try refreshing
              or go back to continue using Vibe Garage.
            </p>
          </div>

          {/* Error detail — collapsed, dev-friendly */}
          {this.state.error && (
            <details className="w-full max-w-md text-left">
              <summary className="cursor-pointer text-xs text-vibe-text-muted hover:text-white transition-colors">
                Show error details
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-md bg-vibe-onyx-300 border border-vibe-onyx-400 p-3 text-xs text-vibe-text-secondary whitespace-pre-wrap break-words">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 h-10 rounded-full bg-vibe-red text-white text-sm font-heading font-semibold hover:bg-vibe-red-hover transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-2 px-5 h-10 rounded-full border border-vibe-onyx-400 bg-transparent text-white text-sm font-heading font-semibold hover:bg-vibe-onyx-300 transition-colors"
            >
              Go home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Lightweight wrapper for use around individual page sections.
 * Shows a smaller inline error instead of the full-page variant.
 */
export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center gap-3 rounded-md border border-vibe-red/30 bg-vibe-red/10 px-4 py-3 text-sm text-vibe-red">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>This section failed to load. Please refresh the page.</span>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
