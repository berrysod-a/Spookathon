import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#18181b",
        border: "#27272a",
        foreground: "#fafafa",
        muted: {
          DEFAULT: "#27272a",
          foreground: "#a1a1aa",
        },
        accent: {
          lime: "#a3e635",
          violet: "#8b5cf6",
          amber: "#f59e0b",
          orange: "#f97316",
          blue: "#3b82f6",
          red: "#ef4444",
        },
        card: {
          DEFAULT: "#18181b",
          foreground: "#fafafa",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
