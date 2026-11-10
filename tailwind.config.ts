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
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        mint: {
          DEFAULT: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0F766E',
          deep: '#0D6E6E',
          ink: '#041E1B',
        },
        logo: {
          teal: '#0F766E',
          'teal-dark': '#115E59',
          'teal-light': '#14B8A6',
          amber: '#D97706',
          terracotta: '#EA580C',
          cream: '#F8FAFC',
        },
        surface: {
          canvas: '#F1F5F9',
          card: '#FFFFFF',
          elevated: '#F8FAFC',
          divider: '#E2E8F0',
          'card-dark': '#11171E',
          'canvas-dark': '#090D11',
          'well-dark': '#0C1117',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          tertiary: '#64748B',
          'primary-dark': '#F8FAFC',
          'secondary-dark': '#94A3B8',
          'tertiary-dark': '#64748B',
        },
      },
      boxShadow: {
        'specular': '0 4px 12px -2px rgba(15, 23, 42, 0.06)',
        'specular-light': '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        'btn-shine': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
        'well-inner': 'inset 0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        'floating-sm': '0 2px 6px -1px rgba(15, 23, 42, 0.05)',
        'floating': '0 6px 16px -3px rgba(15, 23, 42, 0.07)',
        'floating-lg': '0 12px 28px -6px rgba(15, 23, 42, 0.12)',
        'floating-dark': '0 8px 20px -4px rgba(0, 0, 0, 0.5)',
        'floating-dark-lg': '0 16px 36px -8px rgba(0, 0, 0, 0.7)',
        'dock': '0 8px 24px -4px rgba(15, 23, 42, 0.1)',
        'dock-dark': '0 12px 32px -6px rgba(0, 0, 0, 0.75)',
      },
    },
  },
  plugins: [],
};

export default config;
