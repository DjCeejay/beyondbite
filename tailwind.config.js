/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./admin.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: '#5C3317',
          darkbrown: '#3B2219',
          cream: '#F9F6F0',
          creamDark: '#EFE8DC',
          gold: '#D4A373',
          amber: '#E6A15C',
          dark: '#1C1510',
          card: '#FFFFFF'
        }
      },
      fontFamily: {
        serif: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 10px 25px -5px rgba(92, 51, 23, 0.12), 0 8px 10px -6px rgba(92, 51, 23, 0.08)',
        'warm-lg': '0 20px 30px -10px rgba(92, 51, 23, 0.18)',
      }
    },
  },
  plugins: [],
}
