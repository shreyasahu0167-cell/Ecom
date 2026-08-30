/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#27201a",
        "primary-container": "#3d352e",
        "charcoal-text": "#3D352E",
        "antique-gold": "#BFA36C",
        "antique-gold-light": "#DFC99C",
        "secondary": "#725b2b",
        "secondary-container": "#fbdca0",
        "deep-rose": "#9E6F6D",
        "deep-rose-light": "#C49A98",
        "tertiary": "#381717",
        "tertiary-container": "#512c2b",
        "ivory-base": "#FBFAF5",
        "background": "#faf9f4",
        "surface": "#faf9f4",
        "surface-container": "#efeee9",
        "surface-container-low": "#f5f4ef",
        "surface-container-high": "#e9e8e3",
        "surface-container-highest": "#e3e3de",
        "champagne-highlight": "#F6F3F0",
        "outline": "#7e756e",
        "outline-variant": "#d0c4bc",
        "surface-variant": "#e3e3de",
        "on-surface": "#1b1c19",
        "on-surface-variant": "#4d453f",
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        display: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      spacing: {
        'gutter': '24px',
        'container-max': '1440px',
      }
    },
  },
  plugins: [],
}
