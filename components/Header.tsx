'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl">🛡️</span>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">AegisCare</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Privacy-Preserving Clinical Trial Matching
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation & Wallet */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>

              <Link
                href="/patient"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/patient')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Patient
              </Link>

              <Link
                href="/trial-admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/trial-admin')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Trial Admin
              </Link>

              <Link
                href="/docs"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/docs')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Docs
                </span>
              </Link>
            </nav>

            {/* Wallet Connect Button */}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
