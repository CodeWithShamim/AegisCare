/**
 * GenLayer contract configuration for AegisCareAdvisor.
 *
 * This Intelligent Contract is ADDITIVE to AegisCare.sol (Zama fhEVM).
 * It handles AI features only — it NEVER receives raw or encrypted patient data.
 *
 * ⚠️ DEPLOYMENT REQUIRED: fill ADVISOR_ADDRESS after running:
 *     genlayer deploy --contract contracts/aegiscare_advisor.py
 *   then copy the returned address here and into NEXT_PUBLIC_ADVISOR_ADDRESS.
 *
 * Method names below mirror the deployed schema exactly. If you change the
 * contract, regenerate the schema and update these names:
 *     genlayer schema <address>
 */

export const GENLAYER_CHAIN_ID =
  process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "studionet";

/** GenLayer Studio block explorer base — where deployed contracts are inspected. */
export const GENLAYER_EXPLORER_URL =
  process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ||
  "https://explorer-studio.genlayer.com";

/** Deep link to an address on the GenLayer Studio explorer. */
export function genlayerExplorerAddressUrl(address: string): string {
  return `${GENLAYER_EXPLORER_URL}/address/${address}`;
}

/** @deprecated use GENLAYER_EXPLORER_URL */
export const GENLAYER_STUDIO_URL = GENLAYER_EXPLORER_URL;
/** @deprecated use genlayerExplorerAddressUrl */
export function genlayerStudioContractUrl(address: string): string {
  return genlayerExplorerAddressUrl(address);
}

/** Deployed AegisCareAdvisor Intelligent Contract address. */
export const ADVISOR_ADDRESS =
  process.env.NEXT_PUBLIC_ADVISOR_ADDRESS || "";

/** Read methods (view) — verified against contracts/aegiscare_advisor.py. */
export const ADVISOR_READ_METHODS = {
  getExplanation: "get_explanation",
  getRecommendations: "get_recommendations",
  getValidation: "get_validation",
  getEligibilityCheck: "get_eligibility_check",
} as const;

/** Write methods (consensus transactions) — verified against the contract. */
export const ADVISOR_WRITE_METHODS = {
  generateExplanation: "generate_explanation",
  recommendTrials: "recommend_trials",
  validateTrial: "validate_trial",
  checkEligibility: "check_eligibility",
} as const;

/**
 * Guard: every call path checks this so a misconfigured deploy fails loudly
 * instead of sending a transaction to address(0).
 */
export function assertAdvisorConfigured(): `0x${string}` {
  if (!ADVISOR_ADDRESS || ADVISOR_ADDRESS.length < 10) {
    throw new Error(
      "AegisCareAdvisor address not configured. Set NEXT_PUBLIC_ADVISOR_ADDRESS after running `genlayer deploy --contract contracts/aegiscare_advisor.py`."
    );
  }
  // Brand as a hex address for the genlayer-js / viem APIs. The length+prefix
  // guard above is our runtime validation; the cast is the type-level bridge.
  return (
    ADVISOR_ADDRESS.startsWith("0x") ? ADVISOR_ADDRESS : `0x${ADVISOR_ADDRESS}`
  ) as `0x${string}`;
}
