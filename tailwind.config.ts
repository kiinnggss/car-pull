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
        sans: ['var(--font-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-outfit)', 'var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        volt: {
          DEFAULT: '#C8FF00',
          dark: '#B2E600',
          soft: '#E9FF99',
        },
        obsidian: {
          DEFAULT: '#0B0C0E',
          card: '#14161B',
          elevated: '#1E2028',
          muted: '#2A2D37',
        },
        signal: {
          DEFAULT: '#FF9F0A',
          soft: '#FFE5B4',
        },
        canvas: {
          light: '#F4F5F7',
          dark: '#0B0C0E',
        },
      },
      boxShadow: {
        'sheet': '0 12px 36px -8px rgba(11, 12, 14, 0.08), 0 2px 6px rgba(11, 12, 14, 0.04)',
        'sheet-dark': '0 16px 40px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        'volt-glow': '0 8px 24px -4px rgba(200, 255, 0, 0.35)',
        'brutal': '0 3px 0 0 #0B0C0E',
      },
    },
  },
  plugins: [],
};

export default config;
