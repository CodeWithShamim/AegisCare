/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FHEVM Client SDK - Production Implementation
 * @module lib/fheClient
 *
 * Complete FHEVM functionality using Zama's Relayer SDK
 * Based on Agora's implementation with FHEVM 0.9+ and RelayerSDK 0.3.0-8
 *
 * Features:
 * - FHE instance initialization with CDN
 * - Real encryption functions for patient/trial data
 * - EIP-712 user decryption
 * - Batch decryption support
 */

let fheInstance: any = null;

// ============================================
// TYPES
// ============================================

/**
 * Format an FHE handle as proper bytes32
 * Pads to 64 hex characters (32 bytes) with 0x prefix
 */
function formatHandle(handle: string | Uint8Array | any): string {
  let handleStr: string;

  // Convert handle to string based on type
  if (typeof handle === "string") {
    handleStr = handle;
  } else if (handle instanceof Uint8Array) {
    // Convert Uint8Array to hex string
    handleStr =
      "0x" +
      Array.from(handle)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
  } else if (handle && typeof handle.toString === "function") {
    // Try to convert to string
    handleStr = handle.toString();
  } else {
    // Fallback: try to convert to string
    handleStr = String(handle);
  }

  // Remove 0x prefix if present
  const cleanHex = handleStr.replace("0x", "");

  // Pad to 64 characters (32 bytes)
  const padded = cleanHex.padStart(64, "0");

  // Add 0x prefix
  return "0x" + padded;
}

export interface EncryptedValue {
  handle: string;
  proof: string;
}

export interface EncryptedPatientData {
  age: EncryptedValue;
  ageProof: string;
  gender: EncryptedValue;
  genderProof: string;
  bmiScore: EncryptedValue;
  bmiProof: string;
  hasMedicalCondition: EncryptedValue;
  conditionProof: string;
  conditionCode: EncryptedValue;
  codeProof: string;
}

export interface EncryptedTrialCriteria {
  minAge: EncryptedValue;
  maxAge: EncryptedValue;
  requiredGender: EncryptedValue;
  minBMIScore: EncryptedValue;
  maxBMIScore: EncryptedValue;
  hasSpecificCondition: EncryptedValue;
  conditionCode: EncryptedValue;
}

export interface PatientData {
  age: number;
  gender: number; // 0 = other, 1 = male, 2 = female
  bmiScore: number;
  hasMedicalCondition: boolean;
  conditionCode: number | string; // Accept both for flexibility
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
  conditionCode: number | string; // Accept both for flexibility
}

// ============================================
// FHE INSTANCE MANAGEMENT
// ============================================

/**
 * Initialize FHEVM instance for browser environment
 * Uses RelayerSDK CDN to avoid bundling issues
 * Based on Agora's implementation
 */
export async function initFHE(): Promise<boolean> {
  if (fheInstance) {
    console.log("✅ FHE instance already initialized");
    return true;
  }

  if (typeof window === "undefined") {
    throw new Error("FHEVM initialization requires browser environment");
  }

  if (!window.ethereum) {
    throw new Error("Ethereum provider not found. Please connect a wallet.");
  }

  try {
    // Check for RelayerSDK from CDN (support both naming conventions)
    let sdk = (window as any).RelayerSDK || (window as any).relayerSDK;

    if (!sdk) {
      throw new Error(
        "RelayerSDK not loaded. Please include the script tag:\n" +
          '<script src="https://cdn.zama.org/relayer-sdk-js/0.3.0-8/relayer-sdk-js.umd.cjs"></script>'
      );
    }

    const { initSDK, createInstance, SepoliaConfig } = sdk;

    // Check if user is on Sepolia testnet
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const sepoliaChainId = "0xaa36a7"; // 11155111 in hex

    if (chainId !== sepoliaChainId) {
      console.warn(
        "⚠️ Not connected to Sepolia testnet. Current chainId:",
        chainId
      );
      throw new Error(
        "Please switch your wallet to Sepolia testnet (Chain ID: 11155111)\n" +
          "FHE features are only supported on Sepolia testnet."
      );
    }

    console.log("✅ Connected to Sepolia testnet");

    // Initialize SDK with CDN
    await initSDK();
    console.log("✅ FHEVM SDK initialized with CDN");

    // Configure for Sepolia testnet (exactly as Agora does it)
    const config = { ...SepoliaConfig, network: window.ethereum };

    console.log("🔐 Creating FHE instance...");

    // Create FHE instance
    fheInstance = await createInstance(config);
    console.log("✅ FHEVM instance created successfully");

    return true;
  } catch (error: any) {
    console.error("❌ FHEVM initialization failed:", error);

    // Provide more helpful error messages
    if (error.message?.includes("getKmsSigners") || error.code === "BAD_DATA") {
      throw new Error(
        "Failed to connect to Zama KMS service. This is likely a network issue.\n\n" +
          "Possible solutions:\n" +
          "1. Make sure you are connected to Sepolia testnet\n" +
          "2. Try switching your wallet network and switching back\n" +
          "3. Check that your browser can access Zama's services\n" +
          "4. Try using a different browser\n\n" +
          "Technical error: " +
          error.message
      );
    }

    throw error;
  }
}

/**
 * Get the initialized FHE instance
 */
export function getFHEInstance(): any {
  if (!fheInstance) {
    throw new Error("FHE instance not initialized. Call initFHE() first.");
  }
  return fheInstance;
}

/**
 * Generate public key hash for patient registration
 * @returns Hash of the user's public key
 */
export function generatePublicKeyHash(): string {
  const fhe = getFHEInstance();
  const keypair = fhe.generateKeypair();

  // Convert public key to proper hex string format
  let pubKeyHex: string;

  if (typeof keypair.publicKey === "string") {
    // Already a string
    pubKeyHex = keypair.publicKey;
  } else if (keypair.publicKey instanceof Uint8Array) {
    // Convert Uint8Array to hex string
    const bytes: number[] = [];
    for (let i = 0; i < keypair.publicKey.length; i++) {
      bytes.push(keypair.publicKey[i]);
    }
    pubKeyHex =
      "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    // Try to convert to string and add 0x
    pubKeyHex = "0x" + String(keypair.publicKey);
  }

  // Ensure it has 0x prefix
  if (!pubKeyHex.startsWith("0x")) {
    pubKeyHex = "0x" + pubKeyHex.replace("0x", "");
  }

  // Take first 66 chars (0x + 64 hex chars = 32 bytes)
  const result = pubKeyHex.slice(0, 66);

  console.log("🔑 Public key hash generated:", result);

  return result;
}

/**
 * Alias for generatePublicKeyHash for backward compatibility
 * @deprecated Use generatePublicKeyHash() instead
 */
export function getPublicKeyHash(): string {
  // Generate the key hash properly
  const fhe = getFHEInstance();
  const keypair = fhe.generateKeypair();

  // Convert public key to proper hex string format
  let pubKeyHex: string;

  if (typeof keypair.publicKey === "string") {
    pubKeyHex = keypair.publicKey;
  } else if (keypair.publicKey instanceof Uint8Array) {
    const bytes: number[] = [];
    for (let i = 0; i < keypair.publicKey.length; i++) {
      bytes.push(keypair.publicKey[i]);
    }
    pubKeyHex =
      "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    pubKeyHex = "0x" + String(keypair.publicKey);
  }

  // Ensure it has 0x prefix
  if (!pubKeyHex.startsWith("0x")) {
    pubKeyHex = "0x" + pubKeyHex.replace("0x", "");
  }

  // Return first 66 chars (0x + 64 hex chars)
  return pubKeyHex.slice(0, 66);
}

// ============================================
// ENCRYPTION FUNCTIONS
// ============================================

/**
 * Encrypt patient data for registration
 * @param data - Patient health data
 * @returns Encrypted data with proofs
 */
export async function encryptPatientData(
  data: PatientData,
  contractAddress: string,
  userAddress: string
): Promise<EncryptedPatientData> {
  const fhe = getFHEInstance();

  try {
    console.log("🔒 Encrypting patient data...");

    // Convert conditionCode to number if it's a string
    const conditionCodeNum =
      typeof data.conditionCode === "string"
        ? parseInt(data.conditionCode, 10) || 0
        : data.conditionCode;

    // Create encrypted input buffer for patient data
    const input = fhe.createEncryptedInput(contractAddress, userAddress);

    console.log({ data });

    // Add each value using appropriate data type methods
    // Scale BMI by 10 for precision (e.g., 24.5 becomes 245)
    input.add8(BigInt(data.age)); // Age: 0-255 (euint32 to match contract)
    input.add8(BigInt(data.gender)); // Gender: 0-2
    input.add128(BigInt(Math.round(data.bmiScore * 10))); // BMI: scaled for precision
    input.add8(BigInt(data.hasMedicalCondition ? 1 : 0)); // Boolean as 0 or 1
    input.add32(BigInt(conditionCodeNum)); // Condition code: ICD-10

    console.log("🔐 Encrypting values...");
    // Encrypt all values and generate proof
    const ciphertexts = await input.encrypt();

    console.log("✅ Patient data encrypted successfully");
    console.log("🔍 Encrypted handles:", ciphertexts.handles);
    console.log("🔍 Proof:", ciphertexts.inputProof);

    // Debug: Log handle types
    console.log("🔍 Handle types:");
    ciphertexts.handles.forEach((handle: any, index: number) => {
      console.log(
        `  Handle ${index}: type=${typeof handle}, instance=${
          handle?.constructor?.name
        }, value=`,
        handle
      );
    });

    // Format handles as proper bytes32 (64 hex chars + 0x prefix)

    // Return encrypted data with handles and proof
    // The handles array contains: [age, gender, bmi, hasCondition, conditionCode]
    // Format handles as proper bytes32 (64 hex chars + 0x prefix)
    return ciphertexts;
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    throw new Error("Failed to encrypt patient data");
  }
}

/**
 * Encrypt trial criteria data
 * @param criteria - Trial eligibility criteria
 * @param contractAddress - AegisCare contract address
 * @param userAddress - User's wallet address
 * @returns Encrypted criteria with single proof
 */
export async function encryptTrialCriteria(
  criteria: TrialCriteriaData,
  contractAddress: string,
  userAddress: string
): Promise<any> {
  const fhe = getFHEInstance();

  try {
    console.log("🔒 Encrypting trial criteria...");

    // Convert conditionCode to number if it's a string
    const conditionCodeNum =
      typeof criteria.conditionCode === "string"
        ? parseInt(criteria.conditionCode, 10) || 0
        : criteria.conditionCode;

    // Create encrypted input buffer for trial criteria
    const input = fhe.createEncryptedInput(contractAddress, userAddress);

    console.log({ criteria });

    // Add each value using appropriate data type methods
    // Scale BMI by 10 for precision
    input.add32(BigInt(criteria.minAge)); // Min age: euint32 to match contract
    input.add32(BigInt(criteria.maxAge)); // Max age: euint32 to match contract
    input.add8(BigInt(criteria.requiredGender)); // Required gender: 0-2
    input.add128(BigInt(Math.round(criteria.minBMIScore * 10))); // Min BMI: scaled
    input.add128(BigInt(Math.round(criteria.maxBMIScore * 10))); // Max BMI: scaled
    input.add8(BigInt(criteria.hasSpecificCondition ? 1 : 0)); // Boolean as 0 or 1
    input.add32(BigInt(conditionCodeNum)); // Condition code: ICD-10

    console.log("🔐 Encrypting criteria values...");
    // Encrypt all values and generate proof
    const ciphertexts = await input.encrypt();

    console.log("✅ Trial criteria encrypted successfully");
    console.log("🔍 Encrypted handles:", ciphertexts.handles);
    console.log("🔍 Proof:", ciphertexts.inputProof);

    // Return ciphertexts directly (handles + inputProof)
    // The handles array contains: [minAge, maxAge, gender, minBMI, maxBMI, hasCondition, conditionCode]
    return ciphertexts;
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    throw new Error("Failed to encrypt trial criteria");
  }
}

// ============================================
// DECRYPTION FUNCTIONS
// ============================================

/**
 * Decrypt eligibility result using EIP-712 user decryption
 * @param encryptedHandle - Encrypted result handle from contract
 * @param contractAddress - AegisCare contract address
 * @param signer - Ethers signer from wallet
 * @returns Decrypted eligibility result (0 = not eligible, 1 = eligible)
 */
export async function decryptEligibilityResult(
  encryptedHandle: string,
  contractAddress: string,
  signer: any
): Promise<boolean> {
  const fhe = getFHEInstance();

  try {
    console.log("🔐 Decrypting eligibility result using EIP-712...");

    // Generate ephemeral keypair for this decryption
    const keypair = fhe.generateKeypair();

    // Prepare handle-contract pairs
    const handleContractPairs = [
      {
        handle: encryptedHandle,
        contractAddress: contractAddress,
      },
    ];

    // EIP-712 parameters
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10"; // Valid for 10 days
    const contractAddresses = [contractAddress];

    // Create EIP-712 typed data
    const eip712 = fhe.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    // Request user signature
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification:
          eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );

    // Perform user decryption
    const result = await fhe.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      await signer.getAddress(),
      startTimeStamp,
      durationDays
    );

    const decryptedValue = Number(result[encryptedHandle]);
    console.log("✅ Decryption successful:", decryptedValue);

    return decryptedValue === 1;
  } catch (error: any) {
    console.error("❌ Decryption failed:", error);

    // Handle specific errors
    if (
      error?.message?.includes("Failed to fetch") ||
      error?.message?.includes("NetworkError")
    ) {
      throw new Error(
        "Decryption service is temporarily unavailable. Please try again later."
      );
    }

    throw new Error("Failed to decrypt eligibility result. Please try again.");
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if FHE is initialized
 */
export function isFHEInitialized(): boolean {
  return fheInstance !== null;
}

/**
 * Reset FHE instance (for testing or re-initialization)
 */
export function resetFHEInstance(): void {
  fheInstance = null;
  console.log("🔄 FHE instance reset");
}

/**
 * Encode BMI for encryption (multiply by 10 for precision)
 */
export function encodeBMI(bmi: number): number {
  return Math.round(bmi * 10);
}

/**
 * Decode BMI after decryption (divide by 10)
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
    errors.push("Age must be between 0 and 150");
  }

  if (data.gender < 0 || data.gender > 2) {
    errors.push("Gender must be 0 (other), 1 (male), or 2 (female)");
  }

  if (data.bmiScore < 0 || data.bmiScore > 100) {
    errors.push("BMI score must be between 0 and 100");
  }

  // Handle string or number conditionCode
  const conditionCodeNum =
    typeof data.conditionCode === "string"
      ? parseInt(data.conditionCode, 10) || 0
      : data.conditionCode;

  if (conditionCodeNum < 0 || conditionCodeNum > 999999) {
    errors.push("Condition code must be between 0 and 999999");
  }

  return errors;
}

/**
 * Validate trial criteria before encryption
 */
export function validateTrialCriteria(data: TrialCriteriaData): string[] {
  const errors: string[] = [];

  if (!data.trialName || data.trialName.trim() === "") {
    errors.push("Trial name is required");
  }

  if (data.minAge < 0 || data.minAge > 150) {
    errors.push("Minimum age must be between 0 and 150");
  }

  if (data.maxAge < 0 || data.maxAge > 150) {
    errors.push("Maximum age must be between 0 and 150");
  }

  if (data.minAge >= data.maxAge) {
    errors.push("Minimum age must be less than maximum age");
  }

  if (data.minBMIScore >= data.maxBMIScore) {
    errors.push("Minimum BMI must be less than maximum BMI");
  }

  if (data.requiredGender < 0 || data.requiredGender > 2) {
    errors.push("Gender requirement must be 0 (all), 1 (male), or 2 (female)");
  }

  // Handle string or number conditionCode
  const conditionCodeNum =
    typeof data.conditionCode === "string"
      ? parseInt(data.conditionCode, 10) || 0
      : data.conditionCode;

  if (conditionCodeNum < 0 || conditionCodeNum > 999999) {
    errors.push("Condition code must be between 0 and 999999");
  }

  return errors;
}
