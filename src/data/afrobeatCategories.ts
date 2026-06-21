export interface AfrobeatCategory {
  id: string
  label: string
  /** Picsum seed paths — placeholder collage art until real category artwork exists */
  images: string[]
}

export const AFROBEAT_CATEGORIES: AfrobeatCategory[] = [
  { id: "c1", label: "Afropop",     images: ["seed/af1a/150/150", "seed/af1b/150/150", "seed/af1c/150/150", "seed/af1d/150/150"] },
  { id: "c2", label: "Street jamz", images: ["seed/af2a/150/150", "seed/af2b/150/150", "seed/af2c/150/150", "seed/af2d/150/150"] },
  { id: "c3", label: "Afro fusion", images: ["seed/af3a/150/150", "seed/af3b/150/150", "seed/af3c/150/150", "seed/af3d/150/150"] },
  { id: "c4", label: "Dancehall",   images: ["seed/af4a/150/150", "seed/af4b/150/150", "seed/af4c/150/150", "seed/af4d/150/150"] },
  { id: "c5", label: "Highlife",    images: ["seed/af5a/150/150", "seed/af5b/150/150", "seed/af5c/150/150", "seed/af5d/150/150"] },
]
