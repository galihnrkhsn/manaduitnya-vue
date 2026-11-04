import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        surface: '#FFFFFF',   // area kerja & tabel
        card: '#F1F5F9',      // sidebar & card
        ink: '#1E293B',       // teks
        brand: {
          DEFAULT: '#0D9488', // CTA
          dark: '#0F766E',    // hover & teks link
        },
      },
    },
  },
  plugins: [],
}
