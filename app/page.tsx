'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { usePlatformStats } from '@/lib/hooks/usePlatformStats';

export default function Home() {
  const stats = usePlatformStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="py-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Clinical Trial Matching with
              <span className="block text-indigo-600 mt-2">Complete Privacy</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              AegisCare uses Fully Homomorphic Encryption (FHE) to match patients with clinical
              trials without ever revealing medical data in plaintext.
            </p>
          </div>

          {/* Platform Statistics */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Trials */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Active Trials
                    </p>
                    {stats.isLoading ? (
                      <div className="animate-pulse mt-2">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    ) : (
                      <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalTrials}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Registered clinical trials</p>
                  </div>
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Patients */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Protected Patients
                    </p>
                    {stats.isLoading ? (
                      <div className="animate-pulse mt-2">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    ) : (
                      <p className="text-4xl font-bold text-green-600 mt-2">
                        {stats.totalPatients}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Privacy-preserving registrations</p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Privacy Score */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Data Privacy
                    </p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">100%</p>
                    <p className="text-xs text-gray-500 mt-1">End-to-end encrypted</p>
                  </div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activity Indicator */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>Platform active on Zama FHE Devnet</span>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
              <p className="text-sm text-gray-600">
                Medical data is encrypted before leaving your browser and stays encrypted throughout
                the matching process
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">FHE-Powered</h3>
              <p className="text-sm text-gray-600">
                Eligibility is computed on encrypted data using Zama FHEVM - no plaintext exposure
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Results</h3>
              <p className="text-sm text-gray-600">
                Only you can decrypt your eligibility results using your private key
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/patient"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              I'm a Patient
            </Link>
            <Link
              href="/trial-admin"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              I'm a Trial Sponsor
            </Link>
            <Link
              href="/analytics"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              📊 Platform Analytics
            </Link>
          </div>

          {/* How It Works */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h4 className="text-lg font-semibold text-indigo-600 mb-3">For Patients</h4>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      1
                    </span>
                    <span>Register with encrypted medical data (age, gender, BMI, conditions)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      2
                    </span>
                    <span>Browse available clinical trials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      3
                    </span>
                    <span>Check eligibility - computed on encrypted data on the blockchain</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      4
                    </span>
                    <span>Decrypt your result with EIP-712 signature (only you see it)</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h4 className="text-lg font-semibold text-indigo-600 mb-3">For Trial Sponsors</h4>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      1
                    </span>
                    <span>Create trial with encrypted eligibility criteria</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      2
                    </span>
                    <span>Set age range, gender requirements, BMI limits, condition codes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      3
                    </span>
                    <span>
                      Patients automatically check eligibility without revealing their data
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                      4
                    </span>
                    <span>Privacy guaranteed - you never see patient medical data</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">See AegisCare in Action</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Watch how our platform revolutionizes clinical trial matching with complete privacy
                preservation
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* Gradient Border Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30"></div>

              {/* Video Container */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
                {/* Video Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                      <span className="text-white font-semibold">Featured Demo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/80 text-sm">Powered by</span>
                      <span className="text-white font-bold">Zama FHE</span>
                    </div>
                  </div>
                </div>

                {/* YouTube Video Embed */}
                <div className="relative aspect-video w-full bg-gray-900">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/yj6QrbiY7nU?rel=0&modestbranding=1"
                    title="AegisCare Demo - Privacy-Preserving Clinical Trial Matching"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          Learn how FHE protects patient data
                        </span>
                      </div>
                    </div>

                    <a
                      href="https://www.youtube.com/watch?v=yj6QrbiY7nU"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <span className="text-3xl">🎬</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <span className="text-2xl">🔐</span>
              </div>
            </div>

            {/* Feature Highlights Below Video */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">100% Encrypted</h4>
                <p className="text-sm text-gray-600">
                  Medical data stays encrypted throughout the entire process
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">HIPAA Compliant</h4>
                <p className="text-sm text-gray-600">
                  Meets healthcare privacy regulations with FHE technology
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Lightning Fast</h4>
                <p className="text-sm text-gray-600">
                  Real-time eligibility checking on encrypted data
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mt-20 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Built with Privacy-First Technology
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium text-gray-900">Zama FHEVM</p>
                <p className="text-xs text-gray-500">Fully Homomorphic Encryption</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔗</div>
                <p className="text-sm font-medium text-gray-900">Ethereum</p>
                <p className="text-xs text-gray-500">Blockchain Infrastructure</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="text-sm font-medium text-gray-900">EIP-712</p>
                <p className="text-xs text-gray-500">Typed Data Signing</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔑</div>
                <p className="text-sm font-medium text-gray-900">Private Keys</p>
                <p className="text-xs text-gray-500">User-Only Decryption</p>
              </div>
            </div>
          </div>

          {/* User Guide Section - Web3 Style */}
          <div className="mt-20 relative">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>

            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-1 shadow-2xl border border-gray-700">
              {/* Inner Gradient Border */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-indigo-300 text-sm font-medium">NEW Comprehensive Guide</span>
                  </div>

                  <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
                    📘 Master AegisCare
                  </h3>
                  <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                    Everything you need to know about privacy-preserving clinical trial matching
                  </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Left Card - CTA */}
                  <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl p-8 border border-indigo-500/30 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">Complete User Guide</h4>
                        <p className="text-indigo-300 text-sm">500+ Lines of Documentation</p>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-6">
                      Dive deep into AegisCare with our comprehensive guide. Learn about FHE technology,
                      privacy preservation, and how to use the platform effectively.
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        10 Comprehensive Sections
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        50+ FAQ Questions Answered
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Step-by-Step Tutorials
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Real-World Use Cases
                      </div>
                    </div>

                    <Link
                      href="/USER_GUIDE.md"
                      className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl border border-indigo-400/30"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      📖 Read Full Guide
                    </Link>
                  </div>

                  {/* Right Card - Quick Links */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                      <span className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </span>
                      Quick Access
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <a href="/USER_GUIDE.md#what-is-aegiscare" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-indigo-500/50 transition-all">
                        <div className="text-2xl mb-2">🛡️</div>
                        <p className="text-sm font-semibold text-white group-hover:text-indigo-300">What is AegisCare?</p>
                        <p className="text-xs text-gray-500 mt-1">Platform overview</p>
                      </a>

                      <a href="/USER_GUIDE.md#why-do-we-need-it" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all">
                        <div className="text-2xl mb-2">💡</div>
                        <p className="text-sm font-semibold text-white group-hover:text-purple-300">Why Do We Need It?</p>
                        <p className="text-xs text-gray-500 mt-1">Real-world problems</p>
                      </a>

                      <a href="/USER_GUIDE.md#how-does-it-work" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-pink-500/50 transition-all">
                        <div className="text-2xl mb-2">⚙️</div>
                        <p className="text-sm font-semibold text-white group-hover:text-pink-300">How It Works</p>
                        <p className="text-xs text-gray-500 mt-1">Step-by-step guide</p>
                      </a>

                      <a href="/USER_GUIDE.md#key-concepts-explained" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all">
                        <div className="text-2xl mb-2">🔐</div>
                        <p className="text-sm font-semibold text-white group-hover:text-blue-300">Key Concepts</p>
                        <p className="text-xs text-gray-500 mt-1">FHE, EIP-712, ACLs</p>
                      </a>

                      <a href="/USER_GUIDE.md#getting-started-tutorial" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-all">
                        <div className="text-2xl mb-2">🚀</div>
                        <p className="text-sm font-semibold text-white group-hover:text-green-300">Getting Started</p>
                        <p className="text-xs text-gray-500 mt-1">5-minute tutorial</p>
                      </a>

                      <a href="/USER_GUIDE.md#real-world-use-cases" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all">
                        <div className="text-2xl mb-2">🎯</div>
                        <p className="text-sm font-semibold text-white group-hover:text-yellow-300">Use Cases</p>
                        <p className="text-xs text-gray-500 mt-1">Practical examples</p>
                      </a>

                      <a href="/USER_GUIDE.md#security--privacy" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-red-500/50 transition-all">
                        <div className="text-2xl mb-2">🔒</div>
                        <p className="text-sm font-semibold text-white group-hover:text-red-300">Security</p>
                        <p className="text-xs text-gray-500 mt-1">Privacy guarantees</p>
                      </a>

                      <a href="/USER_GUIDE.md#faq" className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/50 transition-all">
                        <div className="text-2xl mb-2">❓</div>
                        <p className="text-sm font-semibold text-white group-hover:text-cyan-300">FAQ</p>
                        <p className="text-xs text-gray-500 mt-1">50+ questions</p>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600">
                  <h4 className="text-lg font-bold text-white mb-4 text-center">Perfect For</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center group">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-3 border border-blue-500/30 group-hover:border-blue-500/60 transition-all">
                        <span className="text-3xl">👤</span>
                      </div>
                      <p className="text-sm font-semibold text-white">Patients</p>
                      <p className="text-xs text-gray-400 mt-1">Protect your privacy</p>
                    </div>

                    <div className="text-center group">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-3 border border-purple-500/30 group-hover:border-purple-500/60 transition-all">
                        <span className="text-3xl">🏢</span>
                      </div>
                      <p className="text-sm font-semibold text-white">Trial Sponsors</p>
                      <p className="text-xs text-gray-400 mt-1">Zero-knowledge matching</p>
                    </div>

                    <div className="text-center group">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mb-3 border border-green-500/30 group-hover:border-green-500/60 transition-all">
                        <span className="text-3xl">💻</span>
                      </div>
                      <p className="text-sm font-semibold text-white">Developers</p>
                      <p className="text-xs text-gray-400 mt-1">Explore FHE tech</p>
                    </div>

                    <div className="text-center group">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl flex items-center justify-center mb-3 border border-yellow-500/30 group-hover:border-yellow-500/60 transition-all">
                        <span className="text-3xl">🎓</span>
                      </div>
                      <p className="text-sm font-semibold text-white">Students</p>
                      <p className="text-xs text-gray-400 mt-1">Learn privacy apps</p>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400 mb-4">Ready to explore the future of private healthcare?</p>
                  <Link
                    href="/USER_GUIDE.md"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl border border-white/20"
                  >
                    📖 Start Reading the User Guide
                  </Link>
                  <p className="text-xs text-gray-500 mt-3">
                    10 Major Sections • 500+ Lines • Perfect for Beginners
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-12 bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <h4 className="text-lg font-semibold text-indigo-900 mb-3">🔒 Security Guarantee</h4>
            <p className="text-sm text-indigo-800">
              AegisCare ensures that <strong>no plaintext medical data ever appears</strong>{' '}
              on-chain, in logs, or in the UI. All computation happens on encrypted data using FHE,
              and only the patient can decrypt their eligibility results using their private key.
              This provides unprecedented privacy protection for clinical trial matching.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            AegisCare - Privacy-Preserving Clinical Trial Matching powered by Zama FHEVM
          </p>
        </div>
      </footer>
    </div>
  );
}
