/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,tsx,js,jsx}',
    './src/views/**/*.{html,hbs,ejs,pug}',
    './src/views/**/*.hbs',
    './src/views/partials/**/*.hbs',
    './src/views/layouts/**/*.hbs',
  ],
  // Lebar fix tombol admin (primary/secondary-button) dioper via param
  // `width` -> class dinamis `sm:w-[Npx]` yang tidak terdeteksi scanner,
  // jadi didaftarkan eksplisit agar selalu ada di CSS hasil build.
  safelist: [
    'sm:w-[90px]',
    'sm:w-[128px]',
    'sm:w-[132px]',
    'sm:w-[136px]',
    'sm:w-[142px]',
    'sm:w-[154px]',
    'sm:w-[158px]',
    'sm:w-[162px]',
    'sm:w-[163px]',
    'sm:w-[183px]',
    'sm:w-[185px]',
    'sm:w-[200px]',
  ],
  theme: {    extend: {
      colors: {
        primary: '#10172a',
        secondary: '#003060',
        tertiary: '#055C90',
        accent: '#68bbe3',
        textPrimary: '#FFFFFF',
        textSecondary: '#F0F0F0',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        slide: 'slide 20s linear infinite',
        slideFast: 'slide 10s linear infinite',
        slideSlow: 'slide 40s linear infinite',
        fadeInUp: 'fadeInUp 0.5s ease-out both',
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
        'open-sans': ['"Open Sans"', 'sans-serif'],
        opensans: ['"Open Sans"', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate'],
  },
};
