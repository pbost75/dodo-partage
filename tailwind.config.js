/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto-slab': ['var(--font-roboto-slab)', 'serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'lato': ['var(--font-lato)', 'sans-serif'],
        'sans': ['var(--font-lato)', 'sans-serif'],
        'serif': ['var(--font-roboto-slab)', 'serif'],
      },
    },
  },
  plugins: [],
} 