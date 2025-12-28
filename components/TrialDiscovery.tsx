'use client';

import { useState } from 'react';
import TrialSearch from './TrialSearch';
import { computeEligibility, getEligibilityResult, connectWallet } from '@/lib/web3Client';
import { decryptEligibilityResult } from '@/lib/fheClient';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';
import LoadingAnimation from './LoadingAnimation';
import ErrorDisplay from './ErrorDisplay';

interface TrialDiscoveryProps {
  patientAddress: string;
}

export default function TrialDiscovery({ patientAddress }: TrialDiscoveryProps) {
  const { isConnected, address } = useWalletConnection();
  const [selectedTrialId, setSelectedTrialId] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    trialId: number;
    trialName: string;
    isEligible: boolean;
  } | null>(null);

  const handleCheckEligibility = async () => {
    if (!selectedTrialId || !patientAddress) {
      setError('Please select a trial');
      return;
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet');
      return;
    }

    if (address.toLowerCase() !== patientAddress.toLowerCase()) {
      setError('Wallet mismatch! Please connect with the registered wallet.');
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const { signer } = await connectWallet();
      const contractAddress = process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS || '';

      // Compute eligibility
      await computeEligibility(signer, selectedTrialId, patientAddress);

      // Get encrypted result
      const encryptedResult = await getEligibilityResult(signer, selectedTrialId, patientAddress);

      if (!encryptedResult) {
        throw new Error('No result found');
      }

      // Decrypt
      setIsDecrypting(true);
      const isEligible = await decryptEligibilityResult(encryptedResult, contractAddress, signer);

      setResult({
        trialId: selectedTrialId,
        trialName: `Trial ${selectedTrialId}`,
        isEligible,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to check eligibility');
    } finally {
      setIsChecking(false);
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Trial Search */}
      <TrialSearch
        onTrialSelect={setSelectedTrialId}
        selectedTrialId={selectedTrialId || undefined}
        compactMode={false}
      />

      {/* Selected Trial Actions */}
      {selectedTrialId && (
        <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Selected Trial #{selectedTrialId}
              </h3>
              <p className="text-sm text-gray-600">
                Check your eligibility for this trial with private FHE computation
              </p>
            </div>
            <button
              onClick={handleCheckEligibility}
              disabled={isChecking || isDecrypting}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? 'Computing...' : isDecrypting ? 'Decrypting...' : 'Check Eligibility'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4">
              <ErrorDisplay
                error={error}
                onDismiss={() => setError(null)}
                showTechnicalDetails={true}
              />
            </div>
          )}

          {/* Processing Indicator */}
          {(isChecking || isDecrypting) && (
            <div className="mt-4">
              <LoadingAnimation
                message={
                  isChecking
                    ? 'Computing eligibility on encrypted data'
                    : 'Decrypting your private result'
                }
                type={isChecking ? 'blockchain' : 'encryption'}
              />
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div
              className={`mt-4 p-6 rounded-lg border-2 ${
                result.isEligible
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="text-center">
                {result.isEligible ? (
                  <>
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">You May Be Eligible!</h3>
                    <p className="text-sm text-green-700">
                      Based on your encrypted medical data, you meet the criteria for Trial #
                      {result.trialId}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">😔</div>
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">Not Eligible</h3>
                    <p className="text-sm text-yellow-700">
                      Based on your encrypted medical data, you don't meet the criteria for this
                      trial
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
