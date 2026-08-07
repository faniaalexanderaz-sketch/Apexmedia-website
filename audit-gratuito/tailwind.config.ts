import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070A12",
        purple: { DEFAULT: "#5B2EFF", bg: "#1B0B2E" },
        blue: { DEFAULT: "#2F6BFF", bg: "#0A1B3D" },
        yellow: "#FFD84D",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1320px",
      },
      spacing: {
        section: "clamp(4.5rem, 4rem + 6vw, 11rem)",
        "section-lg": "clamp(5rem, 4rem + 8vw, 12.5rem)",
      },
      backgroundImage: {
        "tri-stripe":
          "linear-gradient(90deg, #5B2EFF 0%, #2F6BFF 52%, #FFD84D 100%)",
        "radial-purple":
          "radial-gradient(60% 50% at 50% 0%, rgba(91,46,255,0.35) 0%, rgba(91,46,255,0) 100%)",
        "radial-blue":
          "radial-gradient(55% 45% at 80% 20%, rgba(47,107,255,0.25) 0%, rgba(47,107,255,0) 100%)",
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateX(-6%)" },
          "50%": { transform: "translateX(106%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scan: "scan 5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
