/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  encryptTrialCriteria,
  validateTrialCriteria,
  encodeBMI,
  type TrialCriteriaData,
} from '@/lib/fheClient';
import { registerTrial, connectWallet } from '@/lib/web3Client';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';
import LoadingAnimation from '@/components/LoadingAnimation';

interface TrialRegistrationFormProps {
  onRegistrationSuccess?: (trialId: number) => void;
}

export default function TrialRegistrationForm({
  onRegistrationSuccess,
}: TrialRegistrationFormProps) {
  // Wallet connection
  const { isConnected, address, isConnecting } = useWalletConnection();

  // Form state
  const [formData, setFormData] = useState<TrialCriteriaData>({
    trialName: '',
    description: '',
    minAge: 18,
    maxAge: 65,
    requiredGender: 0,
    minBMIScore: 185, // 18.5 * 10
    maxBMIScore: 400, // 40.0 * 10
    hasSpecificCondition: false,
    conditionCode: '',
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    'encryption' | 'transaction' | 'blockchain' | null
  >(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof TrialCriteriaData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setValidationErrors([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setValidationErrors([]);
    setIsLoading(true);

    try {
      // Validate form data
      const errors = validateTrialCriteria(formData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsLoading(false);
        setLoadingStep(null);
        return;
      }

      // Ensure wallet is connected
      if (!isConnected || !address) {
        setError('Please connect your wallet from the header first');
        setIsLoading(false);
        setLoadingStep(null);
        return;
      }

      console.log('[TrialForm] Encrypting eligibility criteria...');
      setLoadingMessage('Encrypting eligibility criteria');
      setLoadingStep('encryption');

      // Get wallet signer and address
      const { signer, address: walletAddress } = await connectWallet();

      // Get contract address from environment
      const contractAddress = process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS;
      if (!contractAddress) {
        throw new Error(
          'Contract address not configured. Please check NEXT_PUBLIC_AEGISCARE_ADDRESS in .env',
        );
      }

      // Encrypt eligibility criteria client-side
      const encryptedCriteria = await encryptTrialCriteria(
        formData,
        contractAddress,
        walletAddress,
      );

      console.log('[TrialForm] Eligibility criteria encrypted successfully');
      console.log('[TrialForm] Submitting to smart contract...');

      setLoadingMessage('Preparing transaction');
      setLoadingStep('transaction');

      // Submit encrypted criteria to smart contract
      setLoadingMessage('Confirming transaction on blockchain');
      setLoadingStep('blockchain');
      const receipt = await registerTrial(
        signer,
        formData.trialName,
        formData.description,
        encryptedCriteria,
      );

      console.log('[TrialForm] Trial registered successfully');

      // Extract trial ID from event logs
      const trialId = receipt.events?.find((e: any) => e.event === 'TrialRegistered')?.args
        ?.trialId;

      setSuccess(true);

      // Notify parent component
      if (onRegistrationSuccess && trialId) {
        onRegistrationSuccess(trialId.toNumber());
      }

      // Reset form
      setTimeout(() => {
        setFormData({
          trialName: '',
          description: '',
          minAge: 18,
          maxAge: 65,
          requiredGender: 0,
          minBMIScore: 185,
          maxBMIScore: 400,
          hasSpecificCondition: false,
          conditionCode: '',
        });
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('[TrialForm] Registration error:', err);
    } finally {
      setIsLoading(false);
      setLoadingStep(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {!isLoading ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Clinical Trial</h2>
            <p className="text-sm text-gray-600">
              Create a new clinical trial with encrypted eligibility criteria.
              <br />
              <span className="text-xs text-gray-500">
                🔒 All eligibility criteria are encrypted before submission. Privacy guaranteed.
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

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✓ Trial registered successfully! Your encrypted eligibility criteria has been
                submitted.
              </p>
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trial Name */}
            <div>
              <label htmlFor="trialName" className="block text-sm font-medium text-gray-700 mb-2">
                Trial Name *
              </label>
              <input
                type="text"
                id="trialName"
                value={formData.trialName}
                onChange={(e) => handleInputChange('trialName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Diabetes Treatment Study 2025"
                required
                disabled={!isConnected || isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">This name will be public (not encrypted)</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the clinical trial"
                required
                disabled={!isConnected || isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This description will be public (not encrypted)
              </p>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minAge" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Age *
                </label>
                <input
                  type="number"
                  id="minAge"
                  min="0"
                  max="150"
                  value={formData.minAge}
                  onChange={(e) => handleInputChange('minAge', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!isConnected || isLoading}
                />
              </div>
              <div>
                <label htmlFor="maxAge" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Age *
                </label>
                <input
                  type="number"
                  id="maxAge"
                  min="0"
                  max="150"
                  value={formData.maxAge}
                  onChange={(e) => handleInputChange('maxAge', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!isConnected || isLoading}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Age criteria will be encrypted</p>

            {/* Gender Requirement */}
            <div>
              <label
                htmlFor="requiredGender"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Gender Requirement *
              </label>
              <select
                id="requiredGender"
                value={formData.requiredGender}
                onChange={(e) => handleInputChange('requiredGender', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!isConnected || isLoading}
              >
                <option value="0">All Genders</option>
                <option value="1">Male Only</option>
                <option value="2">Female Only</option>
                <option value="3">Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Gender requirement will be encrypted</p>
            </div>

            {/* BMI Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minBMI" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum BMI *
                </label>
                <input
                  type="number"
                  id="minBMI"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.minBMIScore / 10}
                  onChange={(e) => {
                    const bmi = parseFloat(e.target.value);
                    handleInputChange('minBMIScore', isNaN(bmi) ? 0 : Math.round(bmi * 10));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!isConnected || isLoading}
                />
              </div>
              <div>
                <label htmlFor="maxBMI" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum BMI *
                </label>
                <input
                  type="number"
                  id="maxBMI"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.maxBMIScore / 10}
                  onChange={(e) => {
                    const bmi = parseFloat(e.target.value);
                    handleInputChange('maxBMIScore', isNaN(bmi) ? 0 : Math.round(bmi * 10));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!isConnected || isLoading}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">BMI criteria will be encrypted</p>

            {/* Medical Condition Requirement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requires Specific Medical Condition? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="requiresCondition"
                    checked={formData.hasSpecificCondition === true}
                    onChange={() => handleInputChange('hasSpecificCondition', true)}
                    className="mr-2"
                    disabled={!isConnected || isLoading}
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="requiresCondition"
                    checked={formData.hasSpecificCondition === false}
                    onChange={() => handleInputChange('hasSpecificCondition', false)}
                    className="mr-2"
                    disabled={!isConnected || isLoading}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Condition Code */}
            {formData.hasSpecificCondition && (
              <div>
                <label
                  htmlFor="conditionCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Required Condition Code (ICD-10)
                </label>
                <input
                  type="text"
                  id="conditionCode"
                  value={formData.conditionCode || ''}
                  onChange={(e) => handleInputChange('conditionCode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., E11 (Type 2 diabetes)"
                  disabled={!isConnected || isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the ICD-10 code for the required condition (will be encrypted)
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isConnected || isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Register Trial with Encrypted Criteria'}
            </button>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-2">🔒 Privacy Protection:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• All eligibility criteria are encrypted in your browser before submission</li>
                <li>• Encrypted criteria are processed on the blockchain without decryption</li>
                <li>• Patient eligibility is computed entirely on encrypted data</li>
                <li>• No plaintext eligibility criteria are stored on-chain or in logs</li>
                <li>• Trial name and description are public (for patient discovery)</li>
              </ul>
            </div>
          </form>
        </>
      ) : (
        <LoadingAnimation
          message={loadingMessage || 'Processing'}
          type={loadingStep || 'default'}
        />
      )}
    </div>
  );
}
