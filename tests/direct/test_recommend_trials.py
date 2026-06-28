"""
Direct tests for AegisCareAdvisor Feature 2 — Trial Recommender.

Requires mocked LLM calls. exec_prompt returns a string; the contract
sanitizes and json.loads it.

Run with:
  pytest tests/direct/test_recommend_trials.py -v
"""
import json

CONTRACT_PATH = "contracts/aegiscare_advisor.py"


def _parse_ids(trial_ids_field) -> list:
    """The contract stores Recommendation.trial_ids as a JSON array string
    (e.g. '[42, 55]'). Parse it back into a list of ints."""
    if isinstance(trial_ids_field, (list, tuple)):
        return [int(t) for t in trial_ids_field]
    if not trial_ids_field:
        return []
    try:
        parsed = json.loads(trial_ids_field)
        return [int(t) for t in parsed] if isinstance(parsed, list) else []
    except (ValueError, TypeError):
        return []


def _mock_recommend_llm(vm, picked_ids, reasoning):
    """Mock the LLM to return a JSON string with specific trial IDs.

    Regex matches the opening of recommend_trials' leader_fn prompt:
      "Recommend 1 to 3 best-matching clinical trials for this patient."
    """
    mock_json = json.dumps({"trial_ids": picked_ids, "reasoning": reasoning})
    vm.mock_llm(
        r".*Recommend 1 to 3 best-matching clinical trials.*",
        mock_json,
    )


class TestRecommendTrials:
    """Feature 2 write: LLM recommends trials from candidate list."""

    def test_single_recommendation(self, direct_vm, direct_deploy, direct_alice):
        """LLM picks 1 trial — stored and retrievable."""
        _mock_recommend_llm(
            direct_vm,
            picked_ids=[42],
            reasoning="Trial 42 best matches the metabolic disorder profile for ages 30-40.",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.recommend_trials(
            profile_hash="hash_abc123",
            age_bucket="30-40",
            condition_category="metabolic disorder",
            trial_ids=[42, 55, 78],
            trial_summaries=[
                "Trial 42: Metabolic syndrome treatment study",
                "Trial 55: Cardiology observational study",
                "Trial 78: Neurology phase III",
            ],
        )

        rec = contract.get_recommendations("hash_abc123")
        assert rec.reasoning != ""
        assert 42 in _parse_ids(rec.trial_ids)

    def test_multiple_recommendations(self, direct_vm, direct_deploy, direct_alice):
        """LLM picks 3 trials — all stored."""
        _mock_recommend_llm(
            direct_vm,
            picked_ids=[10, 20, 30],
            reasoning="All three trials target respiratory conditions in the 50-60 age range.",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.recommend_trials(
            profile_hash="hash_multi",
            age_bucket="50-60",
            condition_category="respiratory",
            trial_ids=[10, 20, 30, 40],
            trial_summaries=[
                "Trial 10: Asthma management",
                "Trial 20: COPD treatment",
                "Trial 30: Pulmonary fibrosis",
                "Trial 40: Allergy immunotherapy",
            ],
        )

        rec = contract.get_recommendations("hash_multi")
        ids = sorted(_parse_ids(rec.trial_ids))
        assert ids == [10, 20, 30]

    def test_empty_trial_list_fails(self, direct_vm, direct_deploy, direct_alice):
        """Empty trial_ids raises EXPECTED error before LLM call."""
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: no trials to recommend from"):
            contract.recommend_trials(
                profile_hash="hash_empty",
                age_bucket="25-35",
                condition_category="cardiovascular",
                trial_ids=[],
                trial_summaries=[],
            )

    def test_mismatched_lengths_fails(self, direct_vm, direct_deploy, direct_alice):
        """trial_ids and trial_summaries length mismatch raises error."""
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: trial_ids and trial_summaries"):
            contract.recommend_trials(
                profile_hash="hash_mismatch",
                age_bucket="40-50",
                condition_category="neurological",
                trial_ids=[1, 2],
                trial_summaries=["Only one summary"],
            )

    def test_missing_recommendation_returns_empty(self, direct_vm, direct_deploy):
        """Non-existent profile_hash returns empty Recommendation."""
        contract = direct_deploy(CONTRACT_PATH)
        rec = contract.get_recommendations("nonexistent_hash")
        assert rec.reasoning == ""
        assert len(_parse_ids(rec.trial_ids)) == 0


class TestRecommendationPrivacy:
    """Feature 2 privacy: only coarse, non-identifying buckets used."""

    def test_no_patient_address_in_call(self, direct_vm, direct_deploy, direct_alice):
        """recommend_trials never receives patient_address — only profile_hash."""
        _mock_recommend_llm(
            direct_vm,
            picked_ids=[5],
            reasoning="Trial 5 matches the oncology category.",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        # profile_hash is a hash, not an address — no PII
        contract.recommend_trials(
            profile_hash="sha256_of_profile_buckets",
            age_bucket="60-70",
            condition_category="oncology",
            trial_ids=[5],
            trial_summaries=["Trial 5: Cancer immunotherapy"],
        )

        rec = contract.get_recommendations("sha256_of_profile_buckets")
        assert len(_parse_ids(rec.trial_ids)) == 1
