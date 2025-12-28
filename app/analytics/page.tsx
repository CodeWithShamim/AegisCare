'use client';

import Header from '@/components/Header';
import PlatformAnalytics from '@/components/PlatformAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <PlatformAnalytics />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by Zama FHEVM - Enabling privacy-preserving clinical research
          </p>
        </div>
      </footer>
    </div>
  );
}
