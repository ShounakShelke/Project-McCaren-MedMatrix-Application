/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#657821',
        'background-light': '#f7f8f6',
        'background-dark': '#1c1f13',
      },
      fontFamily: {
        'sans': ['"Noto Serif"', 'serif'],
        'display': ['"Noto Serif"', 'serif']
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
    },
  },
  plugins: [],
};
