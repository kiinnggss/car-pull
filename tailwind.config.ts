import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        logo: {
          teal: '#0D6E6E',
          'teal-dark': '#094E4E',
          'teal-light': '#14B8A6',
          amber: '#D97706',
          terracotta: '#C25E2E',
          cream: '#FFFDF9',
        },
        brand: {
          primary: '#7C3AED',
          dark: '#6D28D9',
          glow: '#A855F7',
          subtle: 'rgba(124, 58, 237, 0.08)',
        },
        surface: {
          canvas: '#F6F2EA',
          card: '#FFFFFF',
          elevated: '#FAF6EE',
          divider: '#DDD4C5',
        },
        text: {
          primary: '#141210',
          secondary: '#3D362F',
          tertiary: '#70665A',
        },
      },
    },
  },
  plugins: [],
};

export default config;
