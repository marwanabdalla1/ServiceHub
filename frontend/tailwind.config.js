const {nextui} = require('@nextui-org/theme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/[object Object].js"
  ],
  theme: {
    extend: {
      colors: {
      customBlue: '#1e40af', 
      customGreen: '#C8D7D7', 
      customBlack: '#2B2E4A',
      customGray: {
        light: '#f7fafc',
        DEFAULT: '#cbd5e1',
        dark: '#1a202c',
      },
    },},
  },
  plugins: [nextui()],
}


