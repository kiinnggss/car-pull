import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['600', '700', '800', '900'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'CAR PULL | Lagos Peer Commute & Roadside Dispatch',
  description:
    'Swipe-based corporate carpool matching, NIBSS fuel-split escrow, and LASDRI roadside recovery for Lagos commuters.',
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: `${basePath}/logo.png`,
    apple: `${basePath}/logo.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CAR PULL',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F5F7' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0C0E' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen min-h-[100dvh] bg-[#E4E6EB] dark:bg-[#050608] text-[#0B0C0E] dark:text-white flex flex-col items-center justify-start sm:justify-center sm:py-3 selection:bg-[#C8FF00] selection:text-[#0B0C0E]">
        {children}
      </body>
    </html>
  );
}
