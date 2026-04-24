import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function CTABanner() {
  const navigate = useNavigate()

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-vibe-red/5 via-vibe-red/10 to-vibe-red/5" />
      <div className="section-divider absolute top-0 inset-x-0" />
      <div className="section-divider absolute bottom-0 inset-x-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 text-center"
      >
        <Button
          size="xl"
          rounded="sm"
          onClick={() => navigate("/join")}
          className="group px-12"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </section>
  )
}
