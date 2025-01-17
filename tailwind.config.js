/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['"Nunito Sans"', 'sans-serif'],
        sourceSans: ['"Source Sans 3"', 'sans-serif']
      },
      colors: {
        primaryPurple: '#D4CDF4', // Example color from the design
        gradientStart: '#E6D6FF', // Top of the background gradient
        gradientEnd: '#BBA1E6', // Bottom of the background gradient
        textPrimary: '#343A40', // Text color
        buttonBg: '#6868AC', // Button background color
        buttonHover: '#6D50C9', // Button hover state
      },
    },
  },
  plugins: [],
}