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
        primary: {
          50: '#fff3e5',
          100: '#ffe1cc',
          200: '#ffc499',
          300: '#ff9d4d',
          400: '#ff8000', // McLaren Papaya
          500: '#e67300',
          600: '#cc6600',
          700: '#994d00',
          800: '#663300',
          900: '#331a00',
        },
        accent: {
          500: '#ff0000', // Small red accents
          600: '#cc0000',
        },
        dark: {
          bg: '#111111', // Anthracite black
          card: '#161F30',
          border: '#1F2E47',
          text: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
