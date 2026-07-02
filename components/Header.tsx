'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  // Lock body scroll while the full-screen mobile panel is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 px-4 py-2 backdrop-blur-md md:px-6 md:py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo — two-line stacked branding */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="transition-transform duration-300 group-hover:scale-105">
            <Logo size={34} />
          </span>
          <span className="flex flex-col leading-[0.95]">
            <span className="text-lg font-extrabold tracking-tight text-black">
              AegisCare
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Private Trial Matching
            </span>
          </span>
        </Link>

        {/* Desktop navigation + wallet */}
        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-black bg-black text-white'
                      : 'border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* GenLayer Studio explorer */}
          <a
            href={STUDIO_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full border border-black px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
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

          <div className="mx-1 h-6 w-px bg-neutral-300" />

          {/* Wallet Connect Button (logic untouched) */}
          <WalletButton />
        </div>

        {/* Mobile: wallet + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <WalletButton />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-black p-2 text-black transition-colors hover:bg-black hover:text-white"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile full-screen slide-in panel (85% width, from the right) */}
      <div
        className={`fixed inset-0 z-60 md:hidden ${
          mobileMenuOpen ? '' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute right-0 top-0 flex h-full w-[85%] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-lg font-extrabold tracking-tight text-black">
              AegisCare
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-black p-2 text-black transition-colors hover:bg-black hover:text-white"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-6 py-4">
            {navLinks.map((link, i) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={mobileMenuOpen ? { animationDelay: `${i * 70}ms` } : undefined}
                  className={`${mobileMenuOpen ? 'ac-nav-link' : 'opacity-0'} rounded-2xl px-4 py-3 text-2xl font-bold tracking-tight transition-colors ${
                    active ? 'text-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <a
              href={STUDIO_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              style={
                mobileMenuOpen
                  ? { animationDelay: `${navLinks.length * 70}ms` }
                  : undefined
              }
              className={`${mobileMenuOpen ? 'ac-nav-link' : 'opacity-0'} mt-2 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-2xl font-bold tracking-tight text-neutral-500 transition-colors hover:text-black`}
            >
              GenLayer Explorer
              <svg
                className="h-5 w-5 opacity-60"
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
          </nav>
        </div>
      </div>
    </header>
  );
}
