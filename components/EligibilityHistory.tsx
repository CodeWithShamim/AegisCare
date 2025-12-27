/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getAegisCareContractReadOnly } from '@/lib/web3Client';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';
import LoadingAnimation from './LoadingAnimation';
import ErrorDisplay from './ErrorDisplay';

interface EligibilityCheck {
  resultId: number;
  trialId: number;
  patientId: number;
  isEligible: boolean;
  computedAt: number;
  trialName?: string;
  trialDescription?: string;
}

interface EligibilityHistoryProps {
  patientAddress: string;
}

export default function EligibilityHistory({ patientAddress }: EligibilityHistoryProps) {
  const { isConnected, address } = useWalletConnection();
  const [eligibilityChecks, setEligibilityChecks] = useState<EligibilityCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (isConnected && address && address.toLowerCase() === patientAddress.toLowerCase()) {
      loadEligibilityHistory();
    }
  }, [isConnected, address, patientAddress]);

  const loadEligibilityHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { provider } = await connectWallet();
      const contract = getAegisCareContractReadOnly(provider);

      // Get eligibility check IDs for the patient
      const checkIds = await contract.patientEligibilityChecks(patientAddress);

      if (!checkIds || checkIds.length === 0) {
        setEligibilityChecks([]);
        setIsLoading(false);
        return;
      }

      const checks: EligibilityCheck[] = [];

      for (const resultId of checkIds) {
        const trialId = Math.floor(Number(resultId) / 1000000);
        const patientId = Number(resultId) % 1000000;

        // Get trial info using read-only contract
        const trial = await contract.getTrialPublicInfo(trialId);

        checks.push({
          resultId: Number(resultId),
          trialId,
          patientId,
          isEligible: false, // We don't decrypt the result here for privacy
          computedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Mock timestamp
          trialName: trial.trialName,
          trialDescription: trial.description,
        });
      }

      // Sort by computedAt (newest first)
      checks.sort((a, b) => b.computedAt - a.computedAt);

      setEligibilityChecks(checks);
    } catch (err: any) {
      setError(err.message || 'Failed to load eligibility history');
      console.error('[EligibilityHistory] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Eligibility History</h2>
        <p className="text-sm text-gray-600">
          Your past clinical trial eligibility checks.
          <br />
          <span className="text-xs text-gray-500">
            🔒 Results are encrypted. Only you can decrypt them by checking eligibility again.
          </span>
        </p>
      </div>

      {/* Wallet Connection Check */}
      {!isConnected ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Please connect your wallet to view your eligibility history
          </p>
        </div>
      ) : (
        address &&
        patientAddress &&
        address.toLowerCase() !== patientAddress.toLowerCase() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please connect with the wallet you registered with ({patientAddress.slice(0, 6)}...
              {patientAddress.slice(-4)}) to view your history
            </p>
          </div>
        )
      )}

      {/* Error Messages */}
      {error && (
        <div className="mb-6">
          <ErrorDisplay error={error} onDismiss={() => setError(null)} showTechnicalDetails={true} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6">
          <LoadingAnimation
            message="Loading your eligibility history"
            type="default"
            submessage="Fetching past checks from the blockchain"
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && eligibilityChecks.length === 0 && isConnected && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Eligibility Checks Yet</h3>
          <p className="text-sm text-gray-600">
            You haven't checked your eligibility for any clinical trials yet.
            <br />
            Use the eligibility checker above to find matching trials.
          </p>
        </div>
      )}

      {/* Eligibility History List */}
      {!isLoading && eligibilityChecks.length > 0 && (
        <div className="space-y-4">
          {eligibilityChecks.map((check) => (
            <div
              key={check.resultId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Trial #{check.trialId}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Check #{check.resultId}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{check.trialName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{check.trialDescription}</p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{formatDate(check.computedAt)}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
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
                      <span>Encrypted Result</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end">
                  <div className="text-center mb-2">
                    <div className="text-2xl">🔒</div>
                    <p className="text-xs text-gray-600 mt-1">Result Encrypted</p>
                  </div>
                  <p className="text-xs text-gray-500 text-right max-w-[150px]">
                    Only you can decrypt this result
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600 font-medium mb-2">🔒 Privacy Notice:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Your eligibility results are encrypted on the blockchain</li>
          <li>• Only you can decrypt them using your private key</li>
          <li>• To view a result, check eligibility for that trial again</li>
          <li>• No one else can see whether you were eligible or not</li>
        </ul>
      </div>
    </div>
  );
}
