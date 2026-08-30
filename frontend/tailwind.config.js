/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#070B14",
          surface: "#0D1322",
          elevated: "#11192B",
          border: "#1D2940",
          borderHover: "#2B3C5E",
          blue: "#4C8DFF",
          cyan: "#00C2D9",
          success: "#26D69A",
          warning: "#F5B82E",
          danger: "#FF4D6D",
          purple: "#A970FF",
          text: "#E8EDF7",
          muted: "#7F8AA0",
          subtle: "#4B566B"
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
