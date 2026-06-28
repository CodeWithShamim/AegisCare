# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
import re
from dataclasses import dataclass

from genlayer import *


@allow_storage
@dataclass
class ValidationResult:
    valid: bool
    reason: str
    suggestions: str


@allow_storage
@dataclass
class Recommendation:
    trial_ids: str
    reasoning: str


@allow_storage
@dataclass
class EligibilityCheck:
    trial_registry_url: str
    anonymized_summary: str
    result: str
    reasoning: str
    matched_criteria: str
    failed_criteria: str


_ICD10_URL = "https://icd.who.int/browse10"
_PII_PATTERNS = [
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
    r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',
    r'\b\d{9,}\b',
]


class AegisCareAdvisor(gl.Contract):

    explanations: TreeMap[u32, TreeMap[str, str]]
    recommendations: TreeMap[str, Recommendation]
    validations: TreeMap[u32, ValidationResult]
    eligibility_checks: TreeMap[str, EligibilityCheck]

    def __init__(self) -> None:
        # An explicit __init__ is required by the GenVM validator (E106).
        # Do NOT inmem_allocate the top-level collections here — that creates
        # in-memory (pickled) collections instead of storage-backed ones, which
        # breaks reads in nondet mode (block explorer warns "Detected pickling
        # storage class"). They are zero-initialized by the framework. A nested
        # TreeMap *value* still needs inmem_allocate at its assignment site.
        pass

    def _parse_json(self, raw) -> dict:
        if isinstance(raw, dict):
            return raw
        if isinstance(raw, str):
            try:
                return json.loads(raw)
            except Exception:
                pass
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
        raise gl.vm.UserError("LLM_ERROR: could not parse JSON from LLM output")

    def _check_pii(self, text: str) -> None:
        for pattern in _PII_PATTERNS:
            if re.search(pattern, text):
                raise gl.vm.UserError(
                    "EXPECTED: summary contains PII — remove email, phone, or ID numbers"
                )

    # ==================================================================
    # Feature 1 — Eligibility explainer
    # ==================================================================

    @gl.public.write
    def generate_explanation(
        self,
        trial_id: u32,
        patient_address: str,
        is_eligible: bool,
        trial_name: str,
        min_age: u32,
        max_age: u32,
        condition_code: str,
        min_bmi: str,
        max_bmi: str,
    ) -> None:
        status = "ELIGIBLE" if is_eligible else "NOT ELIGIBLE"

        def leader_fn():
            prompt = f"""You are explaining a clinical-trial eligibility result to a patient.
Trial: {trial_name}
Status: {status}
Age range: {min_age}-{max_age}
BMI range: {min_bmi}-{max_bmi}
Condition code: {condition_code}
Rules:
- State the eligibility status ({status}) clearly.
- Reference at least one criterion boundary.
- Do NOT include specific patient values.
- Length: 50 to 400 characters.
Respond ONLY as JSON: {{"explanation": "your text here"}}"""
            result = gl.nondet.exec_prompt(prompt)
            data = self._parse_json(result)
            explanation = data.get("explanation", "")
            if not isinstance(explanation, str) or not (50 <= len(explanation) <= 400):
                raise gl.vm.UserError("LLM_ERROR: explanation invalid or wrong length")
            return {"explanation": explanation}

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            try:
                leader_fn()
            except Exception:
                return False
            exp = leaders_res.calldata.get("explanation", "")
            if status not in exp.upper():
                return False
            if not (50 <= len(exp) <= 400):
                return False
            return True

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # Fix: use inmem_allocate for nested TreeMap
        if trial_id not in self.explanations:
            self.explanations[trial_id] = gl.storage.inmem_allocate(TreeMap[str, str])
        self.explanations[trial_id][patient_address] = result["explanation"]

    @gl.public.view
    def get_explanation(self, trial_id: u32, patient_address: str) -> str:
        if trial_id not in self.explanations:
            return ""
        inner = self.explanations[trial_id]
        if patient_address not in inner:
            return ""
        return inner[patient_address]

    # ==================================================================
    # Feature 2 — Trial recommender
    # ==================================================================

    @gl.public.write
    def recommend_trials(
        self,
        profile_hash: str,
        age_bucket: str,
        condition_category: str,
        trial_ids: list,
        trial_summaries: list,
    ) -> None:
        if len(trial_ids) == 0:
            raise gl.vm.UserError("EXPECTED: no trials to recommend from")
        if len(trial_ids) != len(trial_summaries):
            raise gl.vm.UserError("EXPECTED: trial_ids and trial_summaries length mismatch")

        allowed_ids = [int(t) for t in trial_ids]

        def leader_fn():
            candidates = "\n".join(
                f"- Trial {allowed_ids[i]}: {trial_summaries[i]}"
                for i in range(len(allowed_ids))
            )
            prompt = f"""Recommend 1 to 3 best-matching clinical trials for this patient.
Patient (anonymized): age bucket={age_bucket}, condition={condition_category}
Candidates:
{candidates}
Respond ONLY as JSON: {{"trial_ids": [1, 2], "reasoning": "explanation"}}
Only use IDs from the candidates list. Pick 1 to 3."""
            result = gl.nondet.exec_prompt(prompt)
            data = self._parse_json(result)
            raw_ids = data.get("trial_ids", [])
            reasoning = data.get("reasoning", "")
            if not isinstance(raw_ids, list):
                raise gl.vm.UserError("LLM_ERROR: trial_ids must be array")
            picked = [int(t) for t in raw_ids]
            if not (1 <= len(picked) <= 3):
                raise gl.vm.UserError("LLM_ERROR: must pick 1-3 trials")
            if any(t not in allowed_ids for t in picked):
                raise gl.vm.UserError("LLM_ERROR: picked trial not in candidate list")
            if not reasoning:
                raise gl.vm.UserError("LLM_ERROR: reasoning must be non-empty")
            return {"trial_ids": picked, "reasoning": reasoning}

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            try:
                leader_fn()
            except Exception:
                return False
            data = leaders_res.calldata
            picked = data.get("trial_ids", [])
            reasoning = data.get("reasoning", "")
            if not isinstance(picked, list) or not reasoning:
                return False
            if any(int(t) not in allowed_ids for t in picked):
                return False
            if not (1 <= len(picked) <= 3):
                return False
            return True

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        self.recommendations[profile_hash] = Recommendation(
            trial_ids=json.dumps(result["trial_ids"]),
            reasoning=result["reasoning"],
        )

    @gl.public.view
    def get_recommendations(self, profile_hash: str) -> Recommendation:
        if profile_hash not in self.recommendations:
            return Recommendation(trial_ids="[]", reasoning="")
        return self.recommendations[profile_hash]

    # ==================================================================
    # Feature 3 — Trial validator
    # ==================================================================

    @gl.public.write
    def validate_trial(
        self,
        trial_id: u32,
        trial_name: str,
        description: str,
        min_age: u32,
        max_age: u32,
        condition_code: str,
    ) -> None:

        def leader_fn():
            try:
                web_context = gl.nondet.web.render(_ICD10_URL, mode="text")
            except Exception:
                raise gl.vm.UserError("LLM_ERROR: failed to fetch ICD-10 reference page")
            web_context = (web_context or "")[:3000]
            prompt = f"""Validate this clinical trial registration.
Trial: {trial_name}
Description: {description}
Age: {min_age}-{max_age}, ICD-10 code: {condition_code}
ICD-10 reference: {web_context}
valid=true ONLY if description is coherent AND code is a real ICD-10 code.
Respond ONLY as JSON: {{"valid": true, "reason": "", "suggestions": []}}"""
            result = gl.nondet.exec_prompt(prompt)
            data = self._parse_json(result)
            valid = data.get("valid")
            reason = data.get("reason", "")
            suggestions = data.get("suggestions", [])
            if not isinstance(valid, bool):
                raise gl.vm.UserError("LLM_ERROR: valid must be boolean")
            if not valid and not reason:
                raise gl.vm.UserError("LLM_ERROR: reason required when valid=false")
            if not isinstance(suggestions, list):
                suggestions = []
            return {"valid": valid, "reason": reason, "suggestions": suggestions}

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            try:
                my_result = leader_fn()
            except Exception:
                return False
            data = leaders_res.calldata
            if not isinstance(data.get("valid"), bool):
                return False
            return my_result["valid"] == data["valid"]

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        self.validations[trial_id] = ValidationResult(
            valid=result["valid"],
            reason=result["reason"],
            suggestions=json.dumps(result["suggestions"]),
        )

    @gl.public.view
    def get_validation(self, trial_id: u32) -> ValidationResult:
        if trial_id not in self.validations:
            return ValidationResult(valid=False, reason="", suggestions="[]")
        return self.validations[trial_id]

    # ==================================================================
    # Feature 4 — Clinical Trial Eligibility Checker
    # ==================================================================

    @gl.public.write
    def check_eligibility(
        self,
        check_id: str,
        trial_registry_url: str,
        anonymized_summary: str,
    ) -> None:
        if not check_id.strip():
            raise gl.vm.UserError("EXPECTED: check_id is required")
        if not trial_registry_url.strip():
            raise gl.vm.UserError("EXPECTED: trial_registry_url is required")
        if len(anonymized_summary.strip()) < 20:
            raise gl.vm.UserError("EXPECTED: summary too short")
        if len(anonymized_summary) > 2000:
            raise gl.vm.UserError("EXPECTED: summary too long")
        self._check_pii(anonymized_summary)

        def leader_fn():
            try:
                trial_page = gl.nondet.web.render(trial_registry_url, mode="text")
            except Exception:
                raise gl.vm.UserError("LLM_ERROR: failed to fetch trial registry page")
            trial_page = (trial_page or "")[:5000]
            if not trial_page.strip():
                raise gl.vm.UserError("EXPECTED: trial registry page returned empty content")
            prompt = f"""Assess clinical trial eligibility from this page and patient summary.
TRIAL PAGE: {trial_page}
PATIENT SUMMARY: {anonymized_summary}
Result must be exactly one of: ELIGIBLE, NOT_ELIGIBLE, UNCLEAR
Respond ONLY as JSON:
{{"result": "ELIGIBLE", "matched_criteria": ["criterion: PASS"], "failed_criteria": [], "reasoning": "explanation"}}"""
            raw = gl.nondet.exec_prompt(prompt)
            data = self._parse_json(raw)
            result = data.get("result", "")
            if result not in ("ELIGIBLE", "NOT_ELIGIBLE", "UNCLEAR"):
                raise gl.vm.UserError("LLM_ERROR: result must be ELIGIBLE, NOT_ELIGIBLE, or UNCLEAR")
            if not data.get("reasoning"):
                raise gl.vm.UserError("LLM_ERROR: reasoning must be non-empty")
            matched = data.get("matched_criteria", [])
            failed = data.get("failed_criteria", [])
            if not isinstance(matched, list):
                matched = []
            if not isinstance(failed, list):
                failed = []
            return {
                "result": result,
                "matched_criteria": matched,
                "failed_criteria": failed,
                "reasoning": data.get("reasoning", ""),
            }

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            try:
                my_result = leader_fn()
            except Exception:
                return False
            data = leaders_res.calldata
            if data.get("result") not in ("ELIGIBLE", "NOT_ELIGIBLE", "UNCLEAR"):
                return False
            return my_result["result"] == data["result"]

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        self.eligibility_checks[check_id] = EligibilityCheck(
            trial_registry_url=trial_registry_url,
            anonymized_summary=anonymized_summary,
            result=result["result"],
            reasoning=result["reasoning"],
            matched_criteria=json.dumps(result["matched_criteria"]),
            failed_criteria=json.dumps(result["failed_criteria"]),
        )

    @gl.public.view
    def get_eligibility_check(self, check_id: str) -> EligibilityCheck:
        if check_id not in self.eligibility_checks:
            return EligibilityCheck(
                trial_registry_url="",
                anonymized_summary="",
                result="",
                reasoning="",
                matched_criteria="[]",
                failed_criteria="[]",
            )
        return self.eligibility_checks[check_id]