import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B00",
          hover: "#E05E00",
        },
        secondary: "#FF8533",
        "fitpass-dark": "#111111",
        "fitpass-orange": "#E35125",
        "background-gray": "#F8F9FA",
        borders: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-geo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        header: "0 1px 12px rgba(17,17,17,0.06)",
        card: "0 4px 24px rgba(17,17,17,0.05)",
        "card-hover": "0 8px 32px rgba(255,107,0,0.12)",
      },
      keyframes: {
        "pulse-orange": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,107,0,0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255,107,0,0)" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "pulse-orange": "pulse-orange 1.8s infinite",
        "slide-up": "slide-up 0.3s ease-out",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at 20% 20%, rgba(255,133,51,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255,107,0,0.12) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(227,81,37,0.10) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;