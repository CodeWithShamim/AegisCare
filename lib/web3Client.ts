/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

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

export type { BrowserProvider, JsonRpcSigner };
export type Signer = JsonRpcSigner;

export interface Trial {
  trialId: number;
  trialName: string;
  description: string;
  sponsor: string;
  isActive: boolean;
  createdAt: number;
  participantCount: number;
  trialPhase?: string;
  compensation?: string;
  location?: string;
  durationWeeks?: number;
  studyType?: string;
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
  AEGISCARE_ADDRESS: process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS || "",

  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337"), // Default to local development

  REQUIRED_METHODS: ["eth_requestAccounts", "personal_sign"],
};

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

export async function registerTrial(
  signer: JsonRpcSigner,
  trialName: string,
  description: string,
  encryptedData: any,
  trialPhase?: string,
  compensation?: string,
  location?: string,
  durationWeeks?: number,
  studyType?: string
): Promise<any> {
  try {
    const contract = getAegisCareContract("", signer);

    const tx = await contract.registerTrial(
      trialName,
      description,
      encryptedData.handles[0], // minAge
      encryptedData.handles[1], // maxAge
      encryptedData.handles[2], // requiredGender
      encryptedData.handles[3], // minBMIScore
      encryptedData.handles[4], // maxBMIScore
      encryptedData.handles[5], // hasSpecificCondition
      encryptedData.handles[6], // conditionCode
      encryptedData.inputProof,
      trialPhase || 'Not Specified',
      compensation || '0',
      location || 'Not Specified',
      durationWeeks || 0,
      studyType || 'Not Specified'
    );

    console.log("[Contract] Transaction submitted:", tx.hash);

    const receipt = await tx.wait();

    console.log("[Contract] Trial registered successfully");

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

    const info = await contract.getTrialInfo(trialId);

    return {
      trialId,
      trialName: info.trialName,
      description: info.description,
      sponsor: info.sponsor,
      isActive: info.isActive,
      createdAt: Number(info.createdAt),
      participantCount: Number(info.participantCount),
      trialPhase: info.trialPhase,
      compensation: info.compensation,
      location: info.location,
      durationWeeks: Number(info.durationWeeks),
      studyType: info.studyType,
    };
  } catch (error: any) {
    console.error("[Contract] Failed to get trial info:", error);
    throw new Error(`Failed to fetch trial: ${error.message}`);
  }
}

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

export async function registerPatient(
  signer: JsonRpcSigner,
  encrypted: any,
  publicKeyHash: string
): Promise<any> {
  try {
    console.log({ signer });
    const contract = getAegisCareContract("", signer);

    console.log("  Public key hash:", publicKeyHash);

    const tx = await contract.registerPatient(
      encrypted.handles[0],
      encrypted.handles[1],
      encrypted.handles[2],
      encrypted.handles[3],
      encrypted.handles[4],
      encrypted.inputProof,
      publicKeyHash
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
