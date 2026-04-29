import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff6dd",
        ivory: "#fffaf0",
        sakura: "#ff8fb3",
        peach: "#ffc7a3",
        mint: "#9fe7d4",
        sky: "#9ddcff",
        ink: "#42373a"
      },
      boxShadow: {
        sticker: "0 10px 0 rgba(66,55,58,0.09), 0 18px 40px rgba(255,143,179,0.18)"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
