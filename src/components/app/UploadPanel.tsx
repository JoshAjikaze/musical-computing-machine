import { AmberTrophyIllustration } from "@/components/app/AmberTrophyIllustration"
import { useReducer, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, X, Pencil, CalendarDays, DollarSign, Plus } from "lucide-react"
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
import { useUploadTrackArtistMutation } from "@/store/api/vibeApi"
import { toast } from "sonner"

// ── Types ────────────────────────────────────────────────
type UploadStep =
  | "choose"
  | "album-1" | "album-2" | "album-3"
  | "single-1" | "single-2"
  | "success-album" | "success-single"

interface UploadState {
  step: UploadStep
  // album
  albumTitle: string; albumArt: File | null; description: string; year: string
  trackTitle: string; genre: string; trackArt: File | null; price: string
  uploadedTracks: { name: string; artists: string }[]
  audioFile: File | null; releaseDate: string
  // single
  singleTitle: string; singleCoverArt: File | null
  singleYear: string; singleReleaseDate: string
  singleAudioFile: File | null
  featuredArtists: string[]
}

type UploadAction =
  | { type: "CHOOSE_ALBUM" }
  | { type: "CHOOSE_SINGLE" }
  | { type: "ALBUM1_NEXT"; payload: Pick<UploadState, "albumTitle"|"albumArt"|"description"|"year"> }
  | { type: "ALBUM2_NEXT"; payload: Pick<UploadState, "trackTitle"|"genre"|"trackArt"|"price"> }
  | { type: "SUBMIT_ALBUM" }
  | { type: "SINGLE1_NEXT"; payload: Pick<UploadState, "singleTitle"|"singleCoverArt"|"singleYear"|"singleReleaseDate"> }
  | { type: "SUBMIT_SINGLE" }
  | { type: "ADD_TRACK"; track: { name: string; artists: string } }
  | { type: "ADD_FEATURED_ARTIST"; name: string }
  | { type: "BACK" }

const BACK_MAP: Partial<Record<UploadStep, UploadStep>> = {
  "album-1": "choose", "album-2": "album-1", "album-3": "album-2",
  "single-1": "choose", "single-2": "single-1",
}

function reducer(s: UploadState, a: UploadAction): UploadState {
  switch (a.type) {
    case "CHOOSE_ALBUM":   return { ...s, step: "album-1" }
    case "CHOOSE_SINGLE":  return { ...s, step: "single-1" }
    case "ALBUM1_NEXT":    return { ...s, step: "album-2", ...a.payload }
    case "ALBUM2_NEXT":    return { ...s, step: "album-3", ...a.payload }
    case "SUBMIT_ALBUM":   return { ...s, step: "success-album" }
    case "SINGLE1_NEXT":   return { ...s, step: "single-2", ...a.payload }
    case "SUBMIT_SINGLE":  return { ...s, step: "success-single" }
    case "ADD_TRACK":      return { ...s, uploadedTracks: [...s.uploadedTracks, a.track] }
    case "ADD_FEATURED_ARTIST": return { ...s, featuredArtists: [...s.featuredArtists, a.name] }
    case "BACK": {
      const prev = BACK_MAP[s.step]
      return prev ? { ...s, step: prev } : s
    }
    default: return s
  }
}

const initial: UploadState = {
  step: "choose",
  albumTitle: "", albumArt: null, description: "", year: "",
  trackTitle: "", genre: "", trackArt: null, price: "",
  uploadedTracks: [], audioFile: null, releaseDate: "",
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
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[460px] bg-[#1c1c1c] border-l border-vibe-onyx-400 overflow-y-auto"
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

              {/* ── Album Step 1 ── */}
              {state.step === "album-1" && (
                <motion.div key="album-1" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Create Album" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">Share details of your new album here.</p>
                  <StepProgressBar steps={3} current={1} className="mb-7" />
                  <Album1Form onNext={(p) => dispatch({ type: "ALBUM1_NEXT", payload: p })} />
                </motion.div>
              )}

              {/* ── Album Step 2 ── */}
              {state.step === "album-2" && (
                <motion.div key="album-2" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Create Album" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">Add tracks to your album</p>
                  <StepProgressBar steps={3} current={2} className="mb-7" />
                  <Album2Form onNext={(p) => dispatch({ type: "ALBUM2_NEXT", payload: p })} />
                </motion.div>
              )}

              {/* ── Album Step 3 ── */}
              {state.step === "album-3" && (
                <motion.div key="album-3" {...stepFade} className="flex flex-col min-h-full p-8">
                  <PanelHeader title="Create Album" onBack={() => dispatch({ type: "BACK" })} />
                  <p className="text-sm text-vibe-text-secondary mb-5">We're almost done here, just some finishing touches.</p>
                  <StepProgressBar steps={3} current={3} className="mb-7" />
                  <Album3Form
                    uploadedTracks={state.uploadedTracks}
                    onAddTrack={(t) => dispatch({ type: "ADD_TRACK", track: t })}
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

          {/* Backdrop — desktop */}
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

// Choose type
function ChooseTypeStep({ onAlbum, onSingle }: { onAlbum: () => void; onSingle: () => void }) {
  const [selected, setSelected] = useState<"album" | "single" | null>(null)

  const handleNext = () => {
    if (selected === "album") onAlbum()
    else if (selected === "single") onSingle()
  }

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
        <Button size="lg" rounded="full" className="w-full" disabled={!selected} onClick={handleNext}>
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

// ── Album forms (unchanged from previous build) ───────────

const GENRES = ["Afrobeats","Hip-Hop","R&B","Pop","Rock","Electronic","Indie","Jazz","Gospel","Classical"]

const album1Schema = z.object({
  albumTitle:  z.string().min(1, "Album title is required"),
  description: z.string().optional(),
  year:        z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
})

function Album1Form({ onNext }: {
  onNext: (p: Pick<UploadState, "albumTitle"|"albumArt"|"description"|"year">) => void
}) {
  const [albumArt, setAlbumArt] = useState<File | null>(null)
  const [artError, setArtError] = useState("")
  const form = useForm<z.infer<typeof album1Schema>>({
    resolver: zodResolver(album1Schema),
    defaultValues: { albumTitle: "", description: "", year: "" },
  })
  const onSubmit = (v: z.infer<typeof album1Schema>) => {
    if (!albumArt) { setArtError("Please upload album art"); return }
    setArtError("")
    onNext({ albumTitle: v.albumTitle, albumArt, description: v.description ?? "", year: v.year })
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
          <Button type="submit" size="lg" rounded="full" className="w-full">Next</Button>
        </div>
      </form>
    </Form>
  )
}

const album2Schema = z.object({
  trackTitle: z.string().min(1, "Track title is required"),
  genre:      z.string().min(1, "Select a genre"),
  price:      z.string().min(1, "Enter a price"),
})

function Album2Form({ onNext }: { onNext: (p: Pick<UploadState, "trackTitle"|"genre"|"trackArt"|"price">) => void }) {
  const [trackArt, setTrackArt] = useState<File | null>(null)
  const form = useForm<z.infer<typeof album2Schema>>({
    resolver: zodResolver(album2Schema),
    defaultValues: { trackTitle: "", genre: "", price: "" },
  })
  const onSubmit = (v: z.infer<typeof album2Schema>) => {
    onNext({ trackTitle: v.trackTitle, genre: v.genre, trackArt, price: v.price })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1">
        <FormField control={form.control} name="trackTitle" render={({ field }) => (
          <FormItem>
            <FormLabel>Track title</FormLabel>
            <FormControl><Input placeholder="Enter name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="genre" render={({ field }) => (
          <FormItem>
            <FormLabel>Genre</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>
                {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="space-y-2">
          <p className="text-sm font-medium text-vibe-text-secondary">Upload track art</p>
          <FileDropzone accept="image/*" hint="JPG, PNG or GIF - Max file size 4MB" maxSizeMB={4}
            value={trackArt} onChange={setTrackArt} type="image" />
        </div>
        <FormField control={form.control} name="price" render={({ field }) => (
          <FormItem>
            <FormLabel>Album price</FormLabel>
            <FormControl>
              <Input placeholder="Enter Price" icon={<DollarSign className="h-4 w-4" />} {...field} />
            </FormControl>
            <FormDescription>Your album is priceless, put a price on it</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <div className="mt-auto pt-2 flex gap-3">
          <Button type="button" variant="outline" size="lg" rounded="full" className="flex-1"
            onClick={() => form.reset()}>Back</Button>
          <Button type="submit" size="lg" rounded="full" className="flex-1">Next</Button>
        </div>
      </form>
    </Form>
  )
}

interface UploadedTrack { name: string; artists: string }

const album3Schema = z.object({ releaseDate: z.string().min(1, "Select a release date") })

function Album3Form({
  uploadedTracks, onAddTrack, onSubmit,
}: {
  uploadedTracks: UploadedTrack[]
  onAddTrack: (t: UploadedTrack) => void
  onSubmit: () => void
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof album3Schema>>({
    resolver: zodResolver(album3Schema),
    defaultValues: { releaseDate: "" },
  })
  const handleAudioChange = (file: File | null) => {
    setAudioFile(file)
    if (file) onAddTrack({ name: file.name, artists: "" })
  }
  const handleSubmit = form.handleSubmit(async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsSubmitting(false)
    onSubmit()
  })
  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsSaving(false)
    onSubmit()
  }
  const displayTracks: UploadedTrack[] = uploadedTracks.length
    ? uploadedTracks
    : [
        { name: "The stimulus .mp3", artists: "Victor Desire, Jay Z" },
        { name: "Another Track title .mp3", artists: "" },
      ]
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="space-y-2">
          <p className="text-sm font-medium text-vibe-text-secondary">Upload track</p>
          <FileDropzone accept=".mp3,.mwv,.wav" hint="MP3, MWV or WAV - Max file size 5MB" maxSizeMB={5}
            value={audioFile} onChange={handleAudioChange} type="audio" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-vibe-text-secondary">Uploaded tracks</p>
          <div className="space-y-2">
            {displayTracks.map((track, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center justify-between rounded-sm bg-vibe-onyx-300 border border-vibe-onyx-400 px-4 py-2.5">
                  <span className="text-sm text-vibe-text-secondary truncate">{i + 1}.&nbsp;&nbsp;{track.name}</span>
                  <button type="button" className="text-xs text-vibe-text-muted hover:text-white transition-colors ml-3 shrink-0 flex items-center gap-1">
                    <Pencil className="h-3 w-3" /><span>Edit</span>
                  </button>
                </div>
                {track.artists && <p className="text-xs text-vibe-text-muted px-1">{track.artists}</p>}
              </div>
            ))}
          </div>
          <button type="button" className="text-xs text-vibe-text-muted hover:text-white transition-colors">
            Add featured artists
          </button>
        </div>
        <FormField control={form.control} name="releaseDate" render={({ field }) => (
          <FormItem>
            <FormLabel>Release date</FormLabel>
            <FormControl>
              <Input type="date" icon={<CalendarDays className="h-4 w-4" />}
                className="[color-scheme:dark]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="mt-auto pt-2 flex gap-3">
          <Button type="button" variant="outline" size="lg" rounded="full" className="flex-1"
            onClick={handleSaveDraft} loading={isSaving}>Save as draft</Button>
          <Button type="submit" size="lg" rounded="full" className="flex-1" loading={isSubmitting}>
            Submit for review
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
    console.log(v)
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
  singleTitle,
  coverArt,
  releaseDate,
  featuredArtists,
  onAddArtist,
  onSubmit,
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
    if (artistInput.trim()) {
      onAddArtist(artistInput.trim())
      setArtistInput("")
    }
  }

  const handleSubmit = async () => {
    if (!audioFile) {
      setAudioError("Please upload an audio file before submitting.")
      return
    }
    setAudioError("")

    const formData = new FormData()
    formData.append("title", singleTitle)
    formData.append("audio", audioFile)
    formData.append("is_for_sale", "false")
    formData.append("price", String(0))
    if (coverArt) formData.append("cover", coverArt)

    try {
      await uploadTrackArtist(formData).unwrap()
      toast.success("Single uploaded successfully!")
      onSubmit()
    } catch {
      toast.error("Upload failed. Please try again.")
    }
  }

  return (
    <div className="flex flex-col gap-5 flex-1">
      {/* Upload track */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-vibe-text-secondary">Upload Track</p>
        <FileDropzone
          accept=".mp3,.wav,.m4a"
          hint="MP3, WAV or M4A – Max file size 5MB"
          maxSizeMB={5}
          value={audioFile}
          onChange={(f) => { setAudioFile(f); if (f) setAudioError("") }}
          type="audio"
        />
        {audioError && <p className="text-xs text-vibe-red">{audioError}</p>}
      </div>

      {/* Add featured artist */}
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
          <Button
            type="button"
            variant="outline"
            size="default"
            rounded="sm"
            onClick={handleAdd}
            className="shrink-0 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Featured artists list */}
        {featuredArtists.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-vibe-text-secondary">Featured artists</p>
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

      {/* Submission summary — show what will be sent */}
      {(singleTitle || releaseDate) && (
        <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-300 px-4 py-3 space-y-1">
          <p className="text-xs text-vibe-text-muted uppercase tracking-wide font-medium">Submitting</p>
          {singleTitle && (
            <p className="text-sm text-vibe-text-primary">
              <span className="text-vibe-text-muted">Title: </span>{singleTitle}
            </p>
          )}
          {releaseDate && (
            <p className="text-sm text-vibe-text-primary">
              <span className="text-vibe-text-muted">Release: </span>
              {new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
          {coverArt && (
            <p className="text-sm text-vibe-text-primary">
              <span className="text-vibe-text-muted">Cover: </span>{coverArt.name}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-2 flex gap-3">
        <Button
          size="lg"
          rounded="full"
          className="w-full"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Submit for review
        </Button>
      </div>
    </div>
  )
}

// ── Shared success screen ─────────────────────────────────

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
