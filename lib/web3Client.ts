/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Web3 Client Utilities
 * @module lib/web3Client
 *
 * Handles Ethereum wallet connection and smart contract interaction
 * Uses ethers.js v6 for blockchain operations
 */

import { ethers, Contract, BrowserProvider, JsonRpcSigner } from "ethers";
import AegisCareABI from "@/contracts/AegisCare.json";
import {
  registerPatient as registerPatientContract,
  registerTrial as registerTrialContract,
  getAegisCareContract as getContract,
  type PatientRegistrationParams,
  type TrialRegistrationParams,
} from "./contractInteractions";

// Extract ABI from the imported JSON
const ABI = AegisCareABI.abi;

// Re-export common types for convenience
export type { BrowserProvider, JsonRpcSigner };
export type Signer = JsonRpcSigner;

// ============================================
// TYPES
// ============================================

export interface Trial {
  trialId: number;
  trialName: string;
  description: string;
  sponsor: string;
  isActive: boolean;
  createdAt: number;
  participantCount: number;
}

export interface Patient {
  patientId: number;
  patientAddress: string;
  exists: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

export const WEB3_CONFIG = {
  // Contract address (set from environment after deployment)
  AEGISCARE_ADDRESS: process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS || "",

  // Network configuration
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337"), // Default to local development

  // Required methods for wallet connection
  REQUIRED_METHODS: ["eth_requestAccounts", "personal_sign"],
};

// ============================================
// WALLET CONNECTION
// ============================================

/**
 * Connect to user's Ethereum wallet
 *
 * @returns Provider and signer
 */
export async function connectWallet(): Promise<{
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  address: string;
}> {
  // Check if MetaMask or other wallet is available
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error(
      "No Ethereum wallet detected. Please install MetaMask or another Web3 wallet."
    );
  }

  const ethereum = (window as any).ethereum;

  try {
    // Request account access
    await ethereum.request({ method: "eth_requestAccounts" });

    // Create Web3 provider (ethers v6)
    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log("[Web3] Wallet connected:", address);

    return { provider, signer, address };
  } catch (error: any) {
    console.error("[Web3] Failed to connect wallet:", error);
    throw new Error(`Wallet connection failed: ${error.message}`);
  }
}

/**
 * Get the current provider and signer (assuming already connected)
 */
export async function getProviderAndSigner(): Promise<{
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  address: string;
}> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No Ethereum wallet detected.");
  }

  const ethereum = (window as any).ethereum;
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

/**
 * Get contract instance with signer (for transactions)
 */
export function getAegisCareContract(
  address: string,
  signer: JsonRpcSigner
): Contract {
  if (!WEB3_CONFIG.AEGISCARE_ADDRESS) {
    throw new Error(
      "AegisCare contract address not configured. Check environment variables."
    );
  }

  return new Contract(WEB3_CONFIG.AEGISCARE_ADDRESS, ABI, signer);
}

/**
 * Get contract instance with provider (for read-only operations)
 */
export function getAegisCareContractReadOnly(
  provider: BrowserProvider
): Contract {
  if (!WEB3_CONFIG.AEGISCARE_ADDRESS) {
    throw new Error(
      "AegisCare contract address not configured. Check environment variables."
    );
  }

  return new Contract(WEB3_CONFIG.AEGISCARE_ADDRESS, ABI, provider);
}

// ============================================
// CONTRACT INTERACTIONS - TRIALS
// ============================================

/**
 * Register a new clinical trial
 *
 * @param signer Wallet signer
 * @param trialName Trial name (public)
 * @param description Trial description (public)
 * @param encryptedCriteria Encrypted eligibility criteria
 * @returns Transaction receipt
 */
export async function registerTrial(
  signer: JsonRpcSigner,
  trialName: string,
  description: string,
  encryptedCriteria: {
    minAge: any;
    minAgeProof: any;
    maxAge: any;
    maxAgeProof: any;
    requiredGender: any;
    genderProof: any;
    minBMIScore: any;
    minBMIProof: any;
    maxBMIScore: any;
    maxBMIProof: any;
    hasSpecificCondition: any;
    conditionProof: any;
    conditionCode: any;
    codeProof: any;
  }
): Promise<any> {
  try {
    const contract = getAegisCareContract("", signer);

    console.log("[Contract] Registering trial:", trialName);
    console.log("[Contract] Encrypted data structure:", {
      trialName,
      description,
      minAgeHandle: encryptedCriteria.minAge.handle,
      minAgeProof: encryptedCriteria.minAgeProof,
      maxAgeHandle: encryptedCriteria.maxAge.handle,
      maxAgeProof: encryptedCriteria.maxAgeProof,
      genderHandle: encryptedCriteria.requiredGender.handle,
      genderProof: encryptedCriteria.genderProof,
      minBMIHandle: encryptedCriteria.minBMIScore.handle,
      minBMIProof: encryptedCriteria.minBMIProof,
      maxBMIHandle: encryptedCriteria.maxBMIScore.handle,
      maxBMIProof: encryptedCriteria.maxBMIProof,
      conditionHandle: encryptedCriteria.hasSpecificCondition.handle,
      conditionProof: encryptedCriteria.conditionProof,
      codeHandle: encryptedCriteria.conditionCode.handle,
      codeProof: encryptedCriteria.codeProof,
    });

    // Contract expects: trialName, description, then 7 pairs of (handle, proof)
    const tx = await contract.registerTrial(
      trialName,
      description,
      // Min age (handle + proof)
      encryptedCriteria.minAge.handle,
      encryptedCriteria.minAgeProof,
      // Max age (handle + proof)
      encryptedCriteria.maxAge.handle,
      encryptedCriteria.maxAgeProof,
      // Required gender (handle + proof)
      encryptedCriteria.requiredGender.handle,
      encryptedCriteria.genderProof,
      // Min BMI (handle + proof)
      encryptedCriteria.minBMIScore.handle,
      encryptedCriteria.minBMIProof,
      // Max BMI (handle + proof)
      encryptedCriteria.maxBMIScore.handle,
      encryptedCriteria.maxBMIProof,
      // Has specific condition (handle + proof)
      encryptedCriteria.hasSpecificCondition.handle,
      encryptedCriteria.conditionProof,
      // Condition code (handle + proof)
      encryptedCriteria.conditionCode.handle,
      encryptedCriteria.codeProof
    );

    console.log("[Contract] Transaction submitted:", tx.hash);

    const receipt = await tx.wait();

    console.log(
      "[Contract] Trial registered successfully. Trial ID:",
      receipt?.logs?.[0]
    );

    return receipt;
  } catch (error: any) {
    console.error("[Contract] Failed to register trial:", error);
    throw new Error(`Trial registration failed: ${error.message}`);
  }
}

/**
 * Get public information about a trial
 */
export async function getTrialPublicInfo(
  provider: BrowserProvider,
  trialId: number
): Promise<Trial> {
  try {
    const contract = getAegisCareContractReadOnly(provider);

    const info = await contract.getTrialPublicInfo(trialId);

    return {
      trialId,
      trialName: info.trialName,
      description: info.description,
      sponsor: info.sponsor,
      isActive: info.isActive,
      createdAt: Number(info.createdAt),
      participantCount: Number(info.participantCount),
    };
  } catch (error: any) {
    console.error("[Contract] Failed to get trial info:", error);
    throw new Error(`Failed to fetch trial: ${error.message}`);
  }
}

/**
 * Get all trials for a sponsor
 */
export async function getSponsorTrials(
  provider: BrowserProvider,
  sponsorAddress: string
): Promise<number[]> {
  try {
    const contract = getAegisCareContractReadOnly(provider);

    const trialIds = await contract.getSponsorTrials(sponsorAddress);

    return trialIds.map((id: any) => Number(id));
  } catch (error: any) {
    console.error("[Contract] Failed to get sponsor trials:", error);
    throw new Error(`Failed to fetch trials: ${error.message}`);
  }
}

/**
 * Get total number of trials
 */
export async function getTrialCount(
  provider: BrowserProvider
): Promise<number> {
  try {
    const contract = getAegisCareContractReadOnly(provider);

    const count = await contract.trialCount();

    return Number(count);
  } catch (error: any) {
    console.error("[Contract] Failed to get trial count:", error);
    return 0;
  }
}

// ============================================
// CONTRACT INTERACTIONS - PATIENTS
// ============================================

/**
 * Register a new patient with encrypted medical data
 *
 * @param signer Wallet signer
 * @param encryptedMedicalData Encrypted patient medical data
 * @param publicKeyHash Hash of patient's public key
 * @returns Transaction receipt
 */
export async function registerPatient(
  signer: JsonRpcSigner,
  encryptedMedicalData: {
    age: any;
    ageProof: any;
    gender: any;
    genderProof: any;
    bmiScore: any;
    bmiProof: any;
    hasMedicalCondition: any;
    conditionProof: any;
    conditionCode: any;
    codeProof: any;
  },
  publicKeyHash: string
): Promise<any> {
  try {
    const contract = getAegisCareContract("", signer);

    console.log("[Contract] Registering patient");
    console.log("[Contract] Contract address:", WEB3_CONFIG.AEGISCARE_ADDRESS);

    // Log all parameters being sent
    console.log("[Contract] Parameters to be sent:");
    console.log("  Age handle:", encryptedMedicalData.age.handle);
    console.log("  Age handle type:", typeof encryptedMedicalData.age.handle);
    console.log(
      "  Age handle length:",
      encryptedMedicalData.age.handle?.length
    );
    console.log("  Age proof length:", encryptedMedicalData.ageProof?.length);

    console.log("  Gender handle:", encryptedMedicalData.gender.handle);
    console.log(
      "  Gender handle length:",
      encryptedMedicalData.gender.handle?.length
    );

    console.log("  BMI handle:", encryptedMedicalData.bmiScore.handle);
    console.log(
      "  BMI handle length:",
      encryptedMedicalData.bmiScore.handle?.length
    );

    console.log(
      "  Condition handle:",
      encryptedMedicalData.hasMedicalCondition.handle
    );
    console.log(
      "  Condition handle length:",
      encryptedMedicalData.hasMedicalCondition.handle?.length
    );

    console.log("  Code handle:", encryptedMedicalData.conditionCode.handle);
    console.log(
      "  Code handle length:",
      encryptedMedicalData.conditionCode.handle?.length
    );

    console.log("  Public key hash:", publicKeyHash);
    console.log("  Public key hash length:", publicKeyHash?.length);

    // Verify all handles are properly formatted
    const allHandles = [
      encryptedMedicalData.age.handle,
      encryptedMedicalData.gender.handle,
      encryptedMedicalData.bmiScore.handle,
      encryptedMedicalData.hasMedicalCondition.handle,
      encryptedMedicalData.conditionCode.handle,
    ];

    const invalidHandles = allHandles.filter(
      (h) => !h || !h.startsWith("0x") || h.length !== 66
    );

    if (invalidHandles.length > 0) {
      console.error("[Contract] ❌ Invalid handles detected:", invalidHandles);
      throw new Error("Some handles are not properly formatted as bytes32");
    }

    console.log(
      "[Contract] ✅ All handles properly formatted (0x prefix, 66 chars)"
    );

    // Contract expects 5 pairs of (handle, proof) + publicKeyHash
    const tx = await contract.registerPatient(
      // Age (handle + proof)
      encryptedMedicalData.age.handle,
      encryptedMedicalData.ageProof,
      // Gender (handle + proof)
      encryptedMedicalData.gender.handle,
      encryptedMedicalData.genderProof,
      // BMI (handle + proof)
      encryptedMedicalData.bmiScore.handle,
      encryptedMedicalData.bmiProof,
      // Has medical condition (handle + proof)
      encryptedMedicalData.hasMedicalCondition.handle,
      encryptedMedicalData.conditionProof,
      // Condition code (handle + proof)
      encryptedMedicalData.conditionCode.handle,
      encryptedMedicalData.codeProof,
      // Public key hash
      publicKeyHash,
      { gasLimit: 10_000_000 }
    );

    console.log("[Contract] Transaction submitted:", tx.hash);

    const receipt = await tx.wait();

    console.log("[Contract] Patient registered successfully");

    return receipt;
  } catch (error: any) {
    console.error("[Contract] Failed to register patient:", error);
    throw new Error(`Patient registration failed: ${error.message}`);
  }
}

/**
 * Check if a patient exists
 */
export async function patientExists(
  provider: BrowserProvider,
  patientAddress: string
): Promise<boolean> {
  try {
    const contract = getAegisCareContractReadOnly(provider);

    const exists = await contract.isPatientRegistered(patientAddress);

    return exists;
  } catch (error: any) {
    console.error("[Contract] Failed to check patient existence:", error);
    return false;
  }
}

/**
 * Get total number of patients
 */
export async function getPatientCount(
  provider: BrowserProvider
): Promise<number> {
  try {
    const contract = getAegisCareContractReadOnly(provider);

    const count = await contract.patientCount();

    return Number(count);
  } catch (error: any) {
    console.error("[Contract] Failed to get patient count:", error);
    return 0;
  }
}

// ============================================
// CONTRACT INTERACTIONS - ELIGIBILITY
// ============================================

/**
 * Compute eligibility for a patient-trial pair
 *
 * This calls the smart contract which performs encrypted comparison.
 * The result remains encrypted and only the patient can decrypt it.
 *
 * @param signer Wallet signer
 * @param trialId Trial ID
 * @param patientAddress Patient wallet address
 * @returns Transaction receipt with result ID
 */
export async function computeEligibility(
  signer: JsonRpcSigner,
  trialId: number,
  patientAddress: string
): Promise<any> {
  try {
    const contract = getAegisCareContract("", signer);

    console.log(
      "[Contract] Computing eligibility for trial:",
      trialId,
      "patient:",
      patientAddress
    );

    const tx = await contract.computeEligibility(trialId, patientAddress);

    console.log("[Contract] Transaction submitted:", tx.hash);

    const receipt = await tx.wait();

    console.log("[Contract] Eligibility computed successfully");

    return receipt;
  } catch (error: any) {
    console.error("[Contract] Failed to compute eligibility:", error);
    throw new Error(`Eligibility computation failed: ${error.message}`);
  }
}

/**
 * Get encrypted eligibility result
 *
 * Returns the encrypted result handle that the patient can decrypt.
 *
 * @param signer Wallet signer (must be the patient)
 * @param trialId Trial ID
 * @param patientAddress Patient address (must match signer)
 * @returns Encrypted result handle
 */
export async function getEligibilityResult(
  signer: JsonRpcSigner,
  trialId: number,
  patientAddress: string
): Promise<any> {
  try {
    const contract = getAegisCareContract("", signer);

    console.log("[Contract] Fetching eligibility result");

    const encryptedResult = await contract.getEligibilityResult(
      trialId,
      patientAddress
    );

    console.log("[Contract] Eligibility result retrieved (encrypted)");

    return encryptedResult;
  } catch (error: any) {
    console.error("[Contract] Failed to get eligibility result:", error);
    throw new Error(`Failed to fetch eligibility result: ${error.message}`);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format address for display (shorten middle)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Listen for account changes
 */
export function setupAccountChangeListener(
  callback: (accounts: string[]) => void
): () => void {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return () => {};
  }

  const ethereum = (window as any).ethereum;

  const handleAccountsChanged = (accounts: string[]) => {
    console.log("[Web3] Accounts changed:", accounts);
    callback(accounts);
  };

  ethereum.on("accountsChanged", handleAccountsChanged);

  // Return cleanup function
  return () => {
    ethereum.removeListener("accountsChanged", handleAccountsChanged);
  };
}

/**
 * Listen for network changes
 */
export function setupNetworkChangeListener(
  callback: (chainId: string) => void
): () => void {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return () => {};
  }

  const ethereum = (window as any).ethereum;

  const handleChainChanged = (chainId: string) => {
    console.log("[Web3] Network changed:", chainId);
    callback(chainId);
  };

  ethereum.on("chainChanged", handleChainChanged);

  // Return cleanup function
  return () => {
    ethereum.removeListener("chainChanged", handleChainChanged);
  };
}

// ============================================
// TYPE DEFINITIONS
// ============================================

declare global {
  interface Window {
    ethereum?: any;
  }
}
