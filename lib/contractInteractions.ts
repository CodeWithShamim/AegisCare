/**
 * AegisCare Contract Interaction Layer
 *
 * Provides type-safe, validated contract interactions
 * with proper error handling and logging
 */

import { ethers, Contract, JsonRpcSigner } from "ethers";
import type {
  EncryptedPatientData,
  EncryptedTrialCriteria,
} from "./fheClient";
import { logger } from "./logger";

// ============================================
// TYPES
// ============================================

export interface PatientRegistrationParams {
  encryptedData: EncryptedPatientData;
  publicKeyHash: string;
}

export interface TrialRegistrationParams {
  trialName: string;
  description: string;
  encryptedData: any;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate encrypted patient data before contract interaction
 */
function validatePatientEncryptedData(
  data: EncryptedPatientData
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check all required fields exist
  if (!data.age?.handle) errors.push("Age handle is missing");
  if (!data.ageProof) errors.push("Age proof is missing");
  if (!data.gender?.handle) errors.push("Gender handle is missing");
  if (!data.genderProof) errors.push("Gender proof is missing");
  if (!data.bmiScore?.handle) errors.push("BMI handle is missing");
  if (!data.bmiProof) errors.push("BMI proof is missing");
  if (!data.hasMedicalCondition?.handle) errors.push("Condition handle is missing");
  if (!data.conditionProof) errors.push("Condition proof is missing");
  if (!data.conditionCode?.handle) errors.push("Code handle is missing");
  if (!data.codeProof) errors.push("Code proof is missing");

  // Validate handle format (bytes32)
  const handles = [
    data.age?.handle,
    data.gender?.handle,
    data.bmiScore?.handle,
    data.hasMedicalCondition?.handle,
    data.conditionCode?.handle,
  ];

  handles.forEach((handle, index) => {
    if (!handle) return;
    if (!handle.startsWith("0x")) {
      errors.push(`Handle ${index} must start with 0x`);
    }
    if (handle.length !== 66) {
      errors.push(`Handle ${index} must be 66 characters (0x + 64 hex), got ${handle.length}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate public key hash format
 */
function validatePublicKeyHash(publicKeyHash: string): { valid: boolean; error?: string } {
  if (!publicKeyHash) {
    return { valid: false, error: "Public key hash is required" };
  }
  if (!publicKeyHash.startsWith("0x")) {
    return { valid: false, error: "Public key hash must start with 0x" };
  }
  if (publicKeyHash.length !== 66) {
    return { valid: false, error: `Public key hash must be 66 characters, got ${publicKeyHash.length}` };
  }
  return { valid: true };
}

// ============================================
// CONTRACT INTERACTIONS
// ============================================

/**
 * Register a patient with the AegisCare contract
 *
 * This function provides:
 * - Type-safe parameter handling
 * - Pre-flight validation
 * - Clear error messages
 * - Detailed logging
 * - Gas estimation
 *
 * @param contract ethers Contract instance
 * @param params Registration parameters
 * @returns Transaction receipt
 */
export async function registerPatient(
  contract: Contract,
  params: PatientRegistrationParams
): Promise<ethers.TransactionReceipt> {
  const { encryptedData, publicKeyHash } = params;

  logger.log("🏥 [Contract] Preparing patient registration...");

  // 1. Validate encrypted data
  const validation = validatePatientEncryptedData(encryptedData);
  if (!validation.valid) {
    logger.error("❌ [Contract] Validation failed:", validation.errors);
    throw new Error(`Invalid encrypted data:\n${validation.errors.join("\n")}`);
  }
  logger.log("✅ [Contract] Encrypted data validated");

  // 2. Validate public key hash
  const pkhValidation = validatePublicKeyHash(publicKeyHash);
  if (!pkhValidation.valid) {
    logger.error("❌ [Contract] Public key hash validation failed:", pkhValidation.error);
    throw new Error(pkhValidation.error!);
  }
  logger.log("✅ [Contract] Public key hash validated");

  // 3. Prepare parameters in correct order
  const contractParams = [
    // Age (handle + proof)
    encryptedData.age.handle,
    encryptedData.ageProof,
    // Gender (handle + proof)
    encryptedData.gender.handle,
    encryptedData.genderProof,
    // BMI (handle + proof)
    encryptedData.bmiScore.handle,
    encryptedData.bmiProof,
    // Has medical condition (handle + proof)
    encryptedData.hasMedicalCondition.handle,
    encryptedData.conditionProof,
    // Condition code (handle + proof)
    encryptedData.conditionCode.handle,
    encryptedData.codeProof,
    // Public key hash
    publicKeyHash,
  ];

  logger.log("📋 [Contract] Parameters prepared:");
  logger.log("  - Age handle:", encryptedData.age.handle.slice(0, 10) + "...");
  logger.log("  - Gender handle:", encryptedData.gender.handle.slice(0, 10) + "...");
  logger.log("  - BMI handle:", encryptedData.bmiScore.handle.slice(0, 10) + "...");
  logger.log("  - Condition handle:", encryptedData.hasMedicalCondition.handle.slice(0, 10) + "...");
  logger.log("  - Code handle:", encryptedData.conditionCode.handle.slice(0, 10) + "...");
  logger.log("  - Public key hash:", publicKeyHash.slice(0, 10) + "...");

  try {
    // 4. Estimate gas (pre-flight check)
    logger.log("⛽ [Contract] Estimating gas...");
    const gasEstimate = await contract.registerPatient.estimateGas(...contractParams);
    logger.log(`✅ [Contract] Gas estimate: ${gasEstimate.toString()}`);

    // 5. Send transaction with gas buffer
    logger.log("📤 [Contract] Submitting transaction...");
    const gasLimit = gasEstimate * BigInt(2); // 2x buffer for safety
    const tx = await contract.registerPatient(...contractParams, {
      gasLimit,
    });

    logger.log(`📝 [Contract] Transaction submitted: ${tx.hash}`);

    // 6. Wait for confirmation
    logger.log("⏳ [Contract] Waiting for confirmation...");
    const receipt = await tx.wait();

    logger.log("✅ [Contract] Patient registered successfully!");
    logger.log(`  - Block: ${receipt?.blockNumber}`);
    logger.log(`  - Gas used: ${receipt?.gasUsed.toString()}`);

    return receipt!;

  } catch (error: any) {
    logger.error("❌ [Contract] Registration failed:");

    // Detailed error handling
    if (error.code === "CALL_EXCEPTION") {
      logger.error("  - Contract reverted during execution");

      if (error.reason) {
        logger.error("  - Reason:", error.reason);
      }

      if (error.data) {
        logger.error("  - Data:", error.data);
      }
    }

    if (error.code === "INVALID_ARGUMENT") {
      logger.error("  - Invalid argument:", error.message);
    }

    if (error.code === "NETWORK_ERROR") {
      logger.error("  - Network error:", error.message);
    }

    // Re-throw with context
    throw new Error(`Patient registration failed: ${error.message}`);
  }
}

/**
 * Register a trial with the AegisCare contract
 *
 * @param contract ethers Contract instance
 * @param params Trial registration parameters
 * @returns Transaction receipt
 */
export async function registerTrial(
  contract: Contract,
  params: TrialRegistrationParams
): Promise<ethers.TransactionReceipt> {
  const { trialName, description, encryptedData } = params;

  logger.log("🏥 [Contract] Preparing trial registration...");
  logger.log(`  - Trial name: ${trialName}`);
  logger.log(`  - Description: ${description}`);

  // Validate required fields
  if (!encryptedData.handles || encryptedData.handles.length !== 7) {
    throw new Error("Invalid encrypted data: expected 7 handles");
  }

  if (!encryptedData.inputProof) {
    throw new Error("Missing required field: inputProof");
  }

  logger.log("✅ [Contract] Trial criteria validated");

  // Prepare parameters in correct order
  const contractParams = [
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
  ];

  logger.log("📋 [Contract] Parameters prepared");

  try {
    // Estimate gas
    logger.log("⛽ [Contract] Estimating gas...");
    const gasEstimate = await contract.registerTrial.estimateGas(...contractParams);
    logger.log(`✅ [Contract] Gas estimate: ${gasEstimate.toString()}`);

    // Send transaction
    logger.log("📤 [Contract] Submitting transaction...");
    const gasLimit = gasEstimate * BigInt(2);
    const tx = await contract.registerTrial(...contractParams, {
      gasLimit,
    });

    logger.log(`📝 [Contract] Transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    logger.log("⏳ [Contract] Waiting for confirmation...");
    const receipt = await tx.wait();

    logger.log("✅ [Contract] Trial registered successfully!");
    logger.log(`  - Block: ${receipt?.blockNumber}`);
    logger.log(`  - Gas used: ${receipt?.gasUsed.toString()}`);

    return receipt!;

  } catch (error: any) {
    logger.error("❌ [Contract] Trial registration failed:", error.message);
    throw new Error(`Trial registration failed: ${error.message}`);
  }
}

/**
 * Get contract instance with signer
 */
export function getAegisCareContract(
  address: string,
  signer: JsonRpcSigner,
  abi: any
): Contract {
  if (!address) {
    throw new Error("Contract address is required");
  }
  if (!signer) {
    throw new Error("Signer is required");
  }

  return new Contract(address, abi, signer);
}
