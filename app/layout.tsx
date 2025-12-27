import type { Metadata } from 'next';
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
  title: 'AegisCare - Privacy-Preserving Clinical Trial Matching',
  description:
    'Match patients with clinical trials using Fully Homomorphic Encryption (FHE) for complete privacy',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Web3ContextProvider>
          <FHEProvider>{children}</FHEProvider>
        </Web3ContextProvider>
      </body>
    </html>
  );
}
