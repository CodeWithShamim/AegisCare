"""
Integration tests for AegisCareAdvisor consensus behavior.

These require a running GenLayer Studio / StudioNet and use real LLM + web
calls through the consensus pipeline (NOT mocked). Run with:

    gltest tests/integration/test_advisor_consensus.py -v -s

BLOCKED in this environment on Python 3.9 (genlayer-py / gltest need 3.12+).
Run from a Python 3.12+ environment after `pip install genlayer-test[sim]`.

Consensus model: each write method runs
    gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
where the leader calls the LLM (and Feature 3 also fetches the ICD-10 web
page) and the validator independently re-runs the leader and agrees on the
decided field (status / verdict / boolean) — equivalence on meaning, not bytes.
"""
import pytest
from gltest import contract_factory
from gltest.assertions import tx_execution_failed

CONTRACT_PATH = "contracts/aegiscare_advisor.py"


@pytest.fixture(scope="module")
def advisor():
    factory = contract_factory(CONTRACT_PATH)
    return factory.deploy()


@pytest.mark.integration
class TestExplanationConsensus:
    """Feature 1: real LLM explanation reaches consensus via prompt_comparative."""

    def test_eligible_explanation_finalizes(self, advisor):
        tx = advisor.generate_explanation(
            trial_id=1,
            patient_address="0x" + "11" * 20,
            is_eligible=True,
            trial_name="CardioHealth Study",
            min_age=30,
            max_age=65,
            condition_code="I10",
            min_bmi="18.5",
            max_bmi="30.0",
        )
        receipt = tx.wait_for_finalization()
        assert not tx_execution_failed(receipt), f"tx failed: {receipt}"

        explanation = advisor.get_explanation(trial_id=1, patient_address="0x" + "11" * 20)
        assert "ELIGIBLE" in explanation.upper()
        assert 50 <= len(explanation) <= 400


@pytest.mark.integration
class TestRecommendationConsensus:
    """Feature 2: real LLM recommendation reaches consensus via prompt_comparative."""

    def test_recommendation_returns_valid_ids(self, advisor):
        tx = advisor.recommend_trials(
            profile_hash="profile_test_integration",
            age_bucket="40-50",
            condition_category="cardiovascular",
            trial_ids=[100, 101, 102],
            trial_summaries=[
                "Trial 100: Hypertension RCT",
                "Trial 101: Arrhythmia observational",
                "Trial 102: Heart failure phase II",
            ],
        )
        receipt = tx.wait_for_finalization()
        assert not tx_execution_failed(receipt), f"tx failed: {receipt}"

        rec = advisor.get_recommendations(profile_hash="profile_test_integration")
        ids = [int(t) for t in rec["trial_ids"]]
        assert 1 <= len(ids) <= 3
        assert all(t in [100, 101, 102] for t in ids)


@pytest.mark.integration
class TestValidationConsensus:
    """Feature 3: real LLM + web validation reaches consensus via prompt_comparative."""

    def test_valid_trial_finalizes(self, advisor):
        tx = advisor.validate_trial(
            trial_id=200,
            trial_name="Diabetes Prevention Study",
            description=(
                "A randomized controlled trial evaluating lifestyle "
                "intervention for adults at risk of Type 2 diabetes."
            ),
            min_age=35,
            max_age=70,
            condition_code="E11",
        )
        receipt = tx.wait_for_finalization()
        assert not tx_execution_failed(receipt), f"tx failed: {receipt}"

        val = advisor.get_validation(trial_id=200)
        assert val["valid"] is True
