"""
Direct tests for AegisCareAdvisor Feature 1 — Eligibility Explainer.

Requires mocked LLM calls. exec_prompt returns a string; the contract
sanitizes (strip fences, slice to {...}) then json.loads it.

Run with:
  pytest tests/direct/test_generate_explanation.py -v
"""
import json

CONTRACT_PATH = "contracts/aegiscare_advisor.py"

# ── Helpers ──────────────────────────────────────────────────────────────

# A compliant JSON response that the contract's _extract_json_object
# + json.loads will parse into {"explanation": "..."}.
_MOCK_EXPLANATION = json.dumps({
    "explanation": (
        "Based on the trial criteria, you are eligible "
        "for this study. The trial requires participants aged 30-65 "
        "with a BMI between 18.5 and 30.0. Please consult your "
        "physician for further details about enrollment."
    ),
})


def _mock_eligibility_llm(vm, status_word: str):
    """Mock the LLM to return a compliant JSON string.

    The regex matches the prompt inside generate_explanation's leader_fn.
    exec_prompt returns a raw string; the contract handles JSON parsing.
    """
    mock_json = json.dumps({
        "explanation": (
            f"Based on the trial criteria, you are {status_word.lower()} "
            "for this study. The trial requires participants aged 30-65 "
            "with a BMI between 18.5 and 30.0. Please consult your "
            "physician for further details about enrollment."
        ),
    })
    vm.mock_llm(
        r".*explaining a clinical-trial eligibility result.*",
        mock_json,
    )


# ── Feature 1: generate_explanation ─────────────────────────────────────


class TestGenerateExplanation:
    """Feature 1 write: LLM generates eligibility explanation."""

    def test_eligible_explanation_stored(self, direct_vm, direct_deploy, direct_alice):
        """Patient is eligible → explanation stored and retrievable."""
        _mock_eligibility_llm(direct_vm, "ELIGIBLE")
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.generate_explanation(
            trial_id=1,
            patient_address="0x1234567890abcdef1234567890abcdef12345678",
            is_eligible=True,
            trial_name="CardioHealth-2024",
            min_age=30,
            max_age=65,
            condition_code="I10",
            min_bmi="18.5",
            max_bmi="30.0",
        )

        explanation = contract.get_explanation(
            u32(1), "0x1234567890abcdef1234567890abcdef12345678"
        )
        assert "ELIGIBLE" in explanation.upper()
        assert len(explanation) >= 50

    def test_not_eligible_explanation(self, direct_vm, direct_deploy, direct_alice):
        """Patient is not eligible → explanation says NOT ELIGIBLE."""
        _mock_eligibility_llm(direct_vm, "NOT ELIGIBLE")
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.generate_explanation(
            trial_id=2,
            patient_address="0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            is_eligible=False,
            trial_name="DiabetesTrial-2024",
            min_age=40,
            max_age=70,
            condition_code="E11",
            min_bmi="25.0",
            max_bmi="35.0",
        )

        explanation = contract.get_explanation(
            u32(2), "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
        )
        assert "NOT ELIGIBLE" in explanation.upper()

    def test_retrieve_missing_explanation(self, direct_vm, direct_deploy):
        """Retrieving explanation for non-existent key returns empty string."""
        contract = direct_deploy(CONTRACT_PATH)
        result = contract.get_explanation(u32(999), "0x0000000000000000000000000000000000000000")
        assert result == ""

    def test_explanation_references_criterion(self, direct_vm, direct_deploy, direct_alice):
        """Explanation must reference at least one criterion boundary."""
        _mock_eligibility_llm(direct_vm, "ELIGIBLE")
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.generate_explanation(
            trial_id=3,
            patient_address="0x1111111111111111111111111111111111111111",
            is_eligible=True,
            trial_name="AgeBoundTrial",
            min_age=25,
            max_age=45,
            condition_code="J06",
            min_bmi="20.0",
            max_bmi="28.0",
        )

        explanation = contract.get_explanation(
            u32(3), "0x1111111111111111111111111111111111111111"
        )
        # The mock includes age range (30-65) and BMI range — one must appear
        has_boundary = any(s in explanation for s in ("30", "65", "18.5", "30.0"))
        assert has_boundary, "Explanation should reference a criterion boundary"

    def test_no_patient_values_in_explanation(self, direct_vm, direct_deploy, direct_alice):
        """Explanation must never contain specific patient values."""
        _mock_eligibility_llm(direct_vm, "ELIGIBLE")
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.generate_explanation(
            trial_id=4,
            patient_address="0x2222222222222222222222222222222222222222",
            is_eligible=True,
            trial_name="PrivacyTrial",
            min_age=18,
            max_age=80,
            condition_code="M54",
            min_bmi="22.0",
            max_bmi="32.0",
        )

        explanation = contract.get_explanation(
            u32(4), "0x2222222222222222222222222222222222222222"
        )
        # Patient address should not leak into explanation text
        assert "0x222222" not in explanation


class TestGetExplanation:
    """Feature 1 read: retrieve stored explanations."""

    def test_different_patients_same_trial(self, direct_vm, direct_deploy, direct_alice, direct_bob):
        """Two patients get independent explanations for the same trial."""
        _mock_eligibility_llm(direct_vm, "ELIGIBLE")
        contract = direct_deploy(CONTRACT_PATH)

        alice_addr = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        bob_addr = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

        direct_vm.sender = direct_alice
        contract.generate_explanation(
            trial_id=10, patient_address=alice_addr, is_eligible=True,
            trial_name="SharedTrial", min_age=20, max_age=60,
            condition_code="A00", min_bmi="18.0", max_bmi="29.0",
        )

        direct_vm.sender = direct_bob
        contract.generate_explanation(
            trial_id=10, patient_address=bob_addr, is_eligible=False,
            trial_name="SharedTrial", min_age=20, max_age=60,
            condition_code="A00", min_bmi="18.0", max_bmi="29.0",
        )

        alice_expl = contract.get_explanation(u32(10), alice_addr)
        bob_expl = contract.get_explanation(u32(10), bob_addr)
        assert alice_expl != "" and bob_expl != ""
