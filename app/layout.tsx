import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Web3ContextProvider } from '@/components/providers/Web3Provider';
import { FHEProvider } from '@/components/providers/FHEProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AegisCare — Privacy-Preserving Clinical Trial Matching',
    template: '%s · AegisCare',
  },
  description:
    'Match patients with clinical trials using Fully Homomorphic Encryption (FHE) and a GenLayer AI advisor — complete privacy, zero plaintext leakage.',
  applicationName: 'AegisCare',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'AegisCare — Privacy-Preserving Clinical Trial Matching',
    description:
      'FHE-encrypted eligibility matching with an on-chain GenLayer AI advisor. Your medical data never leaves your browser in plaintext.',
    siteName: 'AegisCare',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366F1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.zama.org/relayer-sdk-js/0.3.0-8/relayer-sdk-js.umd.cjs"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}>
        <Web3ContextProvider>
          <FHEProvider>{children}</FHEProvider>
        </Web3ContextProvider>
      </body>
    </html>
  );
}
