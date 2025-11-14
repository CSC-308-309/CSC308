/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", ],
  theme: {
    extend: {
      colors: {
        'melodious-purple': '#7E5179',
        'melodious-dark-purple': '#3A1250',
        'melodious-pink': '#a41b67ff',
        'melodious-lavendar': '#e3b1ddff',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

