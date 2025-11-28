/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,astro}",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "600px",
        md: "728px",
        lg: "984px",
        xl: "1240px",
        "2xl": "1440px",
      },
    },

    extend: {
      /** -----------------------------------------------------
       * COLORS — Apple-inspired, frosted glass palette
       ----------------------------------------------------- */
      colors: {
        brand: {
          DEFAULT: "#4F46E5",
          soft: "#6366F1",
          strong: "#4338CA",
          accent: "#EC4899",
        },
        surface: {
          DEFAULT: "#020617", // slate-950
          subtle: "#0f172a",  // slate-900
        },
        glass: {
          light: "rgba(255,255,255,0.08)",
          dark: "rgba(0,0,0,0.35)",
          border: "rgba(255,255,255,0.25)",
        },
      },

      /** -----------------------------------------------------
       * FONTS — Apple system stack
       ----------------------------------------------------- */
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },

      /** -----------------------------------------------------
       * BACKDROPS / BLUR
       ----------------------------------------------------- */
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },

      /** -----------------------------------------------------
       * SHADOWS — soft glass shadows
       ----------------------------------------------------- */
      boxShadow: {
        glass:
          "0 8px 20px rgba(0,0,0,0.45), 0 0 1px rgba(255,255,255,0.15) inset",
        card: 
          "0 10px 30px rgba(0,0,0,0.35)",
        glow: 
          "0 0 80px 20px rgba(99,102,241,0.2)",
      },

      /** -----------------------------------------------------
       * BORDER RADIUS — smoother glass UI
       ----------------------------------------------------- */
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        glass: "18px",
      },

      /** -----------------------------------------------------
       * ANIMATIONS — smooth opacity, fade-in, slide
       ----------------------------------------------------- */
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out forwards",
        fadeSlow: "fadeIn 0.8s ease-out forwards",
        slideUp: "slideUp 0.4s ease-out forwards",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },

      /** -----------------------------------------------------
       * TRANSITIONS
       ----------------------------------------------------- */
      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },

      /** -----------------------------------------------------
       * OPACITY — more granular glass levels
       ----------------------------------------------------- */
      opacity: {
        15: "0.15",
        35: "0.35",
      },
    },
  },
  plugins: [],
};
