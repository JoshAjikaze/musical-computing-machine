import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Music2, DollarSign, Users, Smartphone } from "lucide-react"
import { SectionLabel } from "@/components/ui/section-label"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    id: "quality",
    icon: Music2,
    title: "Quality Music",
    description:
      "We create diverse, high-quality music across many genres. Our passionate artists consistently push creative boundaries.",
    align: "left",
    accentColor: "text-vibe-amber",
    image: <QualityMusicIllustration />,
  },
  {
    id: "earn",
    icon: DollarSign,
    title: "Earn",
    description:
      "At Vibe Garage, we ensure artists receive fair compensation and recognition for their work through royalties and promotion.",
    align: "right",
    accentColor: "text-vibe-purple-light",
    image: <EarningsDashboardIllustration />,
  },
  {
    id: "community",
    icon: Users,
    title: "Community",
    description:
      "We believe that music is a powerful tool that can bring people together. That's why we're dedicated to creating a community of music lovers who share our passion.",
    align: "left",
    accentColor: "text-vibe-red",
    image: <CommunityIllustration />,
  },
  {
    id: "access",
    icon: Smartphone,
    title: "Quick Access",
    description:
      "With our user-friendly app, it's easy to find and buy the music you love and subscribe to your favorite artist seamlessly.",
    align: "right",
    accentColor: "text-vibe-amber",
    image: <QuickAccessIllustration />,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function FeaturesSection() {
  return (
    <section className="py-section relative" id="features">
      {/* Top section divider */}
      <div className="section-divider mb-16" />

      <div className="container mx-auto px-4 space-y-6">
        {/* Section label */}
        <SectionLabel>Our Features</SectionLabel>

        {/* Feature rows */}
        <div className="mt-16 space-y-24">
          {FEATURES.map((feature) => (
            <FeatureRow key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureRow({
  feature,
}: {
  feature: (typeof FEATURES)[0]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const isRight = feature.align === "right"

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center",
        isRight && "md:[&>*:first-child]:order-2"
      )}
    >
      {/* Text */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm bg-vibe-onyx-300 border border-vibe-onyx-400">
            <feature.icon className={cn("h-5 w-5", feature.accentColor)} />
          </div>
          <h3 className="font-heading text-2xl font-semibold text-vibe-text-primary">
            {feature.title}
          </h3>
        </div>
        <p className="text-vibe-text-secondary leading-relaxed text-base max-w-md">
          {feature.description}
        </p>
      </div>

      {/* Illustration */}
      <div className="rounded-md overflow-hidden aspect-[4/3] md:aspect-auto md:h-64">
        {feature.image}
      </div>
    </motion.div>
  )
}

// ── Inline SVG Illustrations ─────────────────────────────

function QualityMusicIllustration() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="280" fill="#1A1A1A" rx="8" />
      {/* Woman with headphones silhouette */}
      <ellipse cx="250" cy="240" rx="80" ry="120" fill="#2E1810" opacity="0.8" />
      <ellipse cx="250" cy="120" rx="55" ry="65" fill="#3A2010" />
      {/* Headphones */}
      <path d="M195 115 Q250 75 305 115" stroke="#F4A435" strokeWidth="8" strokeLinecap="round" fill="none" />
      <ellipse cx="195" cy="128" rx="12" ry="16" fill="#F4A435" />
      <ellipse cx="305" cy="128" rx="12" ry="16" fill="#F4A435" />
      {/* Sunglasses */}
      <rect x="218" y="112" width="24" height="14" rx="4" fill="#0A0A0A" stroke="#F4A435" strokeWidth="1.5" />
      <rect x="256" y="112" width="24" height="14" rx="4" fill="#0A0A0A" stroke="#F4A435" strokeWidth="1.5" />
      <line x1="242" y1="119" x2="256" y2="119" stroke="#F4A435" strokeWidth="1.5" />
      {/* Equalizer bars bottom left */}
      {[0,1,2,3,4].map((i) => (
        <rect
          key={i}
          x={20 + i * 18}
          y={280 - (30 + Math.sin(i * 1.3) * 20 + i * 8)}
          width="10"
          height={30 + Math.sin(i * 1.3) * 20 + i * 8}
          fill="#C8102E"
          rx="2"
          opacity={0.7 + i * 0.06}
        />
      ))}
      {/* Music notes */}
      <text x="30" y="50" fontSize="32" fill="#F4A435" opacity="0.5">♪</text>
      <text x="340" y="80" fontSize="24" fill="#C8102E" opacity="0.4">♫</text>
      {/* Warm tone overlay */}
      <rect width="400" height="280" fill="url(#warm-overlay)" rx="8" />
      <defs>
        <radialGradient id="warm-overlay" cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F4A435" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C8102E" stopOpacity="0.04" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function EarningsDashboardIllustration() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="280" fill="#12091F" rx="8" />
      {/* Window chrome */}
      <rect x="20" y="20" width="360" height="240" rx="6" fill="#1A1020" stroke="#6C3EB8" strokeWidth="1" strokeOpacity="0.4" />
      <rect x="20" y="20" width="360" height="28" rx="6" fill="#1A0A30" />
      <circle cx="38" cy="34" r="5" fill="#C8102E" opacity="0.8" />
      <circle cx="54" cy="34" r="5" fill="#F4A435" opacity="0.8" />
      <circle cx="70" cy="34" r="5" fill="#22C55E" opacity="0.8" />
      {/* Stats cards */}
      {[
        { x: 35, label: "Streams", value: "298.7K", color: "#6C3EB8" },
        { x: 165, label: "Revenue", value: "131.7M", color: "#22C55E" },
        { x: 285, label: "Earnings", value: "$10.5M", color: "#F4A435" },
      ].map((card) => (
        <g key={card.label}>
          <rect x={card.x} y="65" width="100" height="60" rx="4" fill="#1E122E" stroke={card.color} strokeWidth="0.75" strokeOpacity="0.4" />
          <text x={card.x + 8} y="90" fontSize="10" fill="#A0A0A0" fontFamily="monospace">{card.label}</text>
          <text x={card.x + 8} y="110" fontSize="13" fill="white" fontFamily="monospace" fontWeight="bold">{card.value}</text>
          <rect x={card.x + 8} y="80" width="20" height="3" rx="1" fill={card.color} opacity="0.7" />
        </g>
      ))}
      {/* Bar chart */}
      {[40, 65, 45, 85, 60, 90, 70, 80, 55, 95].map((h, i) => (
        <rect
          key={i}
          x={35 + i * 34}
          y={260 - h * 1.2}
          width="22"
          height={h * 1.2}
          rx="2"
          fill={i % 2 === 0 ? "#6C3EB8" : "#8B5CF6"}
          opacity="0.8"
        />
      ))}
      {/* Purple glow */}
      <rect width="400" height="280" fill="url(#purple-glow)" rx="8" />
      <defs>
        <radialGradient id="purple-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6C3EB8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function CommunityIllustration() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="280" fill="#1A0A0A" rx="8" />
      {/* Group of people silhouettes */}
      {[
        { cx: 80, cy: 200, r: 45, head: 40 },
        { cx: 160, cy: 210, r: 50, head: 45 },
        { cx: 250, cy: 200, r: 48, head: 43 },
        { cx: 330, cy: 210, r: 45, head: 40 },
      ].map((p, i) => (
        <g key={i}>
          <ellipse cx={p.cx} cy={p.cy + 60} rx={p.r} ry={p.r * 1.4} fill="#2E1010" opacity={0.6 + i * 0.1} />
          <ellipse cx={p.cx} cy={p.head + 90} rx={p.r * 0.6} ry={p.r * 0.65} fill="#3A1818" opacity={0.8} />
        </g>
      ))}
      {/* Connecting arcs (community links) */}
      <path d="M80 130 Q120 100 160 120" stroke="#C8102E" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
      <path d="M160 120 Q205 90 250 120" stroke="#C8102E" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
      <path d="M250 120 Q290 100 330 120" stroke="#C8102E" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
      {/* Music waves above group */}
      {[1,2,3].map((i) => (
        <path
          key={i}
          d={`M ${170 + i * 15} 50 Q ${200 + i * 5} ${35 - i * 4} ${230 + i * 15} 50`}
          stroke="#F4A435"
          strokeWidth="1.5"
          fill="none"
          opacity={0.3 + i * 0.2}
        />
      ))}
      {/* Heart accent */}
      <text x="185" y="45" fontSize="22" fill="#C8102E" opacity="0.6">♥</text>
      {/* Red glow */}
      <rect width="400" height="280" fill="url(#red-comm-glow)" rx="8" />
      <defs>
        <radialGradient id="red-comm-glow" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function QuickAccessIllustration() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="280" fill="#0F0F1A" rx="8" />
      {/* Phone mockup */}
      <rect x="130" y="20" width="140" height="240" rx="20" fill="#1A1A2E" stroke="#6C3EB8" strokeWidth="1.5" />
      <rect x="140" y="35" width="120" height="210" rx="12" fill="#0F0F1A" />
      {/* Phone notch */}
      <rect x="165" y="28" width="70" height="8" rx="4" fill="#0F0F1A" />
      {/* Screen content - Welcome text */}
      <rect x="152" y="48" width="96" height="50" rx="6" fill="#1A0A30" />
      <text x="170" y="72" fontSize="11" fill="white" fontFamily="sans-serif" fontWeight="bold">Welcome</text>
      <text x="155" y="88" fontSize="7.5" fill="#F4A435" fontFamily="sans-serif">Discover fast rising artists</text>
      {/* Track list */}
      {[0,1,2].map((i) => (
        <g key={i}>
          <rect x="152" y={108 + i * 36} width="96" height="28" rx="4" fill="#1A1A2A" />
          <rect x="158" y={114 + i * 36} width="16" height="16" rx="3" fill={i === 0 ? "#C8102E" : "#2A2A3A"} />
          <rect x="180" y={116 + i * 36} width="45" height="5" rx="2" fill="#3A3A4A" />
          <rect x="180" y={124 + i * 36} width="30" height="4" rx="2" fill="#2A2A3A" />
          {i === 0 && <polygon points="163,118 163,126 169,122" fill="white" />}
        </g>
      ))}
      {/* Play button at bottom */}
      <circle cx="200" cy="230" r="16" fill="#C8102E" />
      <polygon points="196,224 196,236 210,230" fill="white" />
      {/* Decorative elements outside phone */}
      <text x="40" y="80" fontSize="20" fill="#6C3EB8" opacity="0.5">♪</text>
      <text x="330" y="140" fontSize="18" fill="#F4A435" opacity="0.4">♫</text>
      <circle cx="60" cy="180" r="20" fill="#C8102E" opacity="0.06" />
      <circle cx="350" cy="80" r="30" fill="#6C3EB8" opacity="0.06" />
      <defs />
    </svg>
  )
}
