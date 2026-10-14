import type { Config } from "tailwindcss";

// Same family as the local marketing engine: dark control panel, single green accent.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        panel: "#171a21",
        line: "#2a2f3a",
        fg: "#e6e8ec",
        muted: "#9aa3b2",
        accent: "#4fd1a5",
        danger: "#ff7b72",
        warn: "#e3b341",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
