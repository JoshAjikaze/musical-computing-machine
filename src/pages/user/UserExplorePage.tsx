import { useState, useEffect } from "react"
import { Play, Heart } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Mock data ─────────────────────────────────────────────
const CATEGORIES = ["All", "Gospel", "HIP-HOP/Rap", "Pop", "Rock", "Jazz", "Afro beats", "R/B Soul"]

const FEATURED_ITEMS = [
  { title: "Rahama",        artist: "Kaestrings",    plays: "122 Million plays", coverUrl: "https://picsum.photos/seed/rahama/300/300"   },
  { title: "Midnight Fire", artist: "Amara Nwosu",   plays: "98 Million plays",  coverUrl: "https://picsum.photos/seed/midfire/300/300"  },
  { title: "Lagos Nights",  artist: "Davido",        plays: "210 Million plays", coverUrl: "https://picsum.photos/seed/lagosnights/300/300" },
  { title: "Elevation",     artist: "Nathaniel Bassey", plays: "55 Million plays", coverUrl: "https://picsum.photos/seed/elevation/300/300" },
]

const POPULAR_ARTISTS = [
  { id: "pa1", name: "Peterson Okopi",   avatarUrl: "https://picsum.photos/seed/pa1/80/80" },
  { id: "pa2", name: "Nathaniel Bassey", avatarUrl: "https://picsum.photos/seed/pa2/80/80" },
  { id: "pa3", name: "Frank Edwards",    avatarUrl: "https://picsum.photos/seed/pa3/80/80" },
  { id: "pa4", name: "Mercy Chinwo",     avatarUrl: "https://picsum.photos/seed/pa4/80/80" },
  { id: "pa5", name: "GUC",              avatarUrl: "https://picsum.photos/seed/pa5/80/80" },
  { id: "pa6", name: "Judikay",          avatarUrl: "https://picsum.photos/seed/pa6/80/80" },
]

export function UserExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [featuredIdx, setFeaturedIdx]       = useState(0)
  const [liked, setLiked]                   = useState(false)

  // Auto-advance carousel every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setFeaturedIdx((i) => (i + 1) % FEATURED_ITEMS.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const featured = FEATURED_ITEMS[featuredIdx]

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Explore</h1>
          <p className="text-sm text-vibe-text-secondary mt-0.5">
            You might want to check out these artists
          </p>
        </div>
        <Button size="default" rounded="full" className="shrink-0">
          Get free V coins
        </Button>
      </div>

      {/* Browse Categories */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 px-4 py-4">
        <p className="text-xs font-medium text-vibe-text-muted mb-3">Browse Categories</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors duration-150",
                activeCategory === cat
                  ? "border-vibe-text-secondary bg-vibe-onyx-400 text-white"
                  : "border-vibe-onyx-400 bg-transparent text-vibe-text-secondary hover:border-vibe-text-muted hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured artist card */}
      <div className="rounded-lg border border-vibe-onyx-400 bg-vibe-onyx-200 p-5 overflow-hidden">
        <div className="flex items-start justify-between gap-2 mb-4">
          <span className="text-xs font-medium text-vibe-text-muted uppercase tracking-wider">Featured</span>
          {/* Dot navigation */}
          <div className="flex items-center gap-1.5">
            {FEATURED_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setFeaturedIdx(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  featuredIdx === i
                    ? "w-4 h-2 bg-white"
                    : "w-2 h-2 bg-vibe-onyx-400 hover:bg-vibe-text-muted"
                )}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={featuredIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-6"
          >
            {/* Text side */}
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="font-display text-4xl text-white leading-none">{featured.title}</h2>
              <p className="text-sm text-vibe-text-secondary">
                {featured.artist} &nbsp;·&nbsp; {featured.plays}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Button size="sm" rounded="full" className="gap-2 px-5">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Play now
                </Button>
                <button
                  onClick={() => setLiked((v) => !v)}
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
                    liked
                      ? "border-vibe-red bg-vibe-red/10 text-vibe-red"
                      : "border-vibe-onyx-400 bg-vibe-onyx-300 text-vibe-text-muted hover:text-white hover:border-vibe-text-muted"
                  )}
                >
                  <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                </button>
              </div>
            </div>

            {/* Cover art */}
            <div className="shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-lg overflow-hidden">
              <img
                src={featured.coverUrl}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Popular Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold text-white">Popular Artist</h2>
          <button className="text-xs text-vibe-text-muted hover:text-white transition-colors">
            Show all
          </button>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
          {POPULAR_ARTISTS.map((artist) => (
            <motion.div
              key={artist.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-vibe-onyx-400 group-hover:ring-vibe-red/40 transition-all">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-vibe-text-secondary text-center leading-tight w-16 truncate">
                {artist.name}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
