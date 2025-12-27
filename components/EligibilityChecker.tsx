/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * Eligibility Checker Component
 *
 * Allows patients to check their eligibility for clinical trials.
 * The eligibility computation happens entirely on encrypted data.
 *
 * SECURITY FLOW:
 * 1. Patient selects a trial
 * 2. Smart contract computes eligibility on encrypted data
 * 3. Result is returned encrypted (euint256)
 * 4. Patient decrypts result using EIP-712 signature
 * 5. Only the patient sees the eligibility result
 */

import { useState, useEffect } from 'react';
import { computeEligibility, getEligibilityResult, connectWallet } from '@/lib/web3Client';
import { decryptEligibilityResult } from '@/lib/fheClient';
import { getTrialPublicInfo, getTrialCount } from '@/lib/web3Client';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';
import LoadingAnimation from '@/components/LoadingAnimation';

interface Trial {
  trialId: number;
  trialName: string;
  description: string;
  sponsor: string;
  isActive: boolean;
}

interface EligibilityCheckerProps {
  patientAddress?: string;
}

export default function EligibilityChecker({ patientAddress }: EligibilityCheckerProps) {
  // Wallet connection
  const { isConnected, address } = useWalletConnection();

  // State
  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedTrialId, setSelectedTrialId] = useState<number | null>(null);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<boolean | null>(null);

  /**
   * Load trials on mount
   */
  useEffect(() => {
    loadTrials();
  }, []);

  /**
   * Load all trials from blockchain
   */
  const loadTrials = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { provider } = await connectWallet();
      const trialCount = await getTrialCount(provider);

      const loadedTrials: Trial[] = [];

      for (let i = 1; i <= trialCount; i++) {
        const trial = await getTrialPublicInfo(provider, i);
        if (trial.isActive) {
          loadedTrials.push(trial);
        }
      }

      setTrials(loadedTrials);
      console.log('[EligibilityChecker] Loaded trials:', loadedTrials.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load trials');
      console.error('[EligibilityChecker] Error loading trials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle trial selection
   */
  const handleTrialSelect = async (trialId: number) => {
    setSelectedTrialId(trialId);
    const trial = trials.find((t) => t.trialId === trialId);
    setSelectedTrial(trial || null);
    setEligibilityResult(null);
    setError(null);
  };

  /**
   * Check eligibility
   *
   * This function:
   * 1. Calls smart contract to compute eligibility on encrypted data
   * 2. Retrieves the encrypted result
   * 3. Decrypts the result using EIP-712 signature
   *
   * SECURITY:
   * - Eligibility computation happens on encrypted data
   * - Result is encrypted and can only be decrypted by the patient
   * - Decryption requires EIP-712 signature (proof of ownership)
   */
  const handleCheckEligibility = async () => {
    if (!selectedTrialId || !patientAddress) {
      setError('Please select a trial and ensure you are registered');
      return;
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet from the header first');
      return;
    }

    // CRITICAL: Ensure the connected wallet matches the patient address
    // Only the user who encrypted the data can decrypt it
    if (address.toLowerCase() !== patientAddress.toLowerCase()) {
      setError(
        `Wallet mismatch! You must connect with the same wallet you registered with (${patientAddress.slice(
          0,
          6,
        )}...${patientAddress.slice(-4)}). ` +
          `Currently connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      );
      return;
    }

    setIsComputing(true);
    setIsDecrypting(false);
    setEligibilityResult(null);
    setError(null);

    try {
      console.log('[EligibilityChecker] Computing eligibility...');

      // Get wallet signer
      const { signer } = await connectWallet();

      // Step 1: Compute eligibility on smart contract
      // This performs encrypted comparison on the blockchain
      await computeEligibility(signer, selectedTrialId, patientAddress);

      console.log('[EligibilityChecker] Eligibility computed. Fetching encrypted result...');

      // Step 2: Get the encrypted result
      const encryptedResult = await getEligibilityResult(signer, selectedTrialId, patientAddress);

      if (!encryptedResult) {
        setError('First register your medical data then check eligibility');
        return;
      }

      console.log({ encryptedResult });

      console.log('[EligibilityChecker] Encrypted result retrieved. Decrypting...');

      // Step 3: Decrypt the result using EIP-712 signature
      // This proves ownership of the private key without revealing it
      setIsDecrypting(true);
      const isEligible = await decryptEligibilityResult(
        encryptedResult,
        process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS || '',
        signer,
      );

      console.log('[EligibilityChecker] Decryption complete. Eligible:', isEligible);

      setEligibilityResult(isEligible);
    } catch (err: any) {
      setError(err.message || 'Failed to check eligibility');
      console.error('[EligibilityChecker] Error:', err);
    } finally {
      setIsComputing(false);
      setIsDecrypting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Trial Eligibility</h2>
        <p className="text-sm text-gray-600">
          Find out which clinical trials match your profile.
          <br />
          <span className="text-xs text-gray-500">
            🔒 Eligibility is computed on encrypted data. Only you see the result.
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Wallet Mismatch Warning */}
      {isConnected &&
        address &&
        patientAddress &&
        address.toLowerCase() !== patientAddress.toLowerCase() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              ⚠️ Wallet Address Mismatch
            </h3>
            <p className="text-xs text-yellow-800 mb-2">
              You registered with a different wallet address. Only the wallet that registered can
              check eligibility.
            </p>
            <p className="text-xs text-yellow-700">
              <strong>Registered wallet:</strong> {patientAddress.slice(0, 6)}...
              {patientAddress.slice(-4)}
              <br />
              <strong>Current wallet:</strong> {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Please switch your wallet to the registered address to continue.
            </p>
          </div>
        )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Loading trials...</p>
        </div>
      )}

      {/* Trial Selection */}
      {isConnected && trials.length > 0 && (
        <div className="mb-6">
          <label htmlFor="trialSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Select a Clinical Trial *
          </label>
          <select
            id="trialSelect"
            value={selectedTrialId || ''}
            onChange={(e) => handleTrialSelect(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isComputing || isDecrypting}
          >
            <option value="">-- Select a Trial --</option>
            {trials.map((trial) => (
              <option key={trial.trialId} value={trial.trialId}>
                {trial.trialName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Trial Details */}
      {selectedTrial && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTrial.trialName}</h3>
          <p className="text-sm text-gray-600 mb-2">{selectedTrial.description}</p>
          <p className="text-xs text-gray-500">
            Sponsor: {selectedTrial.sponsor.slice(0, 6)}...{selectedTrial.sponsor.slice(-4)}
          </p>
        </div>
      )}

      {/* Check Eligibility Button */}
      {isConnected && selectedTrialId && (
        <button
          onClick={handleCheckEligibility}
          disabled={
            isComputing ||
            isDecrypting ||
            (patientAddress && address && address.toLowerCase() !== patientAddress.toLowerCase())
          }
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
        >
          {isComputing
            ? 'Computing Eligibility...'
            : isDecrypting
            ? 'Decrypting Result...'
            : 'Check Eligibility'}
        </button>
      )}

      {/* Eligibility Result */}
      {eligibilityResult !== null && (
        <div
          className={`mb-6 p-6 rounded-lg border-2 ${
            eligibilityResult ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="text-center">
            {eligibilityResult ? (
              <>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">You May Be Eligible!</h3>
                <p className="text-sm text-green-700">
                  Based on your encrypted medical data, you meet the eligibility criteria for this
                  trial.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Contact the trial sponsor for next steps.
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">😔</div>
                <h3 className="text-xl font-bold text-yellow-800 mb-2">Not Eligible</h3>
                <p className="text-sm text-yellow-700">
                  Based on your encrypted medical data, you do not meet the eligibility criteria for
                  this trial.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Please check other trials that may match your profile.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {(isComputing || isDecrypting) && (
        <div className="mb-6">
          <LoadingAnimation
            message={
              isComputing
                ? 'Computing eligibility on encrypted blockchain data'
                : 'Decrypting your result with private key'
            }
            type={isComputing ? 'blockchain' : 'encryption'}
            submessage={
              isComputing
                ? 'This happens on the blockchain without revealing your medical data'
                : 'Only you can decrypt this result'
            }
          />
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600 font-medium mb-2">🔒 How This Protects Your Privacy:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Your eligibility is computed entirely on encrypted medical data</li>
          <li>• The blockchain never sees your medical information in plaintext</li>
          <li>• The eligibility result is encrypted and only you can decrypt it</li>
          <li>• Decryption requires your EIP-712 signature (proof of ownership)</li>
          <li>• No one else knows if you are eligible or not</li>
        </ul>
      </div>
    </div>
  );
}
