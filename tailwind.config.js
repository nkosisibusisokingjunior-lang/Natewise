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
      // Accessible light palette with strong contrast
      colors: {
        brand: {
          DEFAULT: "#007BFF", // primary
          soft: "#4da3ff",
          strong: "#0056B3",
          accent: "#FF9800", // secondary accent
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F5F5F5",
        },
        glass: {
          light: "rgba(255,255,255,0.9)",
          dark: "rgba(0,0,0,0.12)",
          border: "rgba(0,0,0,0.08)",
        },
      },

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

      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },

      boxShadow: {
        glass:
          "0 8px 20px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.05) inset",
        card: "0 10px 30px rgba(0,0,0,0.12)",
        glow: "0 0 80px 20px rgba(0,123,255,0.15)",
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        glass: "18px",
      },

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

      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },

      opacity: {
        15: "0.15",
        35: "0.35",
      },
    },
  },
  plugins: [],
};

