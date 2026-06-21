/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#09090b",
          muted: "#18181b",
          dark: "#050508",
        },
        accent: {
          DEFAULT: "#7c3aed",
          muted: "#a78bfa",
          soft: "rgba(124, 58, 237, 0.15)",
        },
        ink: {
          DEFAULT: "#fafafa",
          muted: "#a1a1aa",
          faint: "#71717a",
        },
        trust: {
          ok: "#34d399",
          warn: "#fbbf24",
          critical: "#f87171",
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 32px rgba(0, 0, 0, 0.35)",
        card: "0 16px 48px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
