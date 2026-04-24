interface GoogleButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
}

export function GoogleButton({ label, onClick, disabled }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 h-12 rounded-full border border-white/20 bg-transparent text-white text-sm font-semibold font-body hover:bg-white/5 active:bg-white/10 transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none"
    >
      {/* Official Google "G" SVG — no external image needed */}
      <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.36 3.09 29.47 1 24 1 14.82 1 7.01 6.47 3.49 14.19l7.08 5.5C12.23 13.62 17.66 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v8.99h12.67c-.55 2.93-2.2 5.42-4.68 7.09l7.18 5.58C43.3 37.5 46.52 31.45 46.52 24.5z"/>
        <path fill="#FBBC05" d="M10.57 28.31A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.71-4.28l-7.08-5.5A23.93 23.93 0 0 0 .5 24c0 3.87.93 7.52 2.57 10.73l7.5-6.42z"/>
        <path fill="#34A853" d="M24 47c5.44 0 10.01-1.8 13.35-4.87l-7.18-5.58c-1.8 1.21-4.1 1.95-6.17 1.95-6.34 0-11.77-4.12-13.69-9.69l-7.5 6.42C7.01 41.53 14.82 47 24 47z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      <span>{label}</span>
    </button>
  )
}
