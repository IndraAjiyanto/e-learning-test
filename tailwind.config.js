/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,js,jsx}",
    "./src/views/**/*.{html,hbs,ejs,pug}",
  ],
  theme: {
    extend: {
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