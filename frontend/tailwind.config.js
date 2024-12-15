/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "#4d425f",
        secondaryColor: "#a364ff",
        accentColorWhite: "#342a45",
        accentColorBlue: "#ffc7ff",
        accentColorLightBlue: "#e0e0e0"
      },
      boxShadow: {
        panelShadow: "rgba(17, 12, 46, 0.15) 0px, 48px, 100px, 0px;"
      }
    },
  },
  plugins: [],
}

