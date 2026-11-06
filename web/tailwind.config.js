/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0b0e14",
          card: "#121722",
          border: "#1f293d",
          accent: "#ff5500",
          gold: "#f59e0b",
          neon: "#00ffcc",
        }
      }
    },
  },
  plugins: [],
}
