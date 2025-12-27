/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  encryptPatientData,
  getPublicKeyHash,
  validatePatientData,
  type PatientData,
} from '@/lib/fheClient';
import { registerPatient, connectWallet } from '@/lib/web3Client';
import { useFHE } from '@/components/providers/FHEProvider';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';
import LoadingAnimation from '@/components/LoadingAnimation';
import type { Signer } from 'ethers';

interface PatientRegistrationFormProps {
  onRegistrationSuccess?: (patientId: number) => void;
}

export default function PatientRegistrationForm({
  onRegistrationSuccess,
}: PatientRegistrationFormProps) {
  // FHE context
  const { isInitialized: fheInitialized, initFHE } = useFHE();

  // Wallet connection
  const { isConnected, address, isConnecting } = useWalletConnection();

  // Form state
  const [formData, setFormData] = useState<PatientData>({
    age: 0,
    gender: 0,
    bmiScore: 0,
    hasMedicalCondition: false,
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
  const handleInputChange = (field: keyof PatientData, value: any) => {
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
      // Check FHE initialization
      if (!fheInitialized) {
        setLoadingMessage('Initializing FHE encryption system');
        setLoadingStep('encryption');
        await initFHE();
        // Give it a moment to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log({ formData });

      // Validate form data
      const errors = validatePatientData(formData);
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

      console.log('[PatientForm] Encrypting medical data...');
      setLoadingMessage('Encrypting your medical data');
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

      // Encrypt medical data client-side
      const encryptedData = await encryptPatientData(formData, contractAddress, address);

      console.log('[PatientForm] Medical data encrypted successfully');
      console.log('[PatientForm] Submitting to smart contract...');

      setLoadingMessage('Preparing transaction');
      setLoadingStep('transaction');

      // Get public key hash for ACL
      const publicKeyHash = getPublicKeyHash();

      console.log({ publicKeyHash });

      // Submit encrypted data to smart contract
      setLoadingMessage('Confirming transaction on blockchain');
      setLoadingStep('blockchain');
      const receipt = await registerPatient(signer, encryptedData, publicKeyHash);

      console.log('[PatientForm] Patient registered successfully');

      // Extract patient ID from event logs
      const patientId = receipt.events?.find((e: any) => e.event === 'PatientRegistered')?.args
        ?.patientId;

      console.log({ patientId });

      setSuccess(true);

      // Notify parent component
      if (onRegistrationSuccess && patientId) {
        onRegistrationSuccess(patientId.toNumber());
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('[PatientForm] Registration error:', err);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Registration</h2>
            <p className="text-sm text-gray-600">
              Register with your medical data to find matching clinical trials.
              <br />
              <span className="text-xs text-gray-500">
                🔒 All medical data is encrypted before submission. Your privacy is protected.
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
                ✓ Registration successful! Your encrypted medical data has been submitted to the
                blockchain.
              </p>
              <p className="text-xs text-green-600 mt-2">
                You can now check your eligibility for clinical trials.
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
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                min="0"
                max="150"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your age"
                required
                disabled={!isConnected || isLoading}
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!isConnected || isLoading}
              >
                <option value="0">Prefer not to say</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
                <option value="3">Other</option>
              </select>
            </div>

            {/* BMI Score */}
            <div>
              <label htmlFor="bmi" className="block text-sm font-medium text-gray-700 mb-2">
                BMI Score *
              </label>
              <input
                type="number"
                id="bmi"
                min="0"
                max="100"
                step="0.1"
                value={formData.bmiScore > 0 ? formData.bmiScore / 10 : ''}
                onChange={(e) => {
                  const bmi = parseFloat(e.target.value);
                  handleInputChange('bmiScore', isNaN(bmi) ? 0 : Math.round(bmi * 10));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 24.5"
                required
                disabled={!isConnected || isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                BMI will be encrypted. Enter your exact BMI value (e.g., 24.5 for 24.5 kg/m²)
              </p>
            </div>

            {/* Medical Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have any medical condition? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasCondition"
                    checked={formData.hasMedicalCondition === true}
                    onChange={() => handleInputChange('hasMedicalCondition', true)}
                    className="mr-2"
                    disabled={!isConnected || isLoading}
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasCondition"
                    checked={formData.hasMedicalCondition === false}
                    onChange={() => handleInputChange('hasMedicalCondition', false)}
                    className="mr-2"
                    disabled={!isConnected || isLoading}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Condition Code (ICD-10) */}
            {formData.hasMedicalCondition && (
              <div>
                <label
                  htmlFor="conditionCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Condition Code (ICD-10)
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
                  Optional: Enter the ICD-10 code for your condition (e.g., E11, I10, J45)
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isConnected || isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Register with Encrypted Data'}
            </button>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-2">🔒 Privacy Protection:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• All medical data is encrypted in your browser before submission</li>
                <li>• Encrypted data is processed on the blockchain without decryption</li>
                <li>• Only you can decrypt your eligibility results</li>
                <li>• No plaintext medical data is stored on-chain or in logs</li>
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
