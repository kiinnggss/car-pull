import type { Metadata, Viewport } from 'next';
import './globals.css';

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
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#F4F4F5]">
      <body className="min-h-screen bg-[#F4F4F5] text-zinc-900 antialiased flex flex-col items-center">
        {children}
      </body>
    </html>
  );
}
