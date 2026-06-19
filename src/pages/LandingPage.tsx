// import { HeroSection } from "@/components/features/hero/HeroSection"
// import { FeaturesSection } from "@/components/features/features-section/FeaturesSection"
// import { FAQSection } from "@/components/features/faq/FAQSection"
// import { Footer } from "@/components/features/footer/Footer"
// import { CTABanner } from "@/components/features/CTABanner"

export function LandingPage() {
  return (
    <main>
      
      {/* <HeroSection />
       <FeaturesSection />
       <CTABanner />
       <FAQSection />
       <Footer /> */}

      {/* <div className="flex items-center justify-center">
        <p className="w-2/4 pt-20 uppercase text-center font-bold text-lg xl:text-5xl tracking-widest leading-[300px]">Discover, share, and connect <span className="font-thin normal-case">through music in a community where every sound matters.</span></p>
      </div>
      <div><button>Join the Vibe</button></div> */}

      <HomePage />
    </main>
  )
}
import phoneMockup from "@/assets/images/Rectangle.svg";
import looperBg from "@/assets/images/LooperGroup.svg";
import { useNavigate } from "react-router-dom";

/**
 * Vibe Garage – Homepage
 * Tailwind CSS implementation matching the supplied web (Landing_page.png)
 * and mobile (Mobile.png) designs.
 *
 * Notes:
 * - Colors were sampled directly from the design files:
 *     bg        #0A0909
 *     pink      #D5AAAA (gradient headline word)
 *     off-white #F6F2F2 (body headline text)
 *     maroon    #800000 (CTA button)
 *     cream     #F9F4E1 (CTA button text)
 *     yellow    #E3C767 (footer column headings)
 * - `looperBg` is the swirling ribbon artwork that sits behind the hero
 *   headline / phone mockup.
 * - `phoneMockup` is the tilted iPhone screenshot artwork (already has a
 *   transparent background) used in the hero section.
 */

// const NAV_LINKS = [
//   { label: "Download", href: "#download" },
//   { label: "FAQ", href: "#faq" },
// ];

const PRODUCT_LINKS = [
  { label: "Download", href: "#download" },
  { label: "Support", href: "#support" },
];

const COMPANY_LINKS = [
  { label: "Privacy", href: "#privacy" },
  { label: "Careers", href: "#careers" },
];

const SOCIALS = [
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.6-1.4 1.2-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3 0-1.4.7-2.1 1-2.4.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.5c-.1.2-.2.3 0 .5.3.6.9 1.4 1.6 2 .8.7 1.5 1 1.8 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.9 1c.2.1.3.2.3.4.1.3.1.7-.1 1.1Z" />
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <path d="M4.98 3.5A2.5 2.5 0 1 1 2.48 6a2.5 2.5 0 0 1 2.5-2.5ZM2.98 8.75h4v12.5h-4V8.75ZM9.98 8.75h3.84v1.7h.05c.53-1 1.85-2.05 3.8-2.05 4.07 0 4.83 2.68 4.83 6.17v6.68h-4v-5.93c0-1.41-.03-3.23-1.97-3.23-1.98 0-2.28 1.55-2.28 3.13v6.03h-3.99V8.75Z" />
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.4 1.4-1.4h1.5V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 3.9V11H7.8v2.8h2.4V21h3.3Z" />
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <path d="M12 2.2c2.7 0 3 0 4.1.05 1 .05 1.6.2 2 .35.5.2.85.4 1.2.8.4.35.6.7.8 1.2.15.4.3 1 .35 2 .05 1.1.05 1.4.05 4.1s0 3-.05 4.1c-.05 1-.2 1.6-.35 2-.2.5-.4.85-.8 1.2-.35.4-.7.6-1.2.8-.4.15-1 .3-2 .35-1.1.05-1.4.05-4.1.05s-3 0-4.1-.05c-1-.05-1.6-.2-2-.35a3.4 3.4 0 0 1-1.2-.8 3.4 3.4 0 0 1-.8-1.2c-.15-.4-.3-1-.35-2C2.2 15 2.2 14.7 2.2 12s0-3 .05-4.1c.05-1 .2-1.6.35-2 .2-.5.4-.85.8-1.2.35-.4.7-.6 1.2-.8.4-.15 1-.3 2-.35C7.6 2.2 7.9 2.2 12 2.2Zm0 1.8c-2.65 0-2.95 0-4 .05-.86.04-1.3.18-1.6.3-.4.15-.68.33-.97.62-.3.3-.47.57-.62.98-.12.3-.26.74-.3 1.6-.05 1.05-.05 1.35-.05 4s0 2.95.05 4c.04.86.18 1.3.3 1.6.15.4.33.68.62.97.3.3.57.47.97.62.3.12.74.26 1.6.3 1.05.05 1.35.05 4 .05s2.95 0 4-.05c.86-.04 1.3-.18 1.6-.3.4-.15.68-.33.98-.62.3-.3.47-.57.62-.97.12-.3.26-.74.3-1.6.05-1.05.05-1.35.05-4s0-2.95-.05-4c-.04-.86-.18-1.3-.3-1.6a2.6 2.6 0 0 0-.62-.98 2.6 2.6 0 0 0-.98-.62c-.3-.12-.74-.26-1.6-.3-1.05-.05-1.35-.05-4-.05ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.05-3a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Z" />
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <path d="M3 3h4.4l4.1 5.6L16.2 3H21l-6.7 8.1L21 21h-4.4l-4.4-6-5 6H3l7.1-8.6L3 3Z" />
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <path d="M14.5 2c.3 1.8 1.5 3.3 3.3 3.8.4.1.9.2 1.4.2v3.1c-1.5 0-2.9-.4-4.2-1.2v6.5a5.6 5.6 0 1 1-4.8-5.5v3.1a2.5 2.5 0 1 0 1.7 2.4V2h2.6Z" />
    ),
  },
];

function SocialIcon({ icon, label, href }:{ icon:any, label:string, href:string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        {icon}
      </svg>
    </a>
  );
}

function HomePage() {

  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0909] text-white">
      <img
        src={looperBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[8%] z-0 w-full -translate-x-1/2 select-none opacity-90 sm:top-[12%] sm:w-[1100px] md:top-0 md:w-full"
      />

      <main className="relative z-10 pt-20">
        <section className="px-6 pt-2 text-center sm:px-10 md:px-16">
          <h1 className="mx-auto max-w-5xl text-[28px] font-extrabold uppercase leading-tight tracking-[0.12em] text-[#F6F2F2] sm:text-4xl md:text-[56px] md:leading-[1.15]">
            <span className="text-[#D5AAAA]">Discover, share, and connect</span>
            <span className="font-normal normal-case tracking-normal">
              {" "}
              through music in a community where every sound matters.
            </span>
          </h1>

          <div className="mt-8 flex justify-center md:mt-10">
            <button
              onClick={() => navigate("/join")}
              className="inline-flex items-center justify-center rounded-full bg-[#800000] px-8 py-4 text-base font-bold text-[#F9F4E1] shadow-lg shadow-black/40 transition-transform hover:scale-[1.03] sm:px-10 sm:py-4"
            >
              Join the vibe
            </button>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto mt-10 w-full max-w-[420px] md:mt-14 md:max-w-[480px]">
            <img
              src={phoneMockup}
              alt="Vibe Garage app preview showing the home feed, trending singles and the now-playing player"
              className="w-full select-none"
            />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                           */}
        {/* ---------------------------------------------------------------- */}
        <footer className="relative z-10 mt-16 border-t border-white/5 px-6 py-10 sm:px-10 md:mt-24 md:px-16 md:py-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            {/* Brand + socials */}
            <div className="flex flex-col gap-4">
              <Logo className="h-6" />
              <p className="text-sm font-semibold text-white/90">Connect with us</p>
              <div className="flex gap-3">
                {SOCIALS.map((s) => (
                  <SocialIcon key={s.label} {...s} />
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="flex gap-16">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-[#E3C767]">Product</p>
                {PRODUCT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-semibold text-white/90 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-[#E3C767]">Company</p>
                {COMPANY_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-semibold text-white/90 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-10 text-xs font-semibold text-white/60 md:mt-12">
            (c) CIEL TECHNOLOGY LTD 2024
          </p>
        </footer>
      </main>
    </div>
  );
}

function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 font-extrabold ${className}`}>
      <svg viewBox="0 0 24 24" className="h-full w-auto" fill="none">
        <path
          d="M3 4h4.2L12 14.5 16.8 4H21l-9 18-9-18Z"
          fill="currentColor"
        />
      </svg>
      <span className="text-lg leading-none sm:text-xl">ibe Garage</span>
    </div>
  );
}