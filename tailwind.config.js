/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ── Vibe Garage Brand Palette ──────────────────────────────────────
      // Extracted from the landing page design:
      //   Deep Onyx   #0A0A0A  – primary background
      //   Dark Slate  #111111  – secondary surface
      //   Charcoal    #1A1A1A  – card backgrounds
      //   Vibe Red    #C8102E  – primary CTA / accent
      //   Crimson     #E8192C  – hover / highlight state
      //   Warm Amber  #F4A435  – hero headline accent ("fans connect")
      //   Off-White   #F5F0EB  – body text
      //   Muted Gray  #6B6B6B  – secondary text
      //   Purple Haze #6C3EB8  – earnings/dashboard accent
      colors: {
        // Semantic tokens mapped to CSS variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── Brand-specific design tokens ──
        vibe: {
          red: {
            DEFAULT: "#C8102E",
            hover: "#E8192C",
            muted: "#9B0D22",
          },
          amber: {
            DEFAULT: "#F4A435",
            light: "#F7BB66",
          },
          onyx: {
            DEFAULT: "#0A0A0A",
            100: "#111111",
            200: "#1A1A1A",
            300: "#242424",
            400: "#2E2E2E",
          },
          purple: {
            DEFAULT: "#6C3EB8",
            light: "#8B5CF6",
          },
          text: {
            primary: "#F5F0EB",
            secondary: "#A0A0A0",
            muted: "#6B6B6B",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Display: bold, aggressive – matches the brand energy
        display: ["'Bebas Neue'", "Impact", "ui-sans-serif"],
        // Heading: modern semi-condensed
        heading: ["'Barlow Semi Condensed'", "'DM Sans'", "ui-sans-serif"],
        // Body: clean, readable
        body: ["'DM Sans'", "'Nunito Sans'", "ui-sans-serif"],
        // Mono: code/stats
        mono: ["'JetBrains Mono'", "ui-monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem,8vw,7rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-xl": ["clamp(2.25rem,5vw,4.5rem)", { lineHeight: "1", letterSpacing: "-0.015em" }],
        "display-lg": ["clamp(1.75rem,3.5vw,3rem)", { lineHeight: "1.05" }],
      },
      spacing: {
        "section": "6rem",
        "section-sm": "4rem",
      },
      backgroundImage: {
        "vibe-gradient": "linear-gradient(135deg, #0A0A0A 0%, #1A0A0A 50%, #0A0A0A 100%)",
        "hero-radial": "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(200,16,46,0.18) 0%, transparent 70%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
        "red-glow": "radial-gradient(circle, rgba(200,16,46,0.3) 0%, transparent 70%)",
        "amber-accent": "linear-gradient(90deg, #F4A435, #E8792C)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
