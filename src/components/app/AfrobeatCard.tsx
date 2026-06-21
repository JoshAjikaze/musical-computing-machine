import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { AfrobeatCategory } from "@/data/afrobeatCategories"

/**
 * Genre/mix tile used on the home page's horizontal scroller and on the
 * "All Afrobeat Mixes" grid (see AfrobeatMixesPage). Purely presentational
 * for now — there's no per-category backend endpoint to drill into yet, so
 * tiles aren't clickable. Wiring that up is a natural next step once a
 * "tracks by genre" endpoint exists.
 */
export function AfrobeatCard({
  category,
  className,
}: {
  category: AfrobeatCategory
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={cn("group shrink-0 w-[160px] md:w-[180px] cursor-pointer", className)}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {category.images.slice(0, 4).map((seed, i) => (
            <div key={i} className="overflow-hidden">
              <img
                src={`https://picsum.photos/${seed}`}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
          <p className="font-heading text-sm font-semibold text-white text-center">{category.label}</p>
        </div>
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/0 group-hover:ring-white/10 transition-all" />
      </div>
    </motion.div>
  )
}
