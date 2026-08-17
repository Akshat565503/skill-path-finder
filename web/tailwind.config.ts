import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{vue,ts,tsx}",
    "./components/**/*.{vue,ts,tsx}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.ts",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        // Transit Map Core Tokens
        ink: "#12141C", // Deep background
        surface: {
          DEFAULT: "#1B1E2A",
          hover: "#242838",
          border: "#2A2E3F",
          light: "#2A2E3E",
        },
        transit: {
          gold: "#F2B84B", // You-are-here / active accent
          ink: "#12141C",
          text: "#EDEEF2",
          muted: "#8B8FA3",
        },
        // Metro Category Lines
        line: {
          frontend: "#5AC8FA",
          backend: "#34D399",
          cloud: "#A78BFA",
          data: "#F472B6",
          devops: "#FB923C",
          datascience: "#60A5FA",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-subtle": "pulseSubtle 3s infinite ease-in-out",
        "dash": "dashAnimation 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        dashAnimation: {
          to: { strokeDashoffset: "-20" },
        },
      },
      boxShadow: {
        transit: "0 4px 20px -2px rgba(18, 20, 28, 0.5)",
        gold: "0 0 16px rgba(242, 184, 75, 0.35)",
        station: "0 0 10px rgba(90, 200, 250, 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
