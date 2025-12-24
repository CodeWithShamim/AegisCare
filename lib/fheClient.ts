/**
 * Mock FHE Client for Testing
 * @module lib/fheClient
 *
 * This is a mock implementation for demonstration purposes.
 * In production, this would use the real @zama-fhe/relayer-sdk.
 */

// ============================================
// TYPES
// ============================================

export interface EncryptedMedicalInput {
  age: any;
  gender: any;
  bmiScore: any;
  hasMedicalCondition: any;
  conditionCode: any;
}

export interface EncryptedTrialCriteria {
  minAge: any;
  maxAge: any;
  requiredGender: any;
  minBMIScore: any;
  maxBMIScore: any;
  hasSpecificCondition: any;
  conditionCode: any;
}

export interface PatientData {
  age: number;
  gender: number;
  bmiScore: number;
  hasMedicalCondition: boolean;
  conditionCode?: string;
}

export interface TrialCriteriaData {
  trialName: string;
  description: string;
  minAge: number;
  maxAge: number;
  requiredGender: number;
  minBMIScore: number;
  maxBMIScore: number;
  hasSpecificCondition: boolean;
  conditionCode?: string;
}

// ============================================
// CONFIGURATION
// ============================================

export const FHE_CONFIG = {
  networkUrl: process.env.NEXT_PUBLIC_FHE_NETWORK_URL || 'http://localhost:5010',
  gatewayUrl: process.env.NEXT_PUBLIC_FHE_GATEWAY_URL || 'http://localhost:8100',
  blockchainUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || 'http://localhost:5010',
};

// ============================================
// MOCK FHE INSTANCE (For Testing)
// ============================================

let fheInstanceInitialized = false;

export async function initFHE(): Promise<boolean> {
  if (fheInstanceInitialized) {
    return true;
  }

  console.log('[FHE] Mock FHE instance initialized for testing');
  fheInstanceInitialized = true;
  return true;
}

export function getFHEInstance(): any {
  if (!fheInstanceInitialized) {
    throw new Error('FHE instance not initialized. Call initFHE() first.');
  }
  return { initialized: true };
}

export function getPublicKeyHash(): string {
  // Mock implementation - returns a hash
  return ethers.utils.formatBytes32String('mock_public_key_hash');
}

// ============================================
// MOCK ENCRYPTION FUNCTIONS
// ============================================

export async function encryptPatientData(
  patientData: PatientData
): Promise<EncryptedMedicalInput> {
  await initFHE();

  console.log('[FHE] Encrypting patient data (mock)');

  // Return mock encrypted inputs
  // In production, these would be real einput objects from the SDK
  return {
    age: `encrypted_${patientData.age}`,
    gender: `encrypted_${patientData.gender}`,
    bmiScore: `encrypted_${patientData.bmiScore}`,
    hasMedicalCondition: `encrypted_${patientData.hasMedicalCondition ? 1 : 0}`,
    conditionCode: `encrypted_${patientData.conditionCode || 0}`,
  };
}

export async function encryptTrialCriteria(
  criteriaData: TrialCriteriaData
): Promise<EncryptedTrialCriteria> {
  await initFHE();

  console.log('[FHE] Encrypting trial criteria (mock)');

  return {
    minAge: `encrypted_${criteriaData.minAge}`,
    maxAge: `encrypted_${criteriaData.maxAge}`,
    requiredGender: `encrypted_${criteriaData.requiredGender}`,
    minBMIScore: `encrypted_${criteriaData.minBMIScore}`,
    maxBMIScore: `encrypted_${criteriaData.maxBMIScore}`,
    hasSpecificCondition: `encrypted_${criteriaData.hasSpecificCondition ? 1 : 0}`,
    conditionCode: `encrypted_${criteriaData.conditionCode || 0}`,
  };
}

export async function decryptEligibilityResult(
  encryptedHandle: any,
  contractAddress: string,
  signer: any
): Promise<boolean> {
  await initFHE();

  console.log('[FHE] Decrypting eligibility result (mock)');

  // Mock decryption - in production this would use EIP-712 signature
  // For now, return a random result for demonstration
  return Math.random() > 0.5;
}

export function isFHEInitialized(): boolean {
  return fheInstanceInitialized;
}

export function resetFHEInstance(): void {
  fheInstanceInitialized = false;
  console.log('[FHE] Mock instance reset');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function encodeBMI(bmi: number): number {
  return Math.round(bmi * 10);
}

export function decodeBMI(encodedBMI: number): number {
  return encodedBMI / 10;
}

export function validatePatientData(data: PatientData): string[] {
  const errors: string[] = [];

  if (data.age < 0 || data.age > 150) {
    errors.push('Age must be between 0 and 150');
  }

  if (data.gender < 0 || data.gender > 3) {
    errors.push('Gender must be 0 (unspecified), 1 (male), 2 (female), or 3 (other)');
  }

  if (data.bmiScore < 0 || data.bmiScore > 1000) {
    errors.push('BMI score must be between 0 and 100.0');
  }

  return errors;
}

export function validateTrialCriteria(data: TrialCriteriaData): string[] {
  const errors: string[] = [];

  if (!data.trialName || data.trialName.trim() === '') {
    errors.push('Trial name is required');
  }

  if (data.minAge < 0 || data.minAge > 150) {
    errors.push('Minimum age must be between 0 and 150');
  }

  if (data.maxAge < 0 || data.maxAge > 150) {
    errors.push('Maximum age must be between 0 and 150');
  }

  if (data.minAge >= data.maxAge) {
    errors.push('Minimum age must be less than maximum age');
  }

  if (data.minBMIScore >= data.maxBMIScore) {
    errors.push('Minimum BMI must be less than maximum BMI');
  }

  if (data.requiredGender < 0 || data.requiredGender > 3) {
    errors.push('Gender requirement must be 0 (all), 1 (male), 2 (female), or 3 (other)');
  }

  return errors;
}

// Add ethers import for the mock
import { ethers } from 'ethers';
