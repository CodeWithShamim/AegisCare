import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🛡️</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">AegisCare</h1>
                <p className="text-sm text-gray-500">Privacy-Preserving Clinical Trial Matching</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Clinical Trial Matching with
            <span className="block text-indigo-600 mt-2">Complete Privacy</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            AegisCare uses Fully Homomorphic Encryption (FHE) to match patients with clinical trials
            without ever revealing medical data in plaintext.
          </p>

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
                    <span>
                      Check eligibility - computed on encrypted data on the blockchain
                    </span>
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

          {/* Technology Stack */}
          <div className="mt-20 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Built with Privacy-First Technology</h3>
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
              AegisCare ensures that <strong>no plaintext medical data ever appears</strong> on-chain,
              in logs, or in the UI. All computation happens on encrypted data using FHE, and only the
              patient can decrypt their eligibility results using their private key. This provides
              unprecedented privacy protection for clinical trial matching.
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
