/**
 * GenLayer client for AegisCareAdvisor.
 *
 * All method names come from the deployed schema (genlayer schema <address>),
 * mirrored in config/genLayerContracts.ts. GenVM dispatch uses snake_case names
 * with kwargs — never guess; these match contracts/aegiscare_advisor.py.
 *
 * Privacy contract enforced here: write helpers only accept PUBLIC trial data,
 * coarse profile buckets, and hashes. They never accept raw/encrypted patient
 * values. This mirrors the contract's own privacy boundary.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient, createAccount, chains } from "genlayer-js";
import {
  ADVISOR_ADDRESS,
  ADVISOR_READ_METHODS,
  ADVISOR_WRITE_METHODS,
  assertAdvisorConfigured,
} from "@/config/genLayerContracts";

// ---------------------------------------------------------------------------
// Types mirror the contract storage dataclasses.
// ---------------------------------------------------------------------------

export interface Recommendation {
  trial_ids: number[];
  reasoning: string;
}

export interface ValidationResult {
  valid: boolean;
  reason: string;
  /** JSON array string, e.g. '["narrow age range"]'. Parse with parseSuggestions. */
  suggestions: string;
}

export type EligibilityVerdict = "ELIGIBLE" | "NOT_ELIGIBLE" | "UNCLEAR" | "";

export interface EligibilityCheck {
  trial_registry_url: string;
  anonymized_summary: string;
  result: EligibilityVerdict;
  reasoning: string;
  /** JSON array string. Parse with parseCriteria. */
  matched_criteria: string;
  /** JSON array string. Parse with parseCriteria. */
  failed_criteria: string;
}

export type TxState =
  | "idle"
  | "submitting"
  | "pending"
  | "finalized"
  | "failed";

export interface TxStatus {
  state: TxState;
  hash?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Client singleton. StudioNet is gasless, so no balance gating needed.
// ---------------------------------------------------------------------------

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (_client) return _client;

  // Signing strategy for StudioNet writes:
  //  1. A configured GenLayer private key (createAccount) signs GenVM txs
  //     directly — works headless and without MetaMask, which can't sign
  //     GenVM calldata. Use for local/testnet dev.
  //  2. Otherwise fall back to an injected EVM provider (window.ethereum).
  // Reads work with neither.
  const rawKey = process.env.NEXT_PUBLIC_GENLAYER_PRIVATE_KEY?.trim();
  const account = rawKey
    ? createAccount(
        (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`
      )
    : undefined;
  const injected =
    typeof window !== "undefined" ? (window as any).ethereum : undefined;

  _client = createClient({
    chain: chains.studionet,
    endpoint: process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT,
    ...(account ? { account } : injected ? { provider: injected } : {}),
  });
  return _client;
}

/**
 * Fetch and cache the deployed schema. Call once on app load to fail fast if
 * the address is wrong or the contract isn't deployed.
 */
export async function loadAdvisorSchema(): Promise<any> {
  const client = getClient();
  const address = assertAdvisorConfigured();
  return client.getContractSchema(address);
}

// ---------------------------------------------------------------------------
// Feature 1 — Eligibility explainer
// ---------------------------------------------------------------------------

/**
 * Write: ask the contract to generate an eligibility explanation.
 *
 * PRIVACY: receives only the PUBLIC trial criteria + a precomputed is_eligible
 * bool (computed off-chain under FHE by AegisCare.sol). No raw patient values.
 */
export async function generateExplanation(params: {
  trialId: number;
  patientAddress: string;
  isEligible: boolean;
  trialName: string;
  minAge: number;
  maxAge: number;
  conditionCode: string;
  minBmi: string; // string per contract spec (avoids float storage)
  maxBmi: string;
}): Promise<string> {
  const client = getClient();
  const address = assertAdvisorConfigured();
  const tx = await client.writeContract({
    address,
    functionName: ADVISOR_WRITE_METHODS.generateExplanation,
    kwargs: {
      trial_id: params.trialId,
      patient_address: params.patientAddress,
      is_eligible: params.isEligible,
      trial_name: params.trialName,
      min_age: params.minAge,
      max_age: params.maxAge,
      condition_code: params.conditionCode,
      min_bmi: params.minBmi,
      max_bmi: params.maxBmi,
    },
    // StudioNet is gasless, but the SDK requires an explicit value field.
    value: BigInt(0),
  });
  // writeContract returns the tx hash; wait for consensus finality.
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  if (isFailedReceipt(receipt)) {
    throw new Error(`Explanation generation failed: ${receiptStatus(receipt)}`);
  }
  return tx as string;
}

/** Read: retrieve a stored explanation for a trial + patient. */
export async function getExplanation(
  trialId: number,
  patientAddress: string
): Promise<string> {
  const client = getClient();
  const address = assertAdvisorConfigured();
  const raw = await client.readContract({
    address,
    functionName: ADVISOR_READ_METHODS.getExplanation,
    kwargs: { trial_id: trialId, patient_address: patientAddress },
  });
  return typeof raw === "string" ? raw : raw == null ? "" : String(raw);
}

// ---------------------------------------------------------------------------
// Feature 2 — Trial recommender
// ---------------------------------------------------------------------------

/**
 * Write: get trial recommendations for a profile bucket.
 *
 * PRIVACY: receives only coarse buckets (age_bucket like "30-40", a condition
 * category) and a profile_hash — never exact patient values or addresses.
 */
export async function recommendTrials(params: {
  profileHash: string;
  ageBucket: string;
  conditionCategory: string;
  trialIds: number[];
  trialSummaries: string[];
}): Promise<string> {
  if (params.trialIds.length === 0) {
    throw new Error("EXPECTED: no trials to recommend from");
  }
  if (params.trialIds.length !== params.trialSummaries.length) {
    throw new Error("EXPECTED: trial_ids and trial_summaries length mismatch");
  }
  const client = getClient();
  const address = assertAdvisorConfigured();
  const tx = await client.writeContract({
    address,
    functionName: ADVISOR_WRITE_METHODS.recommendTrials,
    kwargs: {
      profile_hash: params.profileHash,
      age_bucket: params.ageBucket,
      condition_category: params.conditionCategory,
      trial_ids: params.trialIds,
      trial_summaries: params.trialSummaries,
    },
    value: BigInt(0),
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  if (isFailedReceipt(receipt)) {
    throw new Error(`Recommendation failed: ${receiptStatus(receipt)}`);
  }
  return tx as string;
}

/** Read: retrieve stored recommendations for a profile hash. */
export async function getRecommendations(
  profileHash: string
): Promise<Recommendation> {
  const client = getClient();
  const address = assertAdvisorConfigured();
  const raw = await client.readContract({
    address,
    functionName: ADVISOR_READ_METHODS.getRecommendations,
    kwargs: { profile_hash: profileHash },
  });
  return normalizeRecommendation(raw);
}

// ---------------------------------------------------------------------------
// Feature 3 — Trial validator
// ---------------------------------------------------------------------------

/**
 * Write: validate a trial registration (coherence + real ICD-10 code).
 *
 * PRIVACY: only public trial metadata is validated — no patient data.
 */
export async function validateTrial(params: {
  trialId: number;
  trialName: string;
  description: string;
  minAge: number;
  maxAge: number;
  conditionCode: string;
}): Promise<string> {
  const client = getClient();
  const address = assertAdvisorConfigured();
  const tx = await client.writeContract({
    address,
    functionName: ADVISOR_WRITE_METHODS.validateTrial,
    kwargs: {
      trial_id: params.trialId,
      trial_name: params.trialName,
      description: params.description,
      min_age: params.minAge,
      max_age: params.maxAge,
      condition_code: params.conditionCode,
    },
    value: BigInt(0),
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  if (isFailedReceipt(receipt)) {
    throw new Error(`Validation failed: ${receiptStatus(receipt)}`);
  }
  return tx as string;
}

/** Read: retrieve stored validation for a trial. */
export async function getValidation(
  trialId: number
): Promise<ValidationResult> {
  const client = getClient();
  const address = assertAdvisorConfigured();
  const raw = await client.readContract({
    address,
    functionName: ADVISOR_READ_METHODS.getValidation,
    kwargs: { trial_id: trialId },
  });
  return normalizeValidation(raw);
}

// ---------------------------------------------------------------------------
// Feature 4 — Clinical trial eligibility checker
// ---------------------------------------------------------------------------

// Mirror of the contract's PII guard so the UI rejects unsafe input before it
// ever reaches consensus (cheaper failure, clearer message). Keep in sync with
// _PII_PATTERNS in contracts/aegiscare_advisor.py.
const PII_PATTERNS: RegExp[] = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // email
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone
  /\b\d{9,}\b/, // long ID runs (SSN/MRN-like)
];

/**
 * Write: assess eligibility for a trial described at a public registry URL,
 * against an anonymized free-text patient summary.
 *
 * PRIVACY: the summary must already be de-identified. This helper enforces the
 * same length + PII rules as the contract so unsafe input fails fast, client
 * side, instead of being submitted to (and rejected by) consensus.
 */
export async function checkEligibility(params: {
  checkId: string;
  trialRegistryUrl: string;
  anonymizedSummary: string;
}): Promise<string> {
  const checkId = params.checkId.trim();
  const url = params.trialRegistryUrl.trim();
  const summary = params.anonymizedSummary;

  if (!checkId) throw new Error("EXPECTED: check_id is required");
  if (!url) throw new Error("EXPECTED: trial_registry_url is required");
  if (summary.trim().length < 20) throw new Error("EXPECTED: summary too short");
  if (summary.length > 2000) throw new Error("EXPECTED: summary too long");
  if (PII_PATTERNS.some((re) => re.test(summary))) {
    throw new Error(
      "EXPECTED: summary contains PII — remove email, phone, or ID numbers"
    );
  }

  const client = getClient();
  const address = assertAdvisorConfigured();
  const tx = await client.writeContract({
    address,
    functionName: ADVISOR_WRITE_METHODS.checkEligibility,
    kwargs: {
      check_id: checkId,
      trial_registry_url: url,
      anonymized_summary: summary,
    },
    value: BigInt(0),
  });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  if (isFailedReceipt(receipt)) {
    throw new Error(`Eligibility check failed: ${receiptStatus(receipt)}`);
  }
  return tx as string;
}

/** Read: retrieve a stored eligibility check by its id. */
export async function getEligibilityCheck(
  checkId: string
): Promise<EligibilityCheck> {
  const client = getClient();
  const address = assertAdvisorConfigured();
  const raw = await client.readContract({
    address,
    functionName: ADVISOR_READ_METHODS.getEligibilityCheck,
    kwargs: { check_id: checkId },
  });
  return normalizeEligibilityCheck(raw);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function parseSuggestions(suggestions: string): string[] {
  if (!suggestions) return [];
  try {
    const parsed = JSON.parse(suggestions);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Parse a stored matched_criteria / failed_criteria JSON array string. */
export const parseCriteria = parseSuggestions;

/**
 * Subscribe to a transaction's lifecycle: submitted → pending → finalized/failed.
 * Returns an unsubscribe function. The onState callback drives UI badges.
 *
 * GenLayer finality is not instant (Optimistic Democracy), so "finalized" is a
 * distinct, later state than "submitted".
 */
export function trackTransaction(
  txHash: `0x${string}`,
  onState: (status: TxStatus) => void
): () => void {
  const client = getClient();
  onState({ state: "submitting", hash: txHash });
  let cancelled = false;

  (async () => {
    onState({ state: "pending", hash: txHash });
    try {
      // The SDK brands hashes as a 66-char opaque type; our 0x string is
      // validated at the wallet layer, so bridge it with a cast.
      const receipt = await client.waitForTransactionReceipt({
        hash: txHash as any,
      });
      if (cancelled) return;
      if (isFailedReceipt(receipt)) {
        onState({
          state: "failed",
          hash: txHash,
          error: receiptStatus(receipt),
        });
      } else {
        onState({ state: "finalized", hash: txHash });
      }
    } catch (err: any) {
      if (!cancelled) {
        onState({ state: "failed", hash: txHash, error: err?.message });
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}

// Receipt inspection — GenLayer receipts carry a status field whose exact shape
// varies by SDK version; inspect defensively rather than assuming one field name.
function isFailedReceipt(receipt: any): boolean {
  if (!receipt) return false;
  // Status field name varies across SDK versions; read defensively.
  const status = receipt.status ?? receipt.tx_status ?? receipt.consensus;
  if (status === "UNDETERMINED" || status === "REJECTED") return true;
  if (typeof status === "number" && status < 0) return true;
  return false;
}

function receiptStatus(receipt: any): string {
  return String(receipt?.status ?? receipt?.tx_status ?? "unknown");
}

function normalizeRecommendation(raw: any): Recommendation {
  if (!raw) return { trial_ids: [], reasoning: "" };
  const ids = Array.isArray(raw.trial_ids) ? raw.trial_ids : [];
  return {
    trial_ids: ids.map((id: any) => Number(id)),
    reasoning: typeof raw.reasoning === "string" ? raw.reasoning : "",
  };
}

function normalizeValidation(raw: any): ValidationResult {
  if (!raw) return { valid: false, reason: "", suggestions: "[]" };
  return {
    valid: Boolean(raw.valid),
    reason: typeof raw.reason === "string" ? raw.reason : "",
    suggestions:
      typeof raw.suggestions === "string" ? raw.suggestions : "[]",
  };
}

function normalizeEligibilityCheck(raw: any): EligibilityCheck {
  const empty: EligibilityCheck = {
    trial_registry_url: "",
    anonymized_summary: "",
    result: "",
    reasoning: "",
    matched_criteria: "[]",
    failed_criteria: "[]",
  };
  if (!raw) return empty;
  const result = raw.result;
  return {
    trial_registry_url:
      typeof raw.trial_registry_url === "string" ? raw.trial_registry_url : "",
    anonymized_summary:
      typeof raw.anonymized_summary === "string" ? raw.anonymized_summary : "",
    result:
      result === "ELIGIBLE" || result === "NOT_ELIGIBLE" || result === "UNCLEAR"
        ? result
        : "",
    reasoning: typeof raw.reasoning === "string" ? raw.reasoning : "",
    matched_criteria:
      typeof raw.matched_criteria === "string" ? raw.matched_criteria : "[]",
    failed_criteria:
      typeof raw.failed_criteria === "string" ? raw.failed_criteria : "[]",
  };
}
