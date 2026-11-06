/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          bg: "#0B0B0B",
          secondary: "#151515",
          surface: "#1C1C1C",
          accent: "#00E676",
          accent2: "#B6FF00",
          border: "#373737",
          text: "#F5F5F5",
          muted: "#929292",
          danger: "#FF4545",
          warning: "#FFB020",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px #000000',
        'brutal-sm': '2px 2px 0px #000000',
        'brutal-accent': '4px 4px 0px #00E676',
        'brutal-danger': '4px 4px 0px #FF4545',
      }
    },
  },
  plugins: [],
}

