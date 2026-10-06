/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0a08",
        surface: "#141310",
        "surface-high": "#1b1915",
        rule: "#2a271f",
        paper: "#f3efe6",
        muted: "#978c79",
        faint: "#6b6457",
        correct: "#2f9e6e",
        "correct-dim": "#24805a",
        "correct-soft": "rgba(47,158,110,0.14)",
        present: "#c9922f",
        "present-dim": "#a87725",
        "present-soft": "rgba(201,146,47,0.14)",
        absent: "#342f26",
        danger: "#c0564a",
        "danger-soft": "rgba(192,86,74,0.14)",
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        sans: ["Archivo", "ui-sans-serif", "system-ui"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
