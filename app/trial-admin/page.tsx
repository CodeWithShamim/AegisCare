'use client';

/**
 * Trial Admin Dashboard Page
 *
 * Allows trial sponsors to:
 * 1. Register new clinical trials with encrypted eligibility criteria
 * 2. Manage existing trials
 */

import { useState } from 'react';
import TrialRegistrationForm from '@/components/TrialRegistrationForm';
import { getTrialCount, getTrialPublicInfo, getSponsorTrials, connectWallet } from '@/lib/web3Client';

interface Trial {
  trialId: number;
  trialName: string;
  description: string;
  sponsor: string;
  isActive: boolean;
}

export default function TrialAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  /**
   * Load sponsor's trials
   */
  const loadTrials = async () => {
    try {
      setIsLoading(true);
      const { address, provider } = await connectWallet();
      setWalletAddress(address);

      // Get trial IDs for this sponsor
      const trialIds = await getSponsorTrials(provider, address);

      // Load trial details
      const loadedTrials: Trial[] = [];
      for (const trialId of trialIds) {
        const trial = await getTrialPublicInfo(provider, trialId);
        loadedTrials.push(trial);
      }

      setTrials(loadedTrials);
      console.log('[TrialAdmin] Loaded trials:', loadedTrials.length);
    } catch (error) {
      console.error('[TrialAdmin] Error loading trials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrialCreated = (trialId: number) => {
    console.log('[TrialAdmin] Trial created with ID:', trialId);
    // Reload trials when switching to manage tab
    if (activeTab === 'manage') {
      loadTrials();
    }
  };

  const handleTabChange = (tab: 'create' | 'manage') => {
    setActiveTab(tab);
    if (tab === 'manage' && trials.length === 0) {
      loadTrials();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl">🛡️</span>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">AegisCare</h1>
                <p className="text-xs text-gray-500">Trial Sponsor Dashboard</p>
              </div>
            </div>
            <a
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Trial Sponsor Portal</h2>
          <p className="text-gray-600">
            Create clinical trials with encrypted eligibility criteria
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('create')}
                className={`${
                  activeTab === 'create'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Create New Trial
              </button>
              <button
                onClick={() => handleTabChange('manage')}
                className={`${
                  activeTab === 'manage'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Manage My Trials
                {trials.length > 0 && (
                  <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                    {trials.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'create' && (
            <div>
              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">
                  🔐 Encrypted Eligibility Criteria
                </h3>
                <p className="text-xs text-indigo-800">
                  Your trial eligibility criteria (age range, gender requirements, BMI limits, medical
                  conditions) will be encrypted before submission. Patients can check their eligibility
                  without revealing their medical data to you or anyone else.
                </p>
              </div>
              <TrialRegistrationForm onRegistrationSuccess={handleTrialCreated} />
            </div>
          )}

          {activeTab === 'manage' && (
            <div>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  ✓ Privacy-Preserving Trials
                </h3>
                <p className="text-xs text-green-800">
                  Your trials are listed below. Patients can check eligibility without revealing their
                  medical data. You never see patient information in plaintext.
                </p>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your trials...</p>
                </div>
              ) : trials.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trials Yet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You haven't created any clinical trials yet.
                  </p>
                  <button
                    onClick={() => handleTabChange('create')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Create Your First Trial
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trials.map((trial) => (
                    <div
                      key={trial.trialId}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {trial.trialName}
                            </h4>
                            {trial.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{trial.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Trial ID: {trial.trialId}</span>
                            <span>Sponsor: {trial.sponsor.slice(0, 6)}...{trial.sponsor.slice(-4)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          🔒 Eligibility criteria are encrypted. Patients can check eligibility without
                          revealing their medical data.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why This Matters for Trial Sponsors</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Increased Patient Participation</h4>
                <p className="text-xs text-gray-600">
                  Patients are more likely to participate when their medical data remains private
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Regulatory Compliance</h4>
                <p className="text-xs text-gray-600">
                  Meet HIPAA and GDPR requirements with privacy-preserving technology
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Trust and Transparency</h4>
                <p className="text-xs text-gray-600">
                  Build patient trust with provable privacy protection using FHE
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">No Plaintext Liability</h4>
                <p className="text-xs text-gray-600">
                  You never see patient medical data in plaintext, reducing data breach risk
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">
            ⚡ How FHE Powers Privacy-Preserving Trials
          </h3>
          <div className="text-xs text-indigo-800 space-y-2">
            <p>
              <strong>1. Encrypted Criteria:</strong> Your eligibility criteria (age, gender, BMI, conditions)
              are encrypted using Zama FHE before submission to the blockchain.
            </p>
            <p>
              <strong>2. Encrypted Matching:</strong> When patients check eligibility, the smart contract
              compares their encrypted medical data with your encrypted criteria entirely in the encrypted domain.
            </p>
            <p>
              <strong>3. Private Results:</strong> The eligibility result is encrypted and only the patient
              can decrypt it using their private key. You never see the patient's medical data or the result.
            </p>
            <p>
              <strong>4. Zero-Knowledge Proofs:</strong> Patients can prove they're eligible without revealing
              why or how they match your criteria.
            </p>
          </div>
        </div>
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
