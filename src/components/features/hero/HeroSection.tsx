import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

// Stagger animation variants
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export function HeroSection() {
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-vibe-gradient" />
      <div className="absolute inset-0 bg-hero-radial" />

      {/* Animated background orbs */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Large red orb — right side */}
        <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-vibe-red/8 blur-[120px]" />
        {/* Amber orb — left bottom */}
        <div className="absolute bottom-[-5%] left-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-vibe-amber/5 blur-[100px]" />
        {/* Purple accent */}
        <div className="absolute top-[30%] left-[10%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-vibe-purple/6 blur-[80px]" />
      </motion.div>

      {/* Artist silhouette — abstract figure on the right */}
      <motion.div
        style={{ y, opacity }}
        className="absolute right-0 bottom-0 w-[45vw] max-w-[600px] h-full pointer-events-none select-none hidden lg:block"
        aria-hidden="true"
      >
        <ArtistSilhouetteSVG />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 container mx-auto px-4 pt-24 pb-16"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div variants={item} className="flex items-center gap-2 mb-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibe-red/10 border border-vibe-red/20 text-vibe-red text-xs font-heading font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-vibe-red animate-pulse" />
              Now Streaming
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-display text-display-2xl text-white leading-none mb-6"
          >
            Where music{" "}
            <span className="block">lives, artists</span>
            <span className="block">
              thrive, and{" "}
              <span className="text-gradient-amber">fans connect.</span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="text-base md:text-lg text-vibe-text-secondary leading-relaxed mb-10 max-w-lg"
          >
            Discover, share, and connect through music in a community where every sound matters.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              rounded="sm"
              onClick={() => navigate("/join")}
              className="group"
            >
              Join the Vibe
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              rounded="sm"
              className="group border border-vibe-onyx-400 hover:border-vibe-text-muted"
            >
              <Play className="mr-2 h-4 w-4 fill-current transition-transform group-hover:scale-110" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-8 mt-14 pt-8 border-t border-vibe-onyx-400/50"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl text-white">{stat.value}</p>
                <p className="text-xs text-vibe-text-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-vibe-red/60" />
        <div className="w-1 h-1 rounded-full bg-vibe-red" />
      </motion.div>
    </section>
  )
}

const HERO_STATS = [
  { value: "2M+", label: "Active Listeners" },
  { value: "50K+", label: "Independent Artists" },
  { value: "5M+", label: "Tracks Available" },
]

// Abstract artist silhouette SVG
function ArtistSilhouetteSVG() {
  return (
    <svg
      viewBox="0 0 500 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain opacity-30"
      preserveAspectRatio="xMaxYMax meet"
    >
      {/* Abstract body silhouette */}
      <ellipse cx="280" cy="350" rx="180" ry="300" fill="url(#body-grad)" />
      {/* Head */}
      <ellipse cx="280" cy="130" rx="80" ry="90" fill="url(#head-grad)" />
      {/* Headphone arc */}
      <path
        d="M200 120 Q280 60 360 120"
        stroke="#C8102E"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {/* Headphone cups */}
      <ellipse cx="200" cy="135" rx="16" ry="22" fill="#C8102E" opacity="0.9" />
      <ellipse cx="360" cy="135" rx="16" ry="22" fill="#C8102E" opacity="0.9" />
      {/* Sound waves around head */}
      <path d="M155 100 Q140 120 155 140" stroke="#F4A435" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M140 90 Q118 120 140 150" stroke="#F4A435" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M405 100 Q420 120 405 140" stroke="#F4A435" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M420 90 Q442 120 420 150" stroke="#F4A435" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Floating music notes */}
      <text x="80" y="200" fontSize="28" fill="#C8102E" opacity="0.5">♪</text>
      <text x="440" y="280" fontSize="22" fill="#F4A435" opacity="0.4">♫</text>
      <text x="60" y="350" fontSize="18" fill="#6C3EB8" opacity="0.4">♩</text>
      <text x="450" y="160" fontSize="20" fill="#C8102E" opacity="0.3">♬</text>

      <defs>
        <radialGradient id="body-grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2E1010" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="head-grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3A1818" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1A0808" stopOpacity="0.6" />
        </radialGradient>
      </defs>
    </svg>
  )
}
