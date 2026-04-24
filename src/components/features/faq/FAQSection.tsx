import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { SectionLabel } from "@/components/ui/section-label"

const FAQS = [
  {
    q: "What is Vibe Garage Entertainment?",
    a: "Vibe Garage Entertainment is a cutting-edge online platform that allows music enthusiasts to discover, stream, and enjoy a vast collection of music from various genres and artists worldwide.",
  },
  {
    q: "How do I sign up?",
    a: "Signing up is easy! Click the 'Join the Vibe' button at the top of the page, enter your email and create a password. You can start exploring music immediately after confirming your email.",
  },
  {
    q: "Is Vibe Garage Entertainment free to use?",
    a: "Yes, we offer a free tier that gives you access to a large catalog of music with occasional ads. For an ad-free experience with premium features, explore our subscription plans.",
  },
  {
    q: "What are the benefits of upgrading to a premium subscription?",
    a: "Premium subscribers enjoy ad-free listening, offline downloads, higher audio quality (up to 320kbps), early access to new releases, exclusive artist content, and the ability to support artists directly through our royalty program.",
  },
  {
    q: "Can I cancel my premium subscription at any time?",
    a: "Absolutely. There are no long-term contracts. You can cancel your subscription anytime from your account settings, and you'll continue to have access until the end of your current billing period.",
  },
  {
    q: "Can I create and share playlists with others?",
    a: "Yes! You can create unlimited playlists, make them public or private, and share them with friends or on social media. Collaborative playlists let multiple users add tracks together.",
  },
  {
    q: "How do I become an artist on Vibe Garage?",
    a: "Artists can apply through our 'Become an Artist' portal. After verification, you'll have access to our artist dashboard to upload music, track your streams, and receive royalty payments.",
  },
  {
    q: "Is Vibe Garage Entertainment available on mobile devices?",
    a: "Yes! Our app is available on iOS and Android. You can also access the full platform through any modern web browser on desktop, tablet, or mobile.",
  },
  {
    q: "Can I listen to Vibe Garage Entertainment offline?",
    a: "Offline listening is available for Premium subscribers. You can download your favorite tracks, albums, and playlists to listen without an internet connection.",
  },
  {
    q: "How do I report an issue or give feedback about Vibe Garage Entertainment?",
    a: "We'd love to hear from you! Use the contact form below, reach out via our in-app support chat, or email us directly. Your feedback helps us improve the platform for everyone.",
  },
]

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section className="py-section" id="faq">
      <div className="section-divider mb-16" />

      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <SectionLabel>Frequently Asked Questions</SectionLabel>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible defaultValue="item-0">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>
                    {i + 1}. {faq.q}
                  </AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <p className="mt-8 text-center text-xs text-vibe-text-muted leading-relaxed">
              Remember, this FAQ section covers common questions. For more detailed inquiries or
              specific issues, don't hesitate to get in touch with our support team. Happy listening!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
