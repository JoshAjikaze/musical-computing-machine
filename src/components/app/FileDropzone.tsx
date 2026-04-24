import { useRef, useState } from "react"
import { CloudUpload, X, Music, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  accept: string                     // e.g. "image/*" or ".mp3,.wav,.mwv"
  hint: string                       // e.g. "JPG, PNG or GIF - Max file size 4MB"
  maxSizeMB?: number
  value?: File | null
  onChange: (file: File | null) => void
  type?: "image" | "audio"
  className?: string
}

export function FileDropzone({
  accept, hint, maxSizeMB = 4, value, onChange, type = "image", className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError]       = useState("")

  const validate = (file: File) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB}MB limit`)
      return false
    }
    setError("")
    return true
  }

  const handleFile = (file: File) => {
    if (validate(file)) onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (value) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 px-4 py-3",
        className
      )}>
        {type === "image"
          ? <ImageIcon className="h-5 w-5 text-vibe-amber shrink-0" />
          : <Music className="h-5 w-5 text-vibe-amber shrink-0" />
        }
        <span className="flex-1 text-sm text-vibe-text-primary truncate">{value.name}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-vibe-text-muted hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full items-center gap-4 rounded-lg border-2 border-dashed px-5 py-4 transition-colors duration-150",
          dragging
            ? "border-vibe-amber bg-vibe-amber/5"
            : "border-vibe-onyx-400 bg-vibe-onyx-300 hover:border-vibe-text-muted hover:bg-vibe-onyx-400"
        )}
      >
        <CloudUpload className={cn("h-5 w-5 shrink-0", dragging ? "text-vibe-amber" : "text-vibe-text-muted")} />
        <div className="text-left">
          <p className="text-sm text-vibe-text-primary">Drag and drop or click to upload</p>
          <p className="text-xs text-vibe-text-muted mt-0.5">{hint}</p>
        </div>
      </button>
      {error && <p className="text-xs text-vibe-red">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
