import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/car-pull' : '');

export const metadata: Metadata = {
  title: 'CAR PULL - Lagos Commuter & Roadside Resilience PWA',
  description: 'Double opt-in commuter carpooling and emergency roadside assistance along the Ajah - Lekki - Victoria Island - Marina corridor.',
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: `${basePath}/logo.png`,
    apple: `${basePath}/logo.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CAR PULL',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#090D11',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[#E8EEF5] dark:bg-[#05080B] text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col items-center justify-center selection:bg-teal-500/20">
        {children}
      </body>
    </html>
  );
}
