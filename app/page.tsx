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
