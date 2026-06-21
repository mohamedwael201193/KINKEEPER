/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1220", light: "#111827", card: "#151D2E", hover: "#1A2438" },
        graphite: { DEFAULT: "#1E293B", muted: "#334155", soft: "#475569" },
        steel: { DEFAULT: "#64748B", light: "#94A3B8", bright: "#CBD5E1" },
        accent: { DEFAULT: "#3B82F6", soft: "#60A5FA", glow: "rgba(59,130,246,0.15)" },
        allow: { DEFAULT: "#10B981", soft: "rgba(16,185,129,0.12)" },
        warn: { DEFAULT: "#F59E0B", soft: "rgba(245,158,11,0.12)" },
        block: { DEFAULT: "#EF4444", soft: "rgba(239,68,68,0.12)" },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 48px rgba(59,130,246,0.12)",
        card: "0 1px 0 rgba(255,255,255,0.05) inset, 0 4px 24px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};
