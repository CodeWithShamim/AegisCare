'use client';

import { useState, useEffect } from 'react';
import PatientRegistrationForm from '@/components/PatientRegistrationForm';
import EligibilityChecker from '@/components/EligibilityChecker';
import BatchEligibilityChecker from '@/components/BatchEligibilityChecker';
import TrialDiscovery from '@/components/TrialDiscovery';
import EligibilityHistory from '@/components/EligibilityHistory';
import Header from '@/components/Header';
import { patientExists, connectWallet } from '@/lib/web3Client';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';

export default function PatientDashboard() {
  const { isConnected, address } = useWalletConnection();
  const [activeTab, setActiveTab] = useState<'register' | 'check' | 'discover' | 'batch' | 'history'>('register');
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [patientAddress, setPatientAddress] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setPatientAddress(address);
      // Re-check registration status when wallet changes
      checkRegistrationForAddress(address);
    } else {
      setPatientAddress('');
      setIsRegistered(null);
    }
  }, [isConnected, address]);

  /**
   * Check registration for a specific address
   */
  const checkRegistrationForAddress = async (addr: string) => {
    try {
      setIsChecking(true);
      const { provider } = await connectWallet();
      const exists = await patientExists(provider, addr);
      setIsRegistered(exists);
    } catch (error) {
      console.error('[PatientDashboard] Error checking registration:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegistrationSuccess = (patientId: number) => {
    console.log('[PatientDashboard] Registration successful, patient ID:', patientId);
    setIsRegistered(true);
    // Optionally switch to eligibility checker after registration
    setTimeout(() => {
      setActiveTab('check');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Patient Portal</h2>
          <p className="text-gray-600">
            Register with encrypted medical data and find matching clinical trials
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto space-x-8 scrollbar-hide">
              <button
                onClick={() => setActiveTab('register')}
                className={`${
                  activeTab === 'register'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Register Medical Data
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`${
                  activeTab === 'discover'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Discover Trials (New)
              </button>
              <button
                onClick={() => setActiveTab('check')}
                className={`${
                  activeTab === 'check'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Check Single Trial
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`${
                  activeTab === 'batch'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Batch Check (New)
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Eligibility History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'register' && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  🔒 Privacy First Registration
                </h3>
                <p className="text-xs text-blue-800">
                  Your medical data is encrypted in your browser before submission. Only encrypted
                  data is stored on the blockchain. You maintain full control of your private key.
                </p>
              </div>
              <PatientRegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
            </div>
          )}

          {activeTab === 'discover' && (
            <div>
              {isRegistered === false && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Not Registered</h3>
                  <p className="text-xs text-yellow-800 mb-3">
                    You need to register with your medical data before checking eligibility.
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
                  >
                    Go to Registration
                  </button>
                </div>
              )}

              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">
                  🔍 Advanced Trial Discovery
                </h3>
                <p className="text-xs text-purple-800">
                  Search, filter, and find clinical trials that match your preferences. Check
                  eligibility with private FHE computation.
                </p>
              </div>

              {patientAddress && <TrialDiscovery patientAddress={patientAddress} />}
            </div>
          )}

          {activeTab === 'check' && (
            <div>
              {isRegistered === false && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Not Registered</h3>
                  <p className="text-xs text-yellow-800 mb-3">
                    You need to register with your medical data before checking eligibility.
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
                  >
                    Go to Registration
                  </button>
                </div>
              )}

              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  🔐 Private Eligibility Check
                </h3>
                <p className="text-xs text-green-800">
                  Your eligibility is computed on encrypted data. The result is encrypted and only
                  you can decrypt it using your private key. No one else knows if you're eligible.
                </p>
              </div>

              {patientAddress && <EligibilityChecker patientAddress={patientAddress} />}
            </div>
          )}

          {activeTab === 'batch' && (
            <div>
              {isRegistered === false && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Not Registered</h3>
                  <p className="text-xs text-yellow-800 mb-3">
                    You need to register with your medical data before checking eligibility.
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
                  >
                    Go to Registration
                  </button>
                </div>
              )}

              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">
                  ⚡ Batch Eligibility Checker
                </h3>
                <p className="text-xs text-indigo-800">
                  Check your eligibility for multiple trials at once! Save time while maintaining
                  complete privacy. Each check is independently computed on encrypted data.
                </p>
              </div>

              {patientAddress && <BatchEligibilityChecker patientAddress={patientAddress} />}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {isRegistered === false && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Not Registered</h3>
                  <p className="text-xs text-yellow-800">
                    You need to register with your medical data before viewing your eligibility history.
                  </p>
                </div>
              )}

              {patientAddress && <EligibilityHistory patientAddress={patientAddress} />}
            </div>
          )}

          {isChecking && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking registration status...</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How Your Privacy is Protected
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Client-Side Encryption</h4>
                <p className="text-xs text-gray-600">
                  Medical data is encrypted in your browser before any network request
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">FHE-Powered Computation</h4>
                <p className="text-xs text-gray-600">
                  Eligibility is computed on encrypted data using Fully Homomorphic Encryption
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Private Decryption</h4>
                <p className="text-xs text-gray-600">
                  Only you can decrypt your eligibility result with EIP-712 signature
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">No Plaintext Exposure</h4>
                <p className="text-xs text-gray-600">
                  Your medical data never appears in plaintext on-chain, in logs, or in UI
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by Zama FHEVM - Fully Homomorphic Encryption for privacy-preserving computation
          </p>
        </div>
      </footer>
    </div>
  );
}
