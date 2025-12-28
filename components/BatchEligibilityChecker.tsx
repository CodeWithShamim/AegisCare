/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { computeEligibility, getEligibilityResult, connectWallet, getTrialPublicInfo } from '@/lib/web3Client';
import { decryptEligibilityResult } from '@/lib/fheClient';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';
import LoadingAnimation from '@/components/LoadingAnimation';
import ErrorDisplay from '@/components/ErrorDisplay';

interface Trial {
  trialId: number;
  trialName: string;
  description: string;
  sponsor: string;
  isActive: boolean;
  trialPhase?: string;
  compensation?: string;
  location?: string;
  durationWeeks?: number;
  studyType?: string;
}

interface BatchResult {
  trialId: number;
  trialName: string;
  status: 'pending' | 'computing' | 'decrypting' | 'eligible' | 'not eligible' | 'error';
  eligibilityResult?: boolean;
  error?: string;
}

interface BatchEligibilityCheckerProps {
  patientAddress?: string;
}

export default function BatchEligibilityChecker({ patientAddress }: BatchEligibilityCheckerProps) {
  const { isConnected, address } = useWalletConnection();

  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedTrialIds, setSelectedTrialIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<any>(null);
  const [results, setResults] = useState<BatchResult[]>([]);

  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { provider } = await connectWallet();
      const contractAddress = process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      // Get trial count first
      const trialCountBigInt = await provider.getBalance(contractAddress); // Just to trigger connection
      // We need to actually call the contract
      // For now, let's use getTrialPublicInfo in a loop

      const loadedTrials: Trial[] = [];
      let trialId = 1;

      while (true) {
        try {
          const trial = await getTrialPublicInfo(provider, trialId);
          if (trial.isActive) {
            loadedTrials.push(trial);
          }
          trialId++;
        } catch (err) {
          // Trial doesn't exist, we've reached the end
          break;
        }
      }

      setTrials(loadedTrials);
    } catch (err: any) {
      setError(err.message || 'Failed to load trials');
      console.error('[BatchEligibilityChecker] Error loading trials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrialToggle = (trialId: number) => {
    setSelectedTrialIds((prev) =>
      prev.includes(trialId) ? prev.filter((id) => id !== trialId) : [...prev, trialId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTrialIds.length === trials.length) {
      setSelectedTrialIds([]);
    } else {
      setSelectedTrialIds(trials.map((t) => t.trialId));
    }
  };

  const handleCheckBatchEligibility = async () => {
    if (selectedTrialIds.length === 0 || !patientAddress) {
      setError('Please select at least one trial');
      return;
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet from the header first');
      return;
    }

    if (address.toLowerCase() !== patientAddress.toLowerCase()) {
      setError('Wallet mismatch! Please connect with the same wallet you registered with.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Initialize results for all selected trials
    const initialResults: BatchResult[] = selectedTrialIds.map((trialId) => {
      const trial = trials.find((t) => t.trialId === trialId);
      return {
        trialId,
        trialName: trial?.trialName || `Trial ${trialId}`,
        status: 'pending',
      };
    });
    setResults(initialResults);

    try {
      const { signer } = await connectWallet();
      const contractAddress = process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS || '';

      // Process each trial sequentially
      for (let i = 0; i < selectedTrialIds.length; i++) {
        const trialId = selectedTrialIds[i];

        // Update status to computing
        setResults((prev) =>
          prev.map((r) =>
            r.trialId === trialId ? { ...r, status: 'computing' } : r
          )
        );

        try {
          // Step 1: Compute eligibility
          await computeEligibility(signer, trialId, patientAddress);

          // Step 2: Get encrypted result
          const encryptedResult = await getEligibilityResult(signer, trialId, patientAddress);

          if (!encryptedResult) {
            throw new Error('No result found');
          }

          // Step 3: Decrypt result
          setResults((prev) =>
            prev.map((r) =>
              r.trialId === trialId ? { ...r, status: 'decrypting' } : r
            )
          );

          const isEligible = await decryptEligibilityResult(
            encryptedResult,
            contractAddress,
            signer
          );

          // Update result
          setResults((prev) =>
            prev.map((r) =>
              r.trialId === trialId
                ? {
                    ...r,
                    status: isEligible ? 'eligible' : 'not eligible',
                    eligibilityResult: isEligible,
                  }
                : r
            )
          );
        } catch (err: any) {
          console.error(`Error checking trial ${trialId}:`, err);
          setResults((prev) =>
            prev.map((r) =>
              r.trialId === trialId
                ? {
                    ...r,
                    status: 'error',
                    error: err.message || 'Failed to check eligibility',
                  }
                : r
            )
          );
        }
      }
    } catch (err: any) {
      setError(err.message || 'Batch eligibility check failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: BatchResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'computing':
        return '🔄';
      case 'decrypting':
        return '🔓';
      case 'eligible':
        return '✅';
      case 'not eligible':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: BatchResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      case 'computing':
        return 'bg-blue-50 border-blue-200';
      case 'decrypting':
        return 'bg-indigo-50 border-indigo-200';
      case 'eligible':
        return 'bg-green-50 border-green-200';
      case 'not eligible':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch Eligibility Checker</h2>
        <p className="text-sm text-gray-600">
          Check your eligibility for multiple trials at once.
          <br />
          <span className="text-xs text-gray-500">
            🔒 All checks are private - only you see the results
          </span>
        </p>
      </div>

      {/* Wallet Connection */}
      {!isConnected ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Please connect your wallet from the header to continue
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="mb-6">
          <ErrorDisplay
            error={error}
            onDismiss={() => setError(null)}
            showTechnicalDetails={true}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Loading trials...</p>
        </div>
      )}

      {/* Trial Selection */}
      {!isLoading && trials.length > 0 && (
        <>
          {/* Select All Button */}
          <div className="mb-4 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Select Trials to Check ({selectedTrialIds.length} selected)
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={isProcessing}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {selectedTrialIds.length === trials.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Trial List */}
          <div className="mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              {trials.map((trial) => (
                <div
                  key={trial.trialId}
                  className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`trial-${trial.trialId}`}
                    checked={selectedTrialIds.includes(trial.trialId)}
                    onChange={() => handleTrialToggle(trial.trialId)}
                    disabled={isProcessing}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <label
                      htmlFor={`trial-${trial.trialId}`}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {trial.trialName}
                    </label>
                    <p className="text-xs text-gray-600 mt-1">{trial.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {trial.trialPhase && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {trial.trialPhase}
                        </span>
                      )}
                      {trial.location && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          📍 {trial.location}
                        </span>
                      )}
                      {trial.compensation && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          💰 {trial.compensation} ETH
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Check All Button */}
          <button
            onClick={handleCheckBatchEligibility}
            disabled={selectedTrialIds.length === 0 || isProcessing}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
          >
            {isProcessing
              ? `Checking ${results.filter(r => r.status === 'computing' || r.status === 'decrypting').length} of ${selectedTrialIds.length}...`
              : `Check Eligibility for ${selectedTrialIds.length} Trial${selectedTrialIds.length !== 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
          <div className="space-y-4">
            {results.map((result) => {
              const trial = trials.find((t) => t.trialId === result.trialId);
              return (
                <div
                  key={result.trialId}
                  className={`p-4 border-2 rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getStatusIcon(result.status)}</span>
                        <h4 className="text-base font-semibold text-gray-900">
                          {result.trialName}
                        </h4>
                      </div>
                      {trial && (
                        <>
                          <p className="text-sm text-gray-700 mb-2">{trial.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {trial.trialPhase && (
                              <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded">
                                Phase: {trial.trialPhase}
                              </span>
                            )}
                            {trial.location && (
                              <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded">
                                📍 {trial.location}
                              </span>
                            )}
                            {trial.compensation && (
                              <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded">
                                💰 {trial.compensation} ETH
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-xs font-medium text-gray-700 uppercase mb-1">
                        Status
                      </div>
                      <div className="text-sm font-semibold">
                        {result.status === 'eligible' && 'Eligible'}
                        {result.status === 'not eligible' && 'Not Eligible'}
                        {result.status === 'computing' && 'Computing...'}
                        {result.status === 'decrypting' && 'Decrypting...'}
                        {result.status === 'pending' && 'Pending...'}
                        {result.status === 'error' && 'Error'}
                      </div>
                    </div>
                  </div>
                  {result.error && (
                    <div className="mt-3 text-xs text-red-700 bg-red-100 bg-opacity-50 p-2 rounded">
                      {result.error}
                    </div>
                  )}
                  {result.eligibilityResult !== undefined && (
                    <div className="mt-3">
                      {result.eligibilityResult ? (
                        <div className="text-xs text-green-800 bg-green-100 bg-opacity-50 p-2 rounded">
                          🎉 Based on your encrypted medical data, you meet the eligibility criteria for this trial.
                          Contact the sponsor for next steps.
                        </div>
                      ) : (
                        <div className="text-xs text-yellow-800 bg-yellow-100 bg-opacity-50 p-2 rounded">
                          Based on your encrypted medical data, you do not meet the eligibility criteria for this trial.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mb-6">
          <LoadingAnimation
            message={`Processing batch eligibility check...`}
            type="blockchain"
            submessage={`${results.filter(r => r.status === 'eligible' || r.status === 'not eligible').length} of ${selectedTrialIds.length} completed`}
          />
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600 font-medium mb-2">🔒 Privacy Protection:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Each eligibility check is computed independently on encrypted data</li>
          <li>• Results are encrypted and only you can decrypt them</li>
          <li>• No one else knows which trials you're eligible for</li>
          <li>• Batch processing saves you time while maintaining complete privacy</li>
        </ul>
      </div>
    </div>
  );
}
