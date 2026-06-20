import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import LooperGroup from "@/assets/images/LooperGroup.svg"
import PhoneMockup from "@/assets/images/PhoneMockup.svg"

// Stagger animation variants
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <section
      className="relative overflow-hidden bg-vibe-onyx pt-32 pb-16 md:pt-40 md:pb-24"
      aria-label="Hero"
    >
      {/* Wavy looper background — centered behind headline + phone on desktop, subtle edge accent on mobile */}
      <div
        className="absolute left-[-20%] sm:left-1/2 top-[10%] sm:-translate-x-1/2 w-[90vw] sm:w-[110vw] max-w-full aspect-square pointer-events-none select-none opacity-60 sm:opacity-90"
        aria-hidden="true"
      >
        <img src={LooperGroup} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto text-left sm:text-center"
        >
          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-heading text-[1.75rem] leading-[1.25] sm:text-4xl sm:leading-[1.25] md:text-5xl md:leading-[1.2] font-semibold tracking-wide"
          >
            <span className="text-vibe-rose uppercase tracking-[0.08em]">
              Discover, share, and connect
            </span>{" "}
            <span className="text-vibe-text-secondary font-normal">
              through music in a community where every sound matters.
            </span>
          </motion.h1>

          {/* CTA */}
          <motion.div variants={item} className="mt-8 md:mt-10">
            <Button
              size="lg"
              rounded="full"
              className="normal-case text-base font-semibold tracking-normal px-10 w-full sm:w-auto"
              onClick={() => navigate("/join")}
            >
              Join the vibe
            </Button>
          </motion.div>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto mt-12 md:mt-16 max-w-[420px] md:max-w-[480px]"
        >
          <img
            src={PhoneMockup}
            alt="Vibe Garage app home screen showing trending singles and the artist onboarding banner"
            className="w-full h-auto select-none pointer-events-none drop-shadow-2xl"
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  )
}
