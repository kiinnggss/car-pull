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
      boxShadow: {
        'floating-sm': '0 4px 14px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'floating': '0 12px 32px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'floating-lg': '0 20px 48px -8px rgba(15, 23, 42, 0.14), 0 8px 20px -4px rgba(15, 23, 42, 0.08)',
        'floating-dark': '0 16px 40px -6px rgba(0, 0, 0, 0.7), 0 6px 16px -3px rgba(0, 0, 0, 0.5)',
        'floating-dark-lg': '0 28px 65px -10px rgba(0, 0, 0, 0.85), 0 10px 24px -4px rgba(0, 0, 0, 0.6)',
        'dock': '0 12px 36px -6px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)',
        'dock-dark': '0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 6px 20px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
