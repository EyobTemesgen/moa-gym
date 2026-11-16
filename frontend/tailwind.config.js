/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'moa-green': '#0B7A3B',
        'moa-green-dark': '#07572A',
        'moa-gold': '#F5B81C',
        'moa-blue': '#145B8C',
        'moa-surface': '#F7F9F8',
        'moa-danger': '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Ethiopic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
