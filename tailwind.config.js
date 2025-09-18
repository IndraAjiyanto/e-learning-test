/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,js,jsx}",
    "./src/views/**/*.{html,hbs,ejs,pug}",
  ],
  theme: {
    extend: {
            keyframes: {
        slide: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
            animation: {
        slide: "slide 20s linear infinite",
        slideFast: "slide 10s linear infinite",
        slideSlow: "slide 40s linear infinite",
      },
            fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate"],
  },
}