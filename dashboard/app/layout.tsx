import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LoyaltyPass | Modern Digital Loyalty Cards & Rewards Platform',
  description:
    'Turn occasional customers into loyal regulars with beautiful digital stamp cards, instant QR scanning, and automated reward redemptions.',
  keywords: ['loyalty card', 'rewards program', 'digital punch card', 'qr code loyalty', 'next.js', 'supabase', 'pwa'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LoyaltyPass',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Navbar } from '@/components/layout/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white"
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
