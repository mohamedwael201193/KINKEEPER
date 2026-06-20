/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F2F0EA",
          muted: "#E6E0DB",
          dark: "#1A1A1A",
        },
        accent: {
          DEFAULT: "#9478FC",
          muted: "#B8A4FD",
          soft: "rgba(148, 120, 252, 0.12)",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#5C5C5C",
          faint: "#8A8A8A",
        },
        trust: {
          ok: "#2D6A4F",
          warn: "#B7791F",
          critical: "#9B2C2C",
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26, 26, 26, 0.04), 0 8px 24px rgba(26, 26, 26, 0.06)",
        card: "0 2px 8px rgba(26, 26, 26, 0.05), 0 16px 40px rgba(26, 26, 26, 0.08)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
