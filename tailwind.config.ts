import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#f59e0b",
          soft: "#fbbf24",
        },
      },
      boxShadow: {
        dot: "0 0 16px 5px rgba(245,158,11,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
