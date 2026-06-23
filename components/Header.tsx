'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { WalletButton } from './WalletButton';
import Logo from './Logo';
import {
  ADVISOR_ADDRESS,
  GENLAYER_EXPLORER_URL,
  genlayerExplorerAddressUrl,
} from '@/config/genLayerContracts';

type NavLink = { href: string; label: string };

const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/patient', label: 'Patient' },
  { href: '/trial-admin', label: 'Trial Admin' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/docs', label: 'Docs' },
];

const STUDIO_HREF = ADVISOR_ADDRESS
  ? genlayerExplorerAddressUrl(ADVISOR_ADDRESS)
  : GENLAYER_EXPLORER_URL;

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="group flex items-center gap-3">
            <span className="transition-transform duration-300 group-hover:scale-105">
              <Logo size={36} />
            </span>
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-gray-900">
                Aegis<span className="ac-gradient-text">Care</span>
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-wider text-gray-400 sm:block">
                Private Clinical Trial Matching
              </span>
            </div>
          </Link>

          {/* Desktop Navigation & Wallet */}
          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ${
                        active ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            {/* GenLayer Studio explorer */}
            <a
              href={STUDIO_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Explorer
              <svg
                className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            {/* Wallet Connect Button */}
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <WalletButton />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1 px-3 py-3">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={STUDIO_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium text-purple-700 transition-colors hover:bg-purple-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              GenLayer Explorer
            </span>
            <svg
              className="h-4 w-4 opacity-60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
