import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7C3AED',
          dark: '#6D28D9',
          glow: '#A855F7',
          subtle: 'rgba(124, 58, 237, 0.08)',
        },
        surface: {
          canvas: '#FFFFFF',
          card: '#F8FAFC',
          elevated: '#F1F5F9',
          divider: '#E2E8F0',
        },
        text: {
          primary: '#09090B',
          secondary: '#64748B',
          tertiary: '#94A3B8',
        },
        status: {
          sos: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          ac: '#06B6D4',
        },
      },
    },
  },
  plugins: [],
};

export default config;
