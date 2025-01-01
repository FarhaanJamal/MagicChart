/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "#24293e",
        secondaryColor: "#5656fc",
        accentColorWhite: "#2a2a45",
        accentColorBlue: "#8885d6",
        accentColorLightBlue: "#e0e0e0"
      },
      boxShadow: {
        panelShadow: "rgba(17, 12, 46, 0.15) 0px, 48px, 100px, 0px;"
      }
    },
  },
  plugins: [],
}

