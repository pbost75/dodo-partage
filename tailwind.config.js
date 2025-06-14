/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'title': ['var(--font-roboto-slab)', 'serif'],
        'body': ['var(--font-lato)', 'sans-serif'],
        'roboto-slab': ['var(--font-roboto-slab)', 'serif'],
        'lato': ['var(--font-lato)', 'sans-serif'],
        'sans': ['var(--font-lato)', 'sans-serif'],
        'serif': ['var(--font-roboto-slab)', 'serif'],
      },
      colors: {
        'highlight-yellow': '#EFB400',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
} 