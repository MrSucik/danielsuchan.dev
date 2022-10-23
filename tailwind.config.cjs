/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    colors: {
      "dark-bg": "#191919",
    },
    extend: {
      backgroundImage: {
        header: "url('/assets/header-bg.jpg')",
      },
    },
  },
  plugins: [],
};
