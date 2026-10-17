import type { Config } from "tailwindcss";

// Same family as the local marketing engine: dark control panel, single green accent.
// Surfaces step up in lightness: bg (page) → panel (cards) → raised (tiles and inputs inside cards).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0c10",
        panel: "#12151b",
        raised: "#191d25",
        line: "#262b35",
        fg: "#e8eaee",
        muted: "#9aa3b2",
        accent: "#4fd1a5",
        "on-accent": "#04241a",
        danger: "#ff7b72",
        warn: "#e3b341",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "inset 0 1px 0 0 rgb(255 255 255 / 0.04), 0 12px 32px -16px rgb(0 0 0 / 0.7)",
        glow: "0 0 0 1px rgb(79 209 165 / 0.5), 0 6px 20px -6px rgb(79 209 165 / 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
