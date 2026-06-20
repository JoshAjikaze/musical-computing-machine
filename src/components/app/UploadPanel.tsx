import { AmberTrophyIllustration } from "@/components/app/AmberTrophyIllustration"
import { useReducer, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft, X, Pencil, CalendarDays, Plus, Trash2,
  Music2, Upload, FolderOpen, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FileDropzone } from "@/components/app/FileDropzone"
import { StepProgressBar } from "@/components/app/StepProgressBar"
import { cn } from "@/lib/utils"
import {
  useUploadTrackArtistMutation,
  useCreateAlbumMutation,
  useAddTrackToAlbumMutation,
  usePublishAlbumMutation,
  useSaveAlbumDraftMutation,
  useGetAlbumByIdQuery,
} from "@/store/api/vibeApi"
import { toast } from "sonner"

// ── Types ─────────────────────────────────────────────────
type UploadStep =
  | "choose"
  | "album-draft"           // Ask: continue draft or start fresh?
  | "album-1"               // Album metadata
  | "album-2"               // Multi-track upload
  | "album-3"               // Release date + publish/draft
  | "single-1" | "single-2"
  | "success-album" | "success-single"

export interface PendingTrack {
  id:         string        // temp uuid for list key
  title:      string
  genre:      string
  price:      string
  audioFile:  File
  coverFile:  File | null
  status:     "pending" | "uploading" | "done" | "error"
  errorMsg?:  string
}

interface UploadState {
  step:         UploadStep
  // album draft continuation
  draftAlbumId: string
  // album
  albumId:      string      // set after createAlbum succeeds
  albumTitle:   string
  albumArt:     File | null
  description:  string
  year:         string
  // tracks
  pendingTracks: PendingTrack[]
  releaseDate:  string
  // single
  singleTitle:       string
  singleCoverArt:    File | null
  singleYear:        string
  singleReleaseDate: string
  singleAudioFile:   File | null
  featuredArtists:   string[]
}

type UploadAction =
  | { type: "CHOOSE_ALBUM" }
  | { type: "CHOOSE_SINGLE" }
  | { type: "GOTO_DRAFT" }
  | { type: "ALBUM_DRAFT_CONTINUE"; albumId: string }
  | { type: "ALBUM1_NEXT"; payload: Pick<UploadState, "albumTitle"|"albumArt"|"description"|"year"> }
  | { type: "SET_ALBUM_ID"; albumId: string }
  | { type: "ALBUM2_NEXT" }
  | { type: "SUBMIT_ALBUM" }
  | { type: "SINGLE1_NEXT"; payload: Pick<UploadState, "singleTitle"|"singleCoverArt"|"singleYear"|"singleReleaseDate"> }
  | { type: "SUBMIT_SINGLE" }
  | { type: "ADD_PENDING_TRACK"; track: PendingTrack }
  | { type: "REMOVE_PENDING_TRACK"; id: string }
  | { type: "UPDATE_TRACK_STATUS"; id: string; status: PendingTrack["status"]; errorMsg?: string }
  | { type: "SET_RELEASE_DATE"; date: string }
  | { type: "ADD_FEATURED_ARTIST"; name: string }
  | { type: "BACK" }

const BACK_MAP: Partial<Record<UploadStep, UploadStep>> = {
  "album-draft": "choose",
  "album-1": "album-draft",
  "album-2": "album-1",
  "album-3": "album-2",
  "single-1": "choose",
  "single-2": "single-1",
}

function reducer(s: UploadState, a: UploadAction): UploadState {
  switch (a.type) {
    case "CHOOSE_ALBUM":   return { ...s, step: "album-draft" }
    case "CHOOSE_SINGLE":  return { ...s, step: "single-1" }
    case "GOTO_DRAFT":     return { ...s, step: "album-draft" }
    case "ALBUM_DRAFT_CONTINUE":
      return { ...s, step: "album-2", albumId: a.albumId, draftAlbumId: a.albumId }
    case "ALBUM1_NEXT":
      return { ...s, step: "album-2", ...a.payload }
    case "SET_ALBUM_ID":
      return { ...s, albumId: a.albumId }
    case "ALBUM2_NEXT":
      return { ...s, step: "album-3" }
    case "SUBMIT_ALBUM":
      return { ...s, step: "success-album" }
    case "SINGLE1_NEXT":
      return { ...s, step: "single-2", ...a.payload }
    case "SUBMIT_SINGLE":
      return { ...s, step: "success-single" }
    case "ADD_PENDING_TRACK":
      return { ...s, pendingTracks: [...s.pendingTracks, a.track] }
    case "REMOVE_PENDING_TRACK":
      return { ...s, pendingTracks: s.pendingTracks.filter((t) => t.id !== a.id) }
    case "UPDATE_TRACK_STATUS":
      return {
        ...s,
        pendingTracks: s.pendingTracks.map((t) =>
          t.id === a.id ? { ...t, status: a.status, errorMsg: a.errorMsg } : t
        ),
      }
    case "SET_RELEASE_DATE":
      return { ...s, releaseDate: a.date }
    case "ADD_FEATURED_ARTIST":
      return { ...s, featuredArtists: [...s.featuredArtists, a.name] }
    case "BACK": {
      const prev = BACK_MAP[s.step]
      return prev ? { ...s, step: prev } : s
    }
    default: return s
  }
}

const initial: UploadState = {
  step: "choose",
  draftAlbumId: "",
  albumId: "",
  albumTitle: "", albumArt: null, description: "", year: "",
  pendingTracks: [],
  releaseDate: "",
  singleTitle: "", singleCoverArt: null, singleYear: "", singleReleaseDate: "",
  singleAudioFile: null, featuredArtists: [],
}

// ── Panel wrapper ─────────────────────────────────────────
interface UploadPanelProps { open: boolean; onClose: () => void }

const panelSlide = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit:    { x: "100%", transition: { duration: 0.2 } },
}
const stepFade = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22 } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.15 } },
}

export function UploadPanel({ open, onClose }: UploadPanelProps) {
  const [state, dispatch] = useReducer(reducer, initial)

  const handleClose = () => {
    onClose()
    setTimeout(() => dispatch({ type: "BACK" }), 300)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="upload-panel"
            {...panelSlide}
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[480px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto"
          >
            <AnimatePresence mode="wait">

              {/* ── Choose type ── */}
              {state.step === "choose" && (
                <motion.div key="choose" {...stepFade} className="flex flex-col min-h-full p-8">
                  <div className="flex items-center justify-between mb-8">
                    <button className="md:hidden text-white" onClick={handleClose}>
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-heading text-2xl font-bold text-white">Upload music</h1>
                    <button className="hidden md:block text-vibe-text-muted hover:text-white transition-colors" onClick={handleClose}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-vibe-text-secondary mb-8">
                    Welcome, please how do you want to share your song?
                  </p>
                  <ChooseTypeStep
                    onAlbum={() => dispatch({ type: "CHOOSE_ALBUM" })}
                    onSingle={() => dispatch({ type: "CHOOSE_SINGLE" })}
                  />
                </motion.div>
              )}

              {/* ── Album: Draft or Fresh ── */}
              {state.step === "album-draft" && (
                <motion.div key="album-draft" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Create Album" onBack={() => dispatch({ type: "BACK" })} />
                  <AlbumDraftStep
                    onContinueDraft={(id) => dispatch({ type: "ALBUM_DRAFT_CONTINUE", albumId: id })}
                    onFresh={() => dispatch({ type: "ALBUM1_NEXT", payload: { albumTitle: "", albumArt: null, description: "", year: "" } })}
                  />
                </motion.div>
              )}

              {/* ── Album Step 1 — Metadata ── */}
              {state.step === "album-1" && (
                <motion.div key="album-1" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Create Album" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">Share details of your new album here.</p>
                  <StepProgressBar steps={3} current={1} className="mb-7" />
                  <Album1Form
                    onNext={(p) => dispatch({ type: "ALBUM1_NEXT", payload: p })}
                    onAlbumCreated={(id) => dispatch({ type: "SET_ALBUM_ID", albumId: id })}
                  />
                </motion.div>
              )}

              {/* ── Album Step 2 — Multi-track upload ── */}
              {state.step === "album-2" && (
                <motion.div key="album-2" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Create Album" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">Add tracks to your album</p>
                  <StepProgressBar steps={3} current={2} className="mb-7" />
                  <AlbumTracksForm
                    albumId={state.albumId}
                    pendingTracks={state.pendingTracks}
                    onAddTrack={(t) => dispatch({ type: "ADD_PENDING_TRACK", track: t })}
                    onRemoveTrack={(id) => dispatch({ type: "REMOVE_PENDING_TRACK", id })}
                    onUpdateStatus={(id, status, errorMsg) =>
                      dispatch({ type: "UPDATE_TRACK_STATUS", id, status, errorMsg })
                    }
                    onNext={() => dispatch({ type: "ALBUM2_NEXT" })}
                  />
                </motion.div>
              )}

              {/* ── Album Step 3 — Release & Publish ── */}
              {state.step === "album-3" && (
                <motion.div key="album-3" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Create Album" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">Almost done — set release date and publish.</p>
                  <StepProgressBar steps={3} current={3} className="mb-7" />
                  <AlbumPublishForm
                    albumId={state.albumId}
                    trackCount={state.pendingTracks.length}
                    onSubmit={() => dispatch({ type: "SUBMIT_ALBUM" })}
                  />
                </motion.div>
              )}

              {/* ── Single Step 1 ── */}
              {state.step === "single-1" && (
                <motion.div key="single-1" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Upload a single" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">Share details of your new single here.</p>
                  <StepProgressBar steps={2} current={1} className="mb-7" />
                  <Single1Form onNext={(p) => dispatch({ type: "SINGLE1_NEXT", payload: p })} />
                </motion.div>
              )}

              {/* ── Single Step 2 ── */}
              {state.step === "single-2" && (
                <motion.div key="single-2" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Upload a single" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">Share details of your new single here.</p>
                  <StepProgressBar steps={2} current={2} className="mb-7" />
                  <Single2Form
                    singleTitle={state.singleTitle}
                    coverArt={state.singleCoverArt}
                    releaseDate={state.singleReleaseDate}
                    featuredArtists={state.featuredArtists}
                    onAddArtist={(name) => dispatch({ type: "ADD_FEATURED_ARTIST", name })}
                    onSubmit={() => dispatch({ type: "SUBMIT_SINGLE" })}
                  />
                </motion.div>
              )}

              {/* ── Success (album) ── */}
              {state.step === "success-album" && (
                <motion.div key="success-album" {...stepFade} className="flex flex-col items-center justify-center min-h-full p-8">
                  <SuccessView
                    message="We will send you an update on your email about your new album creation!"
                    onClose={handleClose}
                  />
                </motion.div>
              )}

              {/* ── Success (single) ── */}
              {state.step === "success-single" && (
                <motion.div key="success-single" {...stepFade} className="flex flex-col items-center justify-center min-h-full p-8">
                  <SuccessView
                    message="We will send you an update on your email about your new single."
                    onClose={handleClose}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 hidden md:block"
            onClick={handleClose}
          />
        </>
      )}
    </AnimatePresence>
  )
}

// ── Shared sub-components ─────────────────────────────────

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={onBack} className="text-white hover:text-vibe-text-secondary transition-colors">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="font-heading text-2xl font-bold text-white">{title}</h1>
    </div>
  )
}

// ── Choose type ───────────────────────────────────────────
function ChooseTypeStep({ onAlbum, onSingle }: { onAlbum: () => void; onSingle: () => void }) {
  const [selected, setSelected] = useState<"album" | "single" | null>(null)

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TypeCard
          selected={selected === "album"}
          onSelect={() => setSelected("album")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          }
          label="Create an Album"
        />
        <TypeCard
          selected={selected === "single"}
          onSelect={() => setSelected("single")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
          label="Upload a single"
        />
      </div>
      <div className="mt-auto pt-4">
        <Button
          size="lg" rounded="full" className="w-full"
          disabled={!selected}
          onClick={() => selected === "album" ? onAlbum() : onSingle()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function TypeCard({
  selected, onSelect, icon, label,
}: { selected: boolean; onSelect: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-8 transition-all duration-150",
        selected
          ? "border-vibe-amber bg-vibe-amber/90 text-vibe-onyx"
          : "border-vibe-onyx-400 bg-vibe-onyx-300 text-vibe-text-primary hover:border-vibe-amber/50"
      )}
    >
      <span className="text-3xl font-light leading-none">+</span>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
      </div>
    </button>
  )
}

// ── Album: Draft or Fresh ─────────────────────────────────
function AlbumDraftStep({
  onContinueDraft,
  onFresh,
}: {
  onContinueDraft: (id: string) => void
  onFresh: () => void
}) {
  const [mode, setMode]           = useState<"fresh" | "draft" | null>(null)
  const [albumId, setAlbumId]     = useState("")
  const [checking, setChecking]   = useState(false)
  const [idError, setIdError]     = useState("")
  const { data: draftAlbum, isLoading, isError } = useGetAlbumByIdQuery(albumId.trim(), {
    skip: !checking || !albumId.trim(),
  })

  const handleContinue = async () => {
    if (!albumId.trim()) { setIdError("Please enter an album ID"); return }
    setIdError("")
    setChecking(true)
  }

  // When query resolves
  if (checking && !isLoading) {
    if (draftAlbum && !isError) {
      onContinueDraft(albumId.trim())
    } else if (isError) {
      setIdError("Album not found. Check the ID and try again.")
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-6">
      <p className="text-sm text-vibe-text-secondary">
        Do you have an album in progress, or are you starting fresh?
      </p>

      {/* Option cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Continue draft */}
        <button
          type="button"
          onClick={() => setMode("draft")}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 transition-all",
            mode === "draft"
              ? "border-vibe-red bg-vibe-red/10 text-white"
              : "border-vibe-onyx-400 bg-vibe-onyx-300 text-vibe-text-muted hover:border-vibe-red/40"
          )}
        >
          <FolderOpen className="h-7 w-7" />
          <span className="text-sm font-semibold text-center leading-tight">Continue<br/>Draft</span>
        </button>

        {/* Fresh start */}
        <button
          type="button"
          onClick={() => { setMode("fresh"); setIdError("") }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 transition-all",
            mode === "fresh"
              ? "border-vibe-amber bg-vibe-amber/10 text-white"
              : "border-vibe-onyx-400 bg-vibe-onyx-300 text-vibe-text-muted hover:border-vibe-amber/40"
          )}
        >
          <Plus className="h-7 w-7" />
          <span className="text-sm font-semibold text-center leading-tight">New<br/>Album</span>
        </button>
      </div>

      {/* Draft ID input */}
      <AnimatePresence>
        {mode === "draft" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-2"
          >
            <p className="text-sm font-medium text-vibe-text-secondary">Enter your Album ID</p>
            <p className="text-xs text-vibe-text-muted">
              You can find this in your email confirmation or My Music page.
            </p>
            <Input
              placeholder="e.g. alb_3f8a2c..."
              value={albumId}
              onChange={(e) => { setAlbumId(e.target.value); setIdError("") }}
              className={cn(idError && "border-vibe-red")}
            />
            {idError && (
              <p className="flex items-center gap-1.5 text-xs text-vibe-red">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{idError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-2">
        {mode === "draft" ? (
          <Button
            size="lg" rounded="full" className="w-full"
            onClick={handleContinue}
            loading={isLoading && checking}
            disabled={!albumId.trim()}
          >
            Continue Album
          </Button>
        ) : (
          <Button
            size="lg" rounded="full" className="w-full"
            disabled={mode !== "fresh"}
            onClick={onFresh}
          >
            Start Fresh
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Album Step 1 — Metadata ───────────────────────────────
const GENRES = ["Afrobeats","Hip-Hop","R&B","Pop","Rock","Electronic","Indie","Jazz","Gospel","Classical"]

const album1Schema = z.object({
  albumTitle:  z.string().min(1, "Album title is required"),
  description: z.string().optional(),
  year:        z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
})

function Album1Form({
  onNext,
  onAlbumCreated,
}: {
  onNext: (p: Pick<UploadState, "albumTitle"|"albumArt"|"description"|"year">) => void
  onAlbumCreated: (id: string) => void
}) {
  const [albumArt, setAlbumArt]   = useState<File | null>(null)
  const [artError, setArtError]   = useState("")
  const [createAlbum, { isLoading }] = useCreateAlbumMutation()

  const form = useForm<z.infer<typeof album1Schema>>({
    resolver: zodResolver(album1Schema),
    defaultValues: { albumTitle: "", description: "", year: "" },
  })

  const onSubmit = async (v: z.infer<typeof album1Schema>) => {
    if (!albumArt) { setArtError("Please upload album art"); return }
    setArtError("")

    const fd = new FormData()
    fd.append("title", v.albumTitle)
    fd.append("cover", albumArt)
    if (v.description) fd.append("description", v.description)
    if (v.year) fd.append("year", v.year)

    try {
      const result = await createAlbum(fd).unwrap()
      onAlbumCreated(result.id)
      onNext({ albumTitle: v.albumTitle, albumArt, description: v.description ?? "", year: v.year })
    } catch {
      toast.error("Failed to create album. Please try again.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1">
        <FormField control={form.control} name="albumTitle" render={({ field }) => (
          <FormItem>
            <FormLabel>Album title</FormLabel>
            <FormControl><Input placeholder="Enter name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="space-y-2">
          <p className="text-sm font-medium text-vibe-text-secondary">Upload album art</p>
          <FileDropzone accept="image/*" hint="JPG, PNG or GIF - Max file size 4MB" maxSizeMB={4}
            value={albumArt} onChange={setAlbumArt} type="image" />
          {artError && <p className="text-xs text-vibe-red">{artError}</p>}
        </div>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <textarea placeholder="Describe your album"
                className="flex min-h-[80px] w-full rounded-sm border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-3 text-sm text-vibe-text-primary placeholder:text-vibe-text-muted resize-none focus-visible:outline-none focus-visible:border-vibe-red focus-visible:ring-1 focus-visible:ring-vibe-red/30"
                {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="year" render={({ field }) => (
          <FormItem>
            <FormLabel>Year of recording</FormLabel>
            <FormControl><Input placeholder="YYYY" maxLength={4} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="mt-auto pt-2">
          <Button type="submit" size="lg" rounded="full" className="w-full" loading={isLoading}>
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ── Album Step 2 — Multi-track upload ────────────────────
const trackSchema = z.object({
  title:  z.string().min(1, "Track title is required"),
  genre:  z.string().min(1, "Select a genre"),
  price:  z.string().default("0"),
})

function AlbumTracksForm({
  albumId,
  pendingTracks,
  onAddTrack,
  onRemoveTrack,
  onUpdateStatus,
  onNext,
}: {
  albumId: string
  pendingTracks: PendingTrack[]
  onAddTrack: (t: PendingTrack) => void
  onRemoveTrack: (id: string) => void
  onUpdateStatus: (id: string, status: PendingTrack["status"], errorMsg?: string) => void
  onNext: () => void
}) {
  const [addTrackToAlbum] = useAddTrackToAlbumMutation()
  const [isUploading, setIsUploading] = useState(false)

  // Per-track form state
  const [audioFile, setAudioFile]   = useState<File | null>(null)
  const [coverFile, setCoverFile]   = useState<File | null>(null)
  const [audioError, setAudioError] = useState("")
  const [showForm, setShowForm]     = useState(pendingTracks.length === 0)

  const form = useForm<z.infer<typeof trackSchema>>({
    resolver: zodResolver(trackSchema),
    defaultValues: { title: "", genre: "", price: "0" },
  })

  const handleAddToList = form.handleSubmit((v) => {
    if (!audioFile) { setAudioError("Please upload an audio file"); return }
    setAudioError("")
    const track: PendingTrack = {
      id:        crypto.randomUUID(),
      title:     v.title,
      genre:     v.genre,
      price:     v.price,
      audioFile,
      coverFile,
      status:    "pending",
    }
    onAddTrack(track)
    // Reset for next track
    form.reset()
    setAudioFile(null)
    setCoverFile(null)
    setShowForm(false)
  })

  const handleUploadAll = async () => {
    const pending = pendingTracks.filter((t) => t.status === "pending")
    if (pending.length === 0 && pendingTracks.length > 0) {
      // All already uploaded or errored — just proceed
      onNext()
      return
    }
    setIsUploading(true)
    for (const track of pending) {
      onUpdateStatus(track.id, "uploading")
      const fd = new FormData()
      fd.append("title",       track.title)
      fd.append("audio",       track.audioFile)
      fd.append("genre",       track.genre)
      fd.append("price",       track.price)
      fd.append("is_for_sale", track.price !== "0" ? "true" : "false")
      if (track.coverFile) fd.append("cover", track.coverFile)
      try {
        await addTrackToAlbum({ albumId, body: fd }).unwrap()
        onUpdateStatus(track.id, "done")
      } catch {
        onUpdateStatus(track.id, "error", "Upload failed")
      }
    }
    setIsUploading(false)
    onNext()
  }

  const allDone    = pendingTracks.length > 0 && pendingTracks.every((t) => t.status === "done")
  const hasErrors  = pendingTracks.some((t) => t.status === "error")
  const canProceed = pendingTracks.length > 0

  return (
    <div className="flex flex-col gap-5 flex-1">

      {/* Track list */}
      {pendingTracks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-vibe-text-secondary">
            Tracks ({pendingTracks.length})
          </p>
          <div className="space-y-2">
            {pendingTracks.map((track, i) => (
              <TrackListItem
                key={track.id}
                track={track}
                index={i}
                onRemove={() => onRemoveTrack(track.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add track form */}
      <AnimatePresence>
        {showForm ? (
          <motion.div
            key="track-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-vibe-onyx-400 bg-vibe-onyx-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Add Track</p>
                {pendingTracks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-vibe-text-muted hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Form {...form}>
                <div className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Track title</FormLabel>
                      <FormControl><Input placeholder="Enter track name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="genre" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-vibe-text-secondary">Audio file</p>
                    <FileDropzone
                      accept=".mp3,.wav,.m4a"
                      hint="MP3, WAV or M4A – Max 10MB"
                      maxSizeMB={10}
                      value={audioFile}
                      onChange={(f) => { setAudioFile(f); if (f) setAudioError("") }}
                      type="audio"
                    />
                    {audioError && <p className="text-xs text-vibe-red">{audioError}</p>}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-vibe-text-secondary">Track art <span className="text-vibe-text-muted font-normal">(optional)</span></p>
                    <FileDropzone
                      accept="image/*"
                      hint="JPG, PNG or GIF – Max 4MB"
                      maxSizeMB={4}
                      value={coverFile}
                      onChange={setCoverFile}
                      type="image"
                    />
                  </div>

                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          icon={<span className="text-sm font-semibold leading-none">₦</span>}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Set to 0 for a free track</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button
                    type="button"
                    size="default"
                    variant="outline"
                    rounded="full"
                    className="w-full"
                    onClick={handleAddToList}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add to Album
                  </Button>
                </div>
              </Form>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="add-more"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-vibe-onyx-400 text-vibe-text-muted hover:border-vibe-red/50 hover:text-white transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add another track
          </motion.button>
        )}
      </AnimatePresence>

      {hasErrors && (
        <p className="flex items-center gap-1.5 text-xs text-vibe-red">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Some tracks failed to upload. They'll be retried when you continue.
        </p>
      )}

      <div className="mt-auto pt-2">
        <Button
          type="button"
          size="lg"
          rounded="full"
          className="w-full"
          disabled={!canProceed || isUploading}
          loading={isUploading}
          onClick={handleUploadAll}
        >
          {allDone ? "Next" : `Upload ${pendingTracks.filter(t => t.status === "pending").length} Track${pendingTracks.filter(t => t.status === "pending").length !== 1 ? "s" : ""} & Continue`}
        </Button>
      </div>
    </div>
  )
}

// ── Track list item ───────────────────────────────────────
function TrackListItem({
  track,
  index,
  onRemove,
}: {
  track: PendingTrack
  index: number
  onRemove: () => void
}) {
  const statusIcon = {
    pending:   <Music2 className="h-3.5 w-3.5 text-vibe-text-muted" />,
    uploading: <Loader2 className="h-3.5 w-3.5 text-vibe-amber animate-spin" />,
    done:      <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />,
    error:     <AlertCircle className="h-3.5 w-3.5 text-vibe-red" />,
  }[track.status]

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
      track.status === "error"
        ? "border-vibe-red/40 bg-vibe-red/5"
        : track.status === "done"
        ? "border-green-500/30 bg-green-500/5"
        : "border-vibe-onyx-400 bg-vibe-onyx-300"
    )}>
      <span className="shrink-0 text-xs font-medium text-vibe-text-muted w-5 text-center">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{track.title}</p>
        <p className="text-[10px] text-vibe-text-muted">{track.genre} · {track.audioFile.name}</p>
        {track.errorMsg && (
          <p className="text-[10px] text-vibe-red mt-0.5">{track.errorMsg}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {statusIcon}
        {track.status !== "uploading" && track.status !== "done" && (
          <button
            type="button"
            onClick={onRemove}
            className="text-vibe-text-muted hover:text-vibe-red transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Album Step 3 — Publish / Draft ────────────────────────
const publishSchema = z.object({
  releaseDate: z.string().min(1, "Select a release date"),
})

function AlbumPublishForm({
  albumId,
  trackCount,
  onSubmit,
}: {
  albumId: string
  trackCount: number
  onSubmit: () => void
}) {
  const [publishAlbum,   { isLoading: isPublishing }]  = usePublishAlbumMutation()
  const [saveAlbumDraft, { isLoading: isSavingDraft }] = useSaveAlbumDraftMutation()

  const form = useForm<z.infer<typeof publishSchema>>({
    resolver: zodResolver(publishSchema),
    defaultValues: { releaseDate: "" },
  })

  const handlePublish = form.handleSubmit(async () => {
    try {
      await publishAlbum(albumId).unwrap()
      toast.success("Album submitted for review!")
      onSubmit()
    } catch {
      toast.error("Failed to publish album. Please try again.")
    }
  })

  const handleSaveDraft = async () => {
    try {
      await saveAlbumDraft(albumId).unwrap()
      toast.success("Album saved as draft. You can continue later.")
      onSubmit()
    } catch {
      toast.error("Failed to save draft.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handlePublish} className="flex flex-col gap-5 flex-1">

        {/* Summary card */}
        <div className="rounded-xl border border-vibe-onyx-400 bg-vibe-onyx-300 px-4 py-4 space-y-2">
          <p className="text-xs text-vibe-text-muted uppercase tracking-wide font-medium">Album Summary</p>
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4 text-vibe-text-muted shrink-0" />
            <p className="text-sm text-vibe-text-primary">
              {trackCount} track{trackCount !== 1 ? "s" : ""} ready
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-vibe-text-muted shrink-0" />
            <p className="text-sm text-vibe-text-muted font-mono truncate">ID: {albumId}</p>
          </div>
        </div>

        <FormField control={form.control} name="releaseDate" render={({ field }) => (
          <FormItem>
            <FormLabel>Release date</FormLabel>
            <FormControl>
              <Input
                type="date"
                icon={<CalendarDays className="h-4 w-4" />}
                className="[color-scheme:dark]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="mt-auto pt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            rounded="full"
            className="flex-1"
            loading={isSavingDraft}
            disabled={isPublishing || isSavingDraft}
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            size="lg"
            rounded="full"
            className="flex-1"
            loading={isPublishing}
            disabled={isPublishing || isSavingDraft}
          >
            Publish Album
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ── Single forms ──────────────────────────────────────────

const single1Schema = z.object({
  singleTitle:       z.string().min(1, "Track title is required"),
  singleYear:        z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
  singleReleaseDate: z.string().min(1, "Select a release date"),
})

function Single1Form({ onNext }: {
  onNext: (p: Pick<UploadState, "singleTitle"|"singleCoverArt"|"singleYear"|"singleReleaseDate">) => void
}) {
  const [coverArt, setCoverArt] = useState<File | null>(null)
  const [artError, setArtError] = useState("")
  const form = useForm<z.infer<typeof single1Schema>>({
    resolver: zodResolver(single1Schema),
    defaultValues: { singleTitle: "", singleYear: "", singleReleaseDate: "" },
  })
  const onSubmit = (v: z.infer<typeof single1Schema>) => {
    if (!coverArt) { setArtError("Please upload cover art"); return }
    setArtError("")
    onNext({
      singleTitle: v.singleTitle, singleCoverArt: coverArt,
      singleYear: v.singleYear, singleReleaseDate: v.singleReleaseDate,
    })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1">
        <FormField control={form.control} name="singleTitle" render={({ field }) => (
          <FormItem>
            <FormLabel>Track title</FormLabel>
            <FormControl><Input placeholder="Enter name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="space-y-2">
          <p className="text-sm font-medium text-vibe-text-secondary">Upload cover art</p>
          <FileDropzone accept="image/*" hint="JPG, PNG or GIF - Max file size 4MB" maxSizeMB={4}
            value={coverArt} onChange={setCoverArt} type="image" />
          {artError && <p className="text-xs text-vibe-red">{artError}</p>}
        </div>
        <FormField control={form.control} name="singleYear" render={({ field }) => (
          <FormItem>
            <FormLabel>Year of recording</FormLabel>
            <FormControl><Input placeholder="YYYY" maxLength={4} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="singleReleaseDate" render={({ field }) => (
          <FormItem>
            <FormLabel>Release date</FormLabel>
            <FormControl>
              <Input type="date" icon={<CalendarDays className="h-4 w-4" />}
                className="[color-scheme:dark]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="mt-auto pt-2">
          <Button type="submit" size="lg" rounded="full" className="w-full">Next</Button>
        </div>
      </form>
    </Form>
  )
}

function Single2Form({
  singleTitle, coverArt, releaseDate, featuredArtists, onAddArtist, onSubmit,
}: {
  singleTitle: string
  coverArt: File | null
  releaseDate: string
  featuredArtists: string[]
  onAddArtist: (name: string) => void
  onSubmit: () => void
}) {
  const [audioFile, setAudioFile]     = useState<File | null>(null)
  const [audioError, setAudioError]   = useState("")
  const [artistInput, setArtistInput] = useState("")
  const [uploadTrackArtist, { isLoading: isSubmitting }] = useUploadTrackArtistMutation()

  const handleAdd = () => {
    if (artistInput.trim()) { onAddArtist(artistInput.trim()); setArtistInput("") }
  }

  const handleSubmit = async () => {
    if (!audioFile) { setAudioError("Please upload an audio file before submitting."); return }
    setAudioError("")
    const fd = new FormData()
    fd.append("title", singleTitle)
    fd.append("audio", audioFile)
    if (coverArt) fd.append("cover", coverArt)
    try {
      await uploadTrackArtist(fd).unwrap()
      toast.success("Single uploaded successfully!")
      onSubmit()
    } catch {
      toast.error("Upload failed. Please try again.")
    }
  }

  return (
    <div className="flex flex-col gap-5 flex-1">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-vibe-text-secondary">Upload Track</p>
        <FileDropzone
          accept=".mp3,.wav,.m4a"
          hint="MP3, WAV or M4A – Max file size 10MB"
          maxSizeMB={10}
          value={audioFile}
          onChange={(f) => { setAudioFile(f); if (f) setAudioError("") }}
          type="audio"
        />
        {audioError && <p className="text-xs text-vibe-red">{audioError}</p>}
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-vibe-text-secondary">Add featured artist</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter featured artist name"
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } }}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="default" rounded="sm" onClick={handleAdd} className="shrink-0 gap-1.5">
            <Plus className="h-4 w-4" />Add
          </Button>
        </div>
        {featuredArtists.length > 0 && (
          <div className="space-y-2">
            {featuredArtists.map((artist, i) => (
              <div key={i} className="flex items-center justify-between rounded-sm bg-vibe-onyx-300 border border-vibe-onyx-400 px-4 py-2.5">
                <span className="text-sm text-vibe-text-secondary">{i + 1}.&nbsp;&nbsp;{artist}</span>
                <button type="button" className="text-xs text-vibe-text-muted hover:text-white transition-colors flex items-center gap-1">
                  <Pencil className="h-3 w-3" /><span>Edit</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {(singleTitle || releaseDate) && (
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 px-4 py-3 space-y-1">
          <p className="text-xs text-vibe-text-muted uppercase tracking-wide font-medium">Submitting</p>
          {singleTitle && <p className="text-sm text-vibe-text-primary"><span className="text-vibe-text-muted">Title: </span>{singleTitle}</p>}
          {releaseDate && <p className="text-sm text-vibe-text-primary"><span className="text-vibe-text-muted">Release: </span>{new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>}
          {coverArt && <p className="text-sm text-vibe-text-primary"><span className="text-vibe-text-muted">Cover: </span>{coverArt.name}</p>}
        </div>
      )}
      <div className="mt-auto pt-2 flex gap-3">
        <Button size="lg" rounded="full" className="w-full" onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
          Submit for review
        </Button>
      </div>
    </div>
  )
}

// ── Success screen ────────────────────────────────────────
function SuccessView({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <AmberTrophyIllustration />
      <div className="space-y-3">
        <h2 className="font-heading text-2xl font-bold text-white">Submission complete</h2>
        <p className="font-semibold text-sm text-white">Thank you for submitting a masterpiece!</p>
        <p className="text-sm text-vibe-text-secondary max-w-xs">{message}</p>
      </div>
      <Button variant="outline" size="lg" rounded="full" className="w-full mt-4" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
