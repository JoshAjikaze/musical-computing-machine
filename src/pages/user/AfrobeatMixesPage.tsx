import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { AfrobeatCard } from "@/components/app/AfrobeatCard"
import { AFROBEAT_CATEGORIES } from "@/data/afrobeatCategories"

/**
 * "Show all" destination for the home page's "Afrobeat mix for you"
 * section. Unlike Trending Singles / New Releases, this isn't a track
 * list — it's the genre/mix tiles themselves, just given room to breathe
 * in a full grid instead of a horizontal scroller. There's no backend
 * catalog of categories to fetch, so this renders the same
 * AFROBEAT_CATEGORIES data the home page uses; it'll pick up any new
 * categories added there automatically.
 */
export function AfrobeatMixesPage() {
  const navigate = useNavigate()

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 shrink-0 rounded-full bg-vibe-onyx-300 flex items-center justify-center text-white hover:bg-vibe-onyx-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-white">Mixes</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {AFROBEAT_CATEGORIES.map((cat) => (
          <AfrobeatCard key={cat.id} category={cat} className="w-full" />
        ))}
      </div>
    </div>
  )
}
