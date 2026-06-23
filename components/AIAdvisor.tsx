'use client';

/**
 * AIAdvisor — GenLayer Intelligent Contract UI for AegisCare.
 *
 * Surfaces the four AegisCareAdvisor features:
 *  1. Eligibility explainer       (Feature 1)
 *  2. Trial recommender           (Feature 2)
 *  3. Trial validator             (Feature 3)
 *  4. Clinical trial eligibility  (Feature 4)
 *
 * Privacy: this component only ever sends PUBLIC trial criteria, coarse profile
 * buckets, hashes, precomputed eligibility booleans, and anonymized summaries to
 * GenLayer. Raw or encrypted patient values never leave the FHE layer
 * (AegisCare.sol).
 */
import { useState } from "react";
import {
  generateExplanation,
  getExplanation,
  recommendTrials,
  getRecommendations,
  validateTrial,
  getValidation,
  checkEligibility,
  getEligibilityCheck,
  parseSuggestions,
  parseCriteria,
  type TxState,
  type EligibilityVerdict,
} from "@/lib/genLayerClient";

interface AIAdvisorProps {
  patientAddress: string;
}

type Feature = "explain" | "recommend" | "validate" | "eligibility";

export default function AIAdvisor({ patientAddress }: AIAdvisorProps) {
  const [feature, setFeature] = useState<Feature>("explain");

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            🧠 AI Advisor <span className="text-xs font-normal text-indigo-600">(GenLayer)</span>
          </h3>
          <p className="text-xs text-gray-500">
            AI-powered explanations, recommendations, validation, and eligibility checks settled by
            GenLayer consensus. No patient data leaves the privacy layer.
          </p>
        </div>
      </div>

      {/* Feature tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {([
          ["explain", "Eligibility Explainer"],
          ["recommend", "Trial Recommendations"],
          ["validate", "Trial Validator"],
          ["eligibility", "Eligibility Checker"],
        ] as [Feature, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFeature(key)}
            className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium transition-colors ${
              feature === key
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {feature === "explain" && <ExplainFeature patientAddress={patientAddress} />}
      {feature === "recommend" && <RecommendFeature />}
      {feature === "validate" && <ValidateFeature />}
      {feature === "eligibility" && <EligibilityFeature patientAddress={patientAddress} />}
    </div>
  );
}

// ===========================================================================
// Example inputs — one-click "Fill example" presets per feature.
//
// These prefill the forms with realistic, fully PUBLIC / de-identified data so
// reviewers can exercise each feature without hand-typing clinical metadata.
// They must obey the same privacy boundary as the live forms: no raw patient
// values, no PII in summaries.
// ===========================================================================

const EXAMPLE_EXPLAIN = {
  trialId: "1",
  isEligible: true,
  trialName: "Metabolic Syndrome Intervention Study",
  minAge: "30",
  maxAge: "65",
  conditionCode: "E88.81",
  minBmi: "25",
  maxBmi: "40",
};

const EXAMPLE_RECOMMEND = {
  form: {
    profileHash: "profile_demo_001",
    ageBucket: "40-50",
    conditionCategory: "metabolic disorder",
  },
  trials: [
    "1: Metabolic syndrome lifestyle intervention, ages 30-65",
    "2: Cardiology observational cohort, ages 45-70",
    "3: Type 2 diabetes glucose-control trial, ages 35-60",
  ].join("\n"),
};

const EXAMPLE_VALIDATE = {
  trialId: "1",
  trialName: "Metabolic Syndrome Intervention Study",
  description:
    "A randomized controlled trial evaluating a 12-week lifestyle and dietary " +
    "intervention in adults with metabolic syndrome, measuring changes in " +
    "fasting glucose, BMI, and blood pressure against a standard-of-care control arm.",
  minAge: "30",
  maxAge: "65",
  conditionCode: "E88.81",
};

const EXAMPLE_ELIGIBILITY = {
  checkId: "",
  trialRegistryUrl: "https://clinicaltrials.gov/study/NCT00000000",
  anonymizedSummary:
    "45-year-old with type 2 diabetes, BMI 31, no prior cardiac events, " +
    "not pregnant, on metformin, no participation in other trials in the last 6 months.",
};

// ===========================================================================
// Shared transaction badge
// ===========================================================================

function TxBadge({ state }: { state: TxState }) {
  const map: Record<TxState, { label: string; cls: string }> = {
    idle: { label: "", cls: "" },
    submitting: { label: "Submitting…", cls: "bg-blue-100 text-blue-800" },
    pending: { label: "Pending consensus…", cls: "bg-yellow-100 text-yellow-800" },
    finalized: { label: "Finalized ✓", cls: "bg-green-100 text-green-800" },
    failed: { label: "Failed ✗", cls: "bg-red-100 text-red-800" },
  };
  const s = map[state];
  if (!s.label) return null;
  return <span className={`text-xs px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
}

/** One-click button that loads a realistic example payload into a form. */
function FillExampleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
    >
      Fill example
    </button>
  );
}

// ===========================================================================
// Feature 1 — Eligibility Explainer
// ===========================================================================

function ExplainFeature({ patientAddress }: { patientAddress: string }) {
  const [form, setForm] = useState({
    trialId: "",
    isEligible: true,
    trialName: "",
    minAge: "",
    maxAge: "",
    conditionCode: "",
    minBmi: "",
    maxBmi: "",
  });
  const [txState, setTxState] = useState<TxState>("idle");
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState("");

  const submit = async () => {
    setError("");
    setExplanation("");
    setTxState("submitting");
    try {
      setTxState("pending");
      await generateExplanation({
        trialId: Number(form.trialId),
        patientAddress,
        isEligible: form.isEligible,
        trialName: form.trialName,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        conditionCode: form.conditionCode,
        minBmi: form.minBmi,
        maxBmi: form.maxBmi,
      });
      setTxState("finalized");
      const result = await getExplanation(Number(form.trialId), patientAddress);
      setExplanation(result);
    } catch (err: any) {
      setTxState("failed");
      setError(err?.message ?? "Unknown error");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-gray-500">
          Explains an eligibility result in plain language. Receives only public trial criteria and the
          precomputed eligibility boolean — no raw patient values.
        </p>
        <FillExampleButton onClick={() => setForm(EXAMPLE_EXPLAIN)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Trial ID" value={form.trialId} onChange={(v) => setForm({ ...form, trialId: v })} />
        <Input label="Trial Name" value={form.trialName} onChange={(v) => setForm({ ...form, trialName: v })} />
        <Input label="Min Age" value={form.minAge} onChange={(v) => setForm({ ...form, minAge: v })} />
        <Input label="Max Age" value={form.maxAge} onChange={(v) => setForm({ ...form, maxAge: v })} />
        <Input label="Condition Code (ICD-10)" value={form.conditionCode} onChange={(v) => setForm({ ...form, conditionCode: v })} />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isEligible}
              onChange={(e) => setForm({ ...form, isEligible: e.target.checked })}
              className="rounded"
            />
            Patient is eligible
          </label>
        </div>
        <Input label="Min BMI" value={form.minBmi} onChange={(v) => setForm({ ...form, minBmi: v })} />
        <Input label="Max BMI" value={form.maxBmi} onChange={(v) => setForm({ ...form, maxBmi: v })} />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={txState === "submitting" || txState === "pending"}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Generate Explanation
        </button>
        <TxBadge state={txState} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {explanation && (
        <div className="mt-3 p-4 bg-indigo-50 border border-indigo-200 rounded">
          <p className="text-xs font-semibold text-indigo-900 mb-1">Explanation</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{explanation}</p>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Feature 2 — Trial Recommender
// ===========================================================================

function RecommendFeature() {
  const [form, setForm] = useState({
    profileHash: "",
    ageBucket: "30-40",
    conditionCategory: "metabolic disorder",
  });
  const [trials, setTrials] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ trial_ids: number[]; reasoning: string } | null>(null);

  const submit = async () => {
    setError("");
    setResult(null);
    setTxState("submitting");
    try {
      // trials input format: one per line, "ID: summary"
      const lines = trials
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const trialIds: number[] = [];
      const summaries: string[] = [];
      for (const line of lines) {
        const [idStr, ...rest] = line.split(":");
        if (idStr && rest.length) {
          trialIds.push(Number(idStr.trim()));
          summaries.push(rest.join(":").trim());
        }
      }
      if (trialIds.length === 0) throw new Error("Enter at least one trial as 'ID: summary'");

      setTxState("pending");
      await recommendTrials({
        profileHash: form.profileHash || `profile_${Date.now()}`,
        ageBucket: form.ageBucket,
        conditionCategory: form.conditionCategory,
        trialIds,
        trialSummaries: summaries,
      });
      setTxState("finalized");
      const rec = await getRecommendations(form.profileHash || `profile_${Date.now()}`);
      setResult(rec);
    } catch (err: any) {
      setTxState("failed");
      setError(err?.message ?? "Unknown error");
    }
  };

  const fillExample = () => {
    setForm(EXAMPLE_RECOMMEND.form);
    setTrials(EXAMPLE_RECOMMEND.trials);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-gray-500">
          Recommends 1–3 trials for a coarse profile bucket. Uses only non-identifying buckets and a
          profile hash — no exact values or addresses.
        </p>
        <FillExampleButton onClick={fillExample} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Profile Hash (not address)" value={form.profileHash} onChange={(v) => setForm({ ...form, profileHash: v })} />
        <Input label="Age Bucket (e.g. 30-40)" value={form.ageBucket} onChange={(v) => setForm({ ...form, ageBucket: v })} />
      </div>
      <Input label="Condition Category (e.g. metabolic disorder)" value={form.conditionCategory} onChange={(v) => setForm({ ...form, conditionCategory: v })} />
      <div>
        <label className="text-xs font-medium text-gray-700">Candidate Trials (one per line: ID: summary)</label>
        <textarea
          value={trials}
          onChange={(e) => setTrials(e.target.value)}
          rows={4}
          placeholder={"1: Metabolic syndrome study\n2: Cardiology observational"}
          className="mt-1 w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded p-2 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={txState === "submitting" || txState === "pending"}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Get Recommendations
        </button>
        <TxBadge state={txState} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded">
          <p className="text-xs font-semibold text-purple-900 mb-1">
            Recommended Trials: {result.trial_ids.join(", ")}
          </p>
          <p className="text-sm text-gray-800">{result.reasoning}</p>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Feature 3 — Trial Validator
// ===========================================================================

function ValidateFeature() {
  const [form, setForm] = useState({
    trialId: "",
    trialName: "",
    description: "",
    minAge: "",
    maxAge: "",
    conditionCode: "",
  });
  const [txState, setTxState] = useState<TxState>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ valid: boolean; reason: string; suggestions: string[] } | null>(null);

  const submit = async () => {
    setError("");
    setResult(null);
    setTxState("submitting");
    try {
      setTxState("pending");
      await validateTrial({
        trialId: Number(form.trialId),
        trialName: form.trialName,
        description: form.description,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        conditionCode: form.conditionCode,
      });
      setTxState("finalized");
      const val = await getValidation(Number(form.trialId));
      setResult({ valid: val.valid, reason: val.reason, suggestions: parseSuggestions(val.suggestions) });
    } catch (err: any) {
      setTxState("failed");
      setError(err?.message ?? "Unknown error");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-gray-500">
          Validates a trial registration: checks description coherence and verifies the ICD-10 code
          against a live medical reference via GenLayer web access. No patient data involved.
        </p>
        <FillExampleButton onClick={() => setForm(EXAMPLE_VALIDATE)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Trial ID" value={form.trialId} onChange={(v) => setForm({ ...form, trialId: v })} />
        <Input label="Trial Name" value={form.trialName} onChange={(v) => setForm({ ...form, trialName: v })} />
        <Input label="Min Age" value={form.minAge} onChange={(v) => setForm({ ...form, minAge: v })} />
        <Input label="Max Age" value={form.maxAge} onChange={(v) => setForm({ ...form, maxAge: v })} />
        <Input label="Condition Code (ICD-10)" value={form.conditionCode} onChange={(v) => setForm({ ...form, conditionCode: v })} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Describe the trial's purpose and methodology…"
          className="mt-1 w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={txState === "submitting" || txState === "pending"}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Validate Trial
        </button>
        <TxBadge state={txState} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className={`mt-3 p-4 border rounded ${result.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className={`text-xs font-semibold mb-1 ${result.valid ? "text-green-900" : "text-red-900"}`}>
            {result.valid ? "✓ Trial Valid" : "✗ Trial Invalid"}
          </p>
          <p className="text-sm text-gray-800">{result.reason}</p>
          {result.suggestions.length > 0 && (
            <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Feature 4 — Clinical Trial Eligibility Checker
// ===========================================================================

function verdictStyle(result: EligibilityVerdict): { label: string; cls: string } {
  switch (result) {
    case "ELIGIBLE":
      return { label: "✓ Likely Eligible", cls: "bg-green-50 border-green-200 text-green-900" };
    case "NOT_ELIGIBLE":
      return { label: "✗ Likely Not Eligible", cls: "bg-red-50 border-red-200 text-red-900" };
    case "UNCLEAR":
      return { label: "? Unclear", cls: "bg-yellow-50 border-yellow-200 text-yellow-900" };
    default:
      return { label: "No result", cls: "bg-gray-50 border-gray-200 text-gray-700" };
  }
}

function EligibilityFeature({ patientAddress }: { patientAddress: string }) {
  const [form, setForm] = useState({
    checkId: "",
    trialRegistryUrl: "",
    anonymizedSummary: "",
  });
  const [txState, setTxState] = useState<TxState>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    result: EligibilityVerdict;
    reasoning: string;
    matched: string[];
    failed: string[];
  } | null>(null);

  const submit = async () => {
    setError("");
    setResult(null);
    setTxState("submitting");
    try {
      // Derive a stable-ish check id when the user leaves it blank, scoped to
      // the patient so repeat checks for the same person are grouped.
      const checkId =
        form.checkId.trim() || `${patientAddress}-${form.trialRegistryUrl.trim()}`;

      setTxState("pending");
      await checkEligibility({
        checkId,
        trialRegistryUrl: form.trialRegistryUrl,
        anonymizedSummary: form.anonymizedSummary,
      });
      setTxState("finalized");
      const check = await getEligibilityCheck(checkId);
      setResult({
        result: check.result,
        reasoning: check.reasoning,
        matched: parseCriteria(check.matched_criteria),
        failed: parseCriteria(check.failed_criteria),
      });
    } catch (err: any) {
      setTxState("failed");
      setError(err?.message ?? "Unknown error");
    }
  };

  const verdict = result ? verdictStyle(result.result) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-gray-500">
          Assesses eligibility against a public trial registry page using an anonymized free-text
          summary. GenLayer reads the live registry URL and reasons over it under consensus. The
          summary must be de-identified — emails, phone numbers, and ID numbers are rejected before
          submission.
        </p>
        <FillExampleButton onClick={() => setForm(EXAMPLE_ELIGIBILITY)} />
      </div>
      <Input
        label="Check ID (optional — auto-generated if blank)"
        value={form.checkId}
        onChange={(v) => setForm({ ...form, checkId: v })}
      />
      <Input
        label="Trial Registry URL"
        value={form.trialRegistryUrl}
        onChange={(v) => setForm({ ...form, trialRegistryUrl: v })}
      />
      <div>
        <label className="text-xs font-medium text-gray-700">
          Anonymized Patient Summary (20–2000 chars, no PII)
        </label>
        <textarea
          value={form.anonymizedSummary}
          onChange={(e) => setForm({ ...form, anonymizedSummary: e.target.value })}
          rows={4}
          placeholder="e.g. 45-year-old with type 2 diabetes, BMI 31, no prior cardiac events, not pregnant…"
          className="mt-1 w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          {form.anonymizedSummary.length} / 2000 characters
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={txState === "submitting" || txState === "pending"}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Check Eligibility
        </button>
        <TxBadge state={txState} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && verdict && (
        <div className={`mt-3 p-4 border rounded ${verdict.cls}`}>
          <p className="text-xs font-semibold mb-1">{verdict.label}</p>
          <p className="text-sm text-gray-800">{result.reasoning}</p>
          {result.matched.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-green-800">Matched criteria</p>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {result.matched.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {result.failed.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-red-800">Failed criteria</p>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {result.failed.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Reusable input
// ===========================================================================

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      />
    </div>
  );
}
