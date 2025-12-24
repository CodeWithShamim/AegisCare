/**
 * FHE Client Configuration and Utilities
 * @module lib/fheClient
 *
 * This module handles the Zama FHE Relayer SDK integration for:
 * 1. Creating FHE instances
 * 2. Encrypting user input before submission to smart contracts
 * 3. Decrypting results using EIP-712 signatures (private user decryption)
 *
 * SECURITY GUARANTEES:
 * - All medical data is encrypted client-side before leaving the browser
 * - Encryption uses the user's public key from the FHE network
 * - Decryption requires EIP-712 signature (proves ownership)
 * - Relayer cannot decrypt user data without signature
 * - No plaintext medical data ever transmitted or stored
 */

import { createInstance, FhevmInstance } from '@zama-fhe/relayer-sdk';

// ============================================
// CONFIGURATION
// ============================================

/**
 * FHE Network configuration
 * In production, these would be environment variables
 */
export const FHE_CONFIG = {
  // Zama FHE Devnet network (for testing)
  // TODO: Update to mainnet URLs for production
  networkUrl: process.env.NEXT_PUBLIC_FHE_NETWORK_URL || 'https://devnet.zama.ai/',
  gatewayUrl: process.env.NEXT_PUBLIC_FHE_GATEWAY_URL || 'https://gateway.devnet.zama.ai/',
  blockchainUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || 'http://localhost:8545',

  // Contract addresses (to be set after deployment)
  aegisCareAddress: process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS || '',
};

// ============================================
// TYPES
// ============================================

/**
 * Encrypted medical input for smart contract
 * @remarks These are handles to encrypted data, not the actual values
 */
export interface EncryptedMedicalInput {
  age: any; // einput type from FHE SDK
  gender: any;
  bmiScore: any;
  hasMedicalCondition: any;
  conditionCode: any;
}

/**
 * Encrypted trial criteria for smart contract
 */
export interface EncryptedTrialCriteria {
  minAge: any;
  maxAge: any;
  requiredGender: any;
  minBMIScore: any;
  maxBMIScore: any;
  hasSpecificCondition: any;
  conditionCode: any;
}

/**
 * Patient registration data
 */
export interface PatientData {
  age: number;
  gender: number; // 0=unspecified, 1=male, 2=female, 3=other
  bmiScore: number;
  hasMedicalCondition: boolean;
  conditionCode?: string; // ICD-10 code
}

/**
 * Trial criteria data
 */
export interface TrialCriteriaData {
  trialName: string;
  description: string;
  minAge: number;
  maxAge: number;
  requiredGender: number; // 0=all, 1=male, 2=female, 3=other
  minBMIScore: number;
  maxBMIScore: number;
  hasSpecificCondition: boolean;
  conditionCode?: string;
}

// ============================================
// FHE INSTANCE MANAGEMENT
// ============================================

/**
 * Global FHE instance (singleton pattern)
 */
let fheInstance: FhevmInstance | null = null;

/**
 * Initialize or retrieve the FHE instance
 *
 * This creates a connection to the Zama FHE network and generates
 * cryptographic keys for the user. The public key is registered with
 * the FHE network to enable encrypted computations.
 *
 * SECURITY:
 * - Private keys never leave the browser
 * - Only public key is shared with FHE network
 * - Each user has unique key pair
 *
 * @returns Initialized FhevmInstance
 *
 * @example
 * ```typescript
 * const fhe = await initFHE();
 * // Now ready to encrypt data
 * ```
 */
export async function initFHE(): Promise<FhevmInstance> {
  if (fheInstance) {
    return fheInstance;
  }

  try {
    console.log('[FHE] Initializing FHE instance...');

    // Create FHE instance connected to Zama network
    fheInstance = await createInstance({
      networkUrl: FHE_CONFIG.networkUrl,
      gatewayUrl: FHE_CONFIG.gatewayUrl,
      blockchainUrl: FHE_CONFIG.blockchainUrl,
    });

    console.log('[FHE] FHE instance initialized successfully');
    console.log('[FHE] Public key:', fheInstance.getPublicKey());

    return fheInstance;
  } catch (error) {
    console.error('[FHE] Failed to initialize FHE instance:', error);
    throw new Error('FHE initialization failed. Please check your network connection.');
  }
}

/**
 * Get the existing FHE instance (must be initialized first)
 */
export function getFHEInstance(): FhevmInstance {
  if (!fheInstance) {
    throw new Error('FHE instance not initialized. Call initFHE() first.');
  }
  return fheInstance;
}

/**
 * Generate hash of user's public key for ACL
 *
 * This hash is stored in the smart contract to verify that
 * the user is authorized to decrypt their own results.
 *
 * @returns Keccak256 hash of the public key
 */
export function getPublicKeyHash(): string {
  const instance = getFHEInstance();
  const publicKey = instance.getPublicKey();

  // In production, use ethers/viem for proper hashing
  // For now, simple string hash
  return publicKey; // TODO: Replace with proper keccak256 hash
}

// ============================================
// ENCRYPTION FUNCTIONS
// ============================================

/**
 * Encrypt patient medical data for submission to smart contract
 *
 * This function takes plaintext medical data and encrypts it using
 * the FHE instance. The encrypted data can only be decrypted by:
 * 1. The user who owns the private key
 * 2. Smart contracts (for computation during execution)
 *
 * SECURITY:
 * - Encryption happens entirely in the browser
 * - Plaintext data is never transmitted over the network
 * - Encrypted data (einput) is sent to smart contract
 *
 * @param patientData Plaintext medical data from user input
 * @returns Encrypted input handles for smart contract
 *
 * @example
 * ```typescript
 * const patientData = {
 *   age: 35,
 *   gender: 2, // female
 *   bmiScore: 245, // 24.5 * 10 (to avoid decimals)
 *   hasMedicalCondition: true,
 *   conditionCode: 'E11' // Type 2 diabetes
 * };
 * const encrypted = await encryptPatientData(patientData);
 * // Now call smart contract with encrypted values
 * ```
 */
export async function encryptPatientData(
  patientData: PatientData
): Promise<EncryptedMedicalInput> {
  const instance = await initFHE();

  console.log('[FHE] Encrypting patient data...');

  try {
    // Encrypt each medical field
    // Note: We multiply BMI by 10 to avoid floating point issues
    // Smart contract should divide by 10 when comparing

    const age = instance.createEncryptedInput(patientData.age);
    const gender = instance.createEncryptedInput(patientData.gender);
    const bmiScore = instance.createEncryptedInput(patientData.bmiScore);
    const hasMedicalCondition = instance.createEncryptedInput(
      patientData.hasMedicalCondition ? 1 : 0
    );

    // For condition code, we convert string to number if provided
    // In production, you might use a more sophisticated encoding
    let conditionCode;
    if (patientData.conditionCode) {
      // Simple hash of ICD-10 code (in production, use proper encoding)
      const codeNum = patientData.conditionCode
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      conditionCode = instance.createEncryptedInput(codeNum);
    } else {
      conditionCode = instance.createEncryptedInput(0);
    }

    console.log('[FHE] Patient data encrypted successfully');

    return {
      age,
      gender,
      bmiScore,
      hasMedicalCondition,
      conditionCode,
    };
  } catch (error) {
    console.error('[FHE] Failed to encrypt patient data:', error);
    throw new Error('Encryption failed. Please try again.');
  }
}

/**
 * Encrypt trial eligibility criteria for submission to smart contract
 *
 * @param criteriaData Plaintext trial criteria
 * @returns Encrypted input handles for smart contract
 *
 * @example
 * ```typescript
 * const criteria = {
 *   trialName: 'Diabetes Treatment Study',
 *   description: 'Testing new treatment for Type 2 diabetes',
 *   minAge: 18,
 *   maxAge: 75,
 *   requiredGender: 0, // all genders
 *   minBMIScore: 185, // 18.5
 *   maxBMIScore: 400, // 40.0
 *   hasSpecificCondition: true,
 *   conditionCode: 'E11'
 * };
 * const encrypted = await encryptTrialCriteria(criteria);
 * ```
 */
export async function encryptTrialCriteria(
  criteriaData: TrialCriteriaData
): Promise<EncryptedTrialCriteria> {
  const instance = await initFHE();

  console.log('[FHE] Encrypting trial criteria...');

  try {
    const minAge = instance.createEncryptedInput(criteriaData.minAge);
    const maxAge = instance.createEncryptedInput(criteriaData.maxAge);
    const requiredGender = instance.createEncryptedInput(criteriaData.requiredGender);
    const minBMIScore = instance.createEncryptedInput(criteriaData.minBMIScore);
    const maxBMIScore = instance.createEncryptedInput(criteriaData.maxBMIScore);
    const hasSpecificCondition = instance.createEncryptedInput(
      criteriaData.hasSpecificCondition ? 1 : 0
    );

    let conditionCode;
    if (criteriaData.conditionCode) {
      const codeNum = criteriaData.conditionCode
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      conditionCode = instance.createEncryptedInput(codeNum);
    } else {
      conditionCode = instance.createEncryptedInput(0);
    }

    console.log('[FHE] Trial criteria encrypted successfully');

    return {
      minAge,
      maxAge,
      requiredGender,
      minBMIScore,
      maxBMIScore,
      hasSpecificCondition,
      conditionCode,
    };
  } catch (error) {
    console.error('[FHE] Failed to encrypt trial criteria:', error);
    throw new Error('Encryption failed. Please try again.');
  }
}

// ============================================
// DECRYPTION FUNCTIONS
// ============================================

/**
 * Decrypt eligibility result using EIP-712 signature
 *
 * This function performs private user decryption, which requires:
 * 1. An EIP-712 signature proving ownership of the private key
 * 2. The signature is sent to the FHE gateway
 * 3. Gateway validates signature and returns decrypted result
 *
 * SECURITY:
 * - Only the user who created the encrypted data can decrypt
 * - Signature proves ownership without revealing private key
 * - Gateway cannot decrypt without valid signature
 * - Relayer/social recovery systems cannot access user data
 *
 * @param encryptedHandle The encrypted result handle from smart contract
 * @param contractAddress The smart contract address
 * @param signer Ethers.js signer for signing EIP-712 message
 * @returns Decrypted boolean (true = eligible, false = not eligible)
 *
 * @example
 * ```typescript
 * // After calling computeEligibility() on smart contract
 * const encryptedResult = await contract.getEligibilityResult(trialId, patientAddress);
 * const isEligible = await decryptEligibilityResult(encryptedResult, contractAddress, signer);
 * console.log('Eligible:', isEligible);
 * ```
 */
export async function decryptEligibilityResult(
  encryptedHandle: any,
  contractAddress: string,
  signer: any
): Promise<boolean> {
  const instance = getFHEInstance();

  console.log('[FHE] Decrypting eligibility result...');

  try {
    // The instance.userDecrypt method handles:
    // 1. Creating EIP-712 signature request
    // 2. Requesting user to sign in wallet
    // 3. Sending signature to FHE gateway
    // 4. Gateway validates and returns decrypted result

    const decryptedValue = await instance.userDecrypt(
      encryptedHandle,
      contractAddress,
      signer
    );

    // Convert to boolean (should be 0 or 1)
    const isEligible = decryptedValue === 1n;

    console.log('[FHE] Decryption successful. Eligible:', isEligible);

    return isEligible;
  } catch (error) {
    console.error('[FHE] Failed to decrypt eligibility result:', error);
    throw new Error('Decryption failed. Please ensure you are the owner of this data.');
  }
}

/**
 * Check if FHE instance is initialized
 */
export function isFHEInitialized(): boolean {
  return fheInstance !== null;
}

/**
 * Reset FHE instance (for testing or re-initialization)
 */
export function resetFHEInstance(): void {
  fheInstance = null;
  console.log('[FHE] Instance reset');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert BMI to integer (multiply by 10 to avoid floating point)
 */
export function encodeBMI(bmi: number): number {
  return Math.round(bmi * 10);
}

/**
 * Convert encoded BMI back to decimal
 */
export function decodeBMI(encodedBMI: number): number {
  return encodedBMI / 10;
}

/**
 * Validate patient data before encryption
 */
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

/**
 * Validate trial criteria before encryption
 */
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
