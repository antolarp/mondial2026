/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fifa: {
          blue: '#003DA5',
          red: '#D0021B',
          gold: '#C8A84B',
        },
      },
    },
  },
  plugins: [],
}
