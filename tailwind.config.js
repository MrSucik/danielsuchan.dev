/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#191919',
        'grey-text': 'rgba(155, 155, 155, 1)',
      },
      backgroundImage: {
        header: "url('/assets/header-bg.jpg')",
      },
    },
  },
  plugins: [],
}

