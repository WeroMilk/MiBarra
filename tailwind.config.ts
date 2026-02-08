import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["var(--font-poppins)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      colors: {
        apple: {
          bg: "#F5F5F7",
          surface: "#FFFFFF",
          surface2: "#FAFAFA",
          text: "#1D1D1F",
          text2: "#86868B",
          accent: "#6366F1",
          accent2: "#4F46E5",
          border: "#D2D2D7",
          success: "#34C759",
          warning: "#FF9500",
        },
      },
      backgroundImage: {
        "wood-texture": "url('/wood-texture.jpg')",
      },
    },
  },
  plugins: [],
};
export default config;
