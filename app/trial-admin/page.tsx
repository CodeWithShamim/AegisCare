'use client';

import { useState } from 'react';
import TrialRegistrationForm from '@/components/TrialRegistrationForm';
import SponsorAnalytics from '@/components/SponsorAnalytics';
import Header from '@/components/Header';
import {
  getTrialCount,
  getTrialPublicInfo,
  getSponsorTrials,
  connectWallet,
} from '@/lib/web3Client';

interface Trial {
  trialId: number;
  trialName: string;
  description: string;
  sponsor: string;
  isActive: boolean;
  createdAt: number;
  participantCount: number;
}

export default function TrialAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics'>('create');
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

  const handleTabChange = (tab: 'create' | 'manage' | 'analytics') => {
    setActiveTab(tab);
    if (tab === 'manage' && trials.length === 0) {
      loadTrials();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <Header />

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
            <nav className="-mb-px flex overflow-x-auto space-x-8 scrollbar-hide">
              <button
                onClick={() => handleTabChange('create')}
                className={`${
                  activeTab === 'create'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Create New Trial
              </button>
              <button
                onClick={() => handleTabChange('manage')}
                className={`${
                  activeTab === 'manage'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Manage My Trials
                {trials.length > 0 && (
                  <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                    {trials.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0`}
              >
                Analytics Dashboard (New)
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
                  Your trial eligibility criteria (age range, gender requirements, BMI limits,
                  medical conditions) will be encrypted before submission. Patients can check their
                  eligibility without revealing their medical data to you or anyone else.
                </p>
              </div>
              <TrialRegistrationForm onRegistrationSuccess={handleTrialCreated} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">
                  📊 Performance Analytics
                </h3>
                <p className="text-xs text-purple-800">
                  View detailed analytics about your clinical trials, participant engagement, and performance metrics.
                </p>
              </div>
              <SponsorAnalytics />
            </div>
          )}

          {activeTab === 'manage' && (
            <div>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  ✓ Privacy-Preserving Trials
                </h3>
                <p className="text-xs text-green-800">
                  Your trials are listed below. Patients can check eligibility without revealing
                  their medical data. You never see patient information in plaintext.
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trials.map((trial) => (
                    <div
                      key={trial.trialId}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                    >
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {trial.trialName}
                          </h4>
                          {trial.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0 ml-2">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex-shrink-0 ml-2">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">{trial.description}</p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Participants</span>
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <p className="text-2xl font-bold text-indigo-600">{trial.participantCount}</p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Trial ID</span>
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                          </div>
                          <p className="text-lg font-bold text-purple-600">#{trial.trialId}</p>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="mb-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created {new Date(trial.createdAt * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      {/* Sponsor Info */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Sponsor: {trial.sponsor.slice(0, 6)}...{trial.sponsor.slice(-4)}
                        </div>
                      </div>

                      {/* Privacy Notice */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 flex items-center">
                          <span className="mr-1">🔒</span>
                          Eligibility checks are encrypted
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why This Matters for Trial Sponsors
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Increased Patient Participation
                </h4>
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
              <strong>1. Encrypted Criteria:</strong> Your eligibility criteria (age, gender, BMI,
              conditions) are encrypted using Zama FHE before submission to the blockchain.
            </p>
            <p>
              <strong>2. Encrypted Matching:</strong> When patients check eligibility, the smart
              contract compares their encrypted medical data with your encrypted criteria entirely
              in the encrypted domain.
            </p>
            <p>
              <strong>3. Private Results:</strong> The eligibility result is encrypted and only the
              patient can decrypt it using their private key. You never see the patient's medical
              data or the result.
            </p>
            <p>
              <strong>4. Zero-Knowledge Proofs:</strong> Patients can prove they're eligible without
              revealing why or how they match your criteria.
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
