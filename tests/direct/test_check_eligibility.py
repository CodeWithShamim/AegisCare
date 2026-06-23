"""
Direct tests for AegisCareAdvisor Feature 4 — Clinical Trial Eligibility Checker.

Requires mocked LLM + web calls. exec_prompt returns a string; the contract
sanitizes and json.loads it. web.render is mocked with the canonical response
shape from the GenLayer simulator tests. The PII / length guards are exercised
directly since they run before the leader_fn.

Run with:
  pytest tests/direct/test_check_eligibility.py -v
"""
import json

CONTRACT_PATH = "contracts/aegiscare_advisor.py"

# Fake trial-registry page body, mocked for gl.nondet.web.render(<registry url>).
_FAKE_TRIAL_PAGE = """
ELIGIBILITY CRITERIA
- Adults aged 40 to 70
- Diagnosed with essential hypertension (ICD-10 I10)
- BMI between 22.0 and 35.0
- Not currently on antihypertensive medication
"""


def _mock_trial_page_web(vm):
    """Mock the external trial-registry page.

    The direct-mode MockedWebResponseData shape is a flat dict:
        {"method": str, "status": int, "body": str}
    """
    vm.mock_web(
        r"https?://.*clinicaltrials.*",
        {
            "method": "GET",
            "status": 200,
            "body": _FAKE_TRIAL_PAGE,
        },
    )


def _mock_eligibility_llm(vm, result, reasoning, matched=None, failed=None):
    """Mock the LLM to return a JSON string with an eligibility verdict.

    Regex matches the opening of check_eligibility's leader_fn prompt:
      "Assess clinical trial eligibility from this page and patient summary."
    """
    payload = {
        "result": result,
        "matched_criteria": matched or [],
        "failed_criteria": failed or [],
        "reasoning": reasoning,
    }
    vm.mock_llm(
        r".*Assess clinical trial eligibility from this page.*",
        json.dumps(payload),
    )


class TestCheckEligibility:
    """Feature 4 write: LLM + web assess eligibility from a registry page."""

    def test_eligible_verdict_stored(self, direct_vm, direct_deploy, direct_alice):
        """Matching anonymized summary -> ELIGIBLE, stored and retrievable."""
        _mock_trial_page_web(direct_vm)
        _mock_eligibility_llm(
            direct_vm,
            result="ELIGIBLE",
            matched=["age 58 within 40-70: PASS", "hypertension I10: PASS"],
            failed=[],
            reasoning="Summary meets all listed inclusion criteria for the trial.",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.check_eligibility(
            check_id="check_001",
            trial_registry_url="https://clinicaltrials.gov/example-hypertension",
            anonymized_summary=(
                "Adult in late fifties with essential hypertension and a "
                "body mass index in the upper healthy range, not currently "
                "taking medication for the condition."
            ),
        )

        check = contract.get_eligibility_check("check_001")
        assert check.result == "ELIGIBLE"
        assert check.reasoning != ""
        matched = json.loads(check.matched_criteria)
        assert isinstance(matched, list) and len(matched) >= 1

    def test_not_eligible_verdict_stored(self, direct_vm, direct_deploy, direct_alice):
        """Non-matching summary -> NOT_ELIGIBLE, with failed criteria populated."""
        _mock_trial_page_web(direct_vm)
        _mock_eligibility_llm(
            direct_vm,
            result="NOT_ELIGIBLE",
            matched=[],
            failed=["age 25 outside 40-70: FAIL"],
            reasoning="Summary indicates an age below the trial's lower bound.",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.check_eligibility(
            check_id="check_002",
            trial_registry_url="https://clinicaltrials.gov/example-hypertension",
            anonymized_summary=(
                "Young adult in the mid-twenties with no hypertension "
                "diagnosis and no current medication."
            ),
        )

        check = contract.get_eligibility_check("check_002")
        assert check.result == "NOT_ELIGIBLE"
        failed = json.loads(check.failed_criteria)
        assert isinstance(failed, list) and len(failed) >= 1

    def test_unclear_verdict_stored(self, direct_vm, direct_deploy, direct_alice):
        """Ambiguous summary -> UNCLEAR is an accepted verdict."""
        _mock_trial_page_web(direct_vm)
        _mock_eligibility_llm(
            direct_vm,
            result="UNCLEAR",
            matched=[],
            failed=[],
            reasoning="Insufficient detail in summary to determine eligibility.",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.check_eligibility(
            check_id="check_003",
            trial_registry_url="https://clinicaltrials.gov/example-hypertension",
            anonymized_summary="An adult with some undisclosed cardiovascular history.",
        )

        check = contract.get_eligibility_check("check_003")
        assert check.result == "UNCLEAR"

    def test_missing_check_returns_default(self, direct_vm, direct_deploy):
        """Non-existent check_id returns the default empty EligibilityCheck."""
        contract = direct_deploy(CONTRACT_PATH)
        check = contract.get_eligibility_check("never_run")
        assert check.result == ""
        assert check.reasoning == ""
        assert check.matched_criteria == "[]"
        assert check.failed_criteria == "[]"


class TestCheckEligibilityGuardrails:
    """Feature 4 input guards run BEFORE the leader_fn / consensus."""

    def test_empty_check_id_fails(self, direct_vm, direct_deploy, direct_alice):
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: check_id is required"):
            contract.check_eligibility(
                check_id="   ",
                trial_registry_url="https://clinicaltrials.gov/x",
                anonymized_summary="A valid length summary with enough characters.",
            )

    def test_empty_registry_url_fails(self, direct_vm, direct_deploy, direct_alice):
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: trial_registry_url is required"):
            contract.check_eligibility(
                check_id="check_010",
                trial_registry_url="",
                anonymized_summary="A valid length summary with enough characters.",
            )

    def test_short_summary_fails(self, direct_vm, direct_deploy, direct_alice):
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: summary too short"):
            contract.check_eligibility(
                check_id="check_011",
                trial_registry_url="https://clinicaltrials.gov/x",
                anonymized_summary="too short",
            )

    def test_pii_email_rejected(self, direct_vm, direct_deploy, direct_alice):
        """Email in summary trips the PII guard before consensus."""
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: summary contains PII"):
            contract.check_eligibility(
                check_id="check_012",
                trial_registry_url="https://clinicaltrials.gov/x",
                anonymized_summary="Contact me at patient@example.com for my full history.",
            )

    def test_pii_phone_rejected(self, direct_vm, direct_deploy, direct_alice):
        """Phone number in summary trips the PII guard before consensus."""
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: summary contains PII"):
            contract.check_eligibility(
                check_id="check_013",
                trial_registry_url="https://clinicaltrials.gov/x",
                anonymized_summary="You can reach me at 555-123-4567 to discuss details.",
            )

    def test_pii_long_id_rejected(self, direct_vm, direct_deploy, direct_alice):
        """Long digit run (SSN/MRN-like) trips the PII guard before consensus."""
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("EXPECTED: summary contains PII"):
            contract.check_eligibility(
                check_id="check_014",
                trial_registry_url="https://clinicaltrials.gov/x",
                anonymized_summary="My medical record number is 123456789 for reference.",
            )


class TestCheckEligibilityPrivacy:
    """Feature 4 privacy: only a de-identified summary + public URL are used."""

    def test_summary_is_anonymized(self, direct_vm, direct_deploy, direct_alice):
        """A clean, de-identified summary is accepted and stores the verdict."""
        _mock_trial_page_web(direct_vm)
        _mock_eligibility_llm(
            direct_vm,
            result="ELIGIBLE",
            matched=["age within range: PASS"],
            failed=[],
            reasoning="The anonymized summary satisfies the trial's criteria.",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        # No names, emails, phones, or ID runs — only coarse clinical facts.
        contract.check_eligibility(
            check_id="check_priv",
            trial_registry_url="https://clinicaltrials.gov/example-hypertension",
            anonymized_summary=(
                "Adult within the eligible age range with essential "
                "hypertension, a suitable body mass index, and not on "
                "antihypertensive medication."
            ),
        )

        check = contract.get_eligibility_check("check_priv")
        assert check.result == "ELIGIBLE"
        # The stored summary is the (already anonymized) input verbatim.
        assert "essential hypertension" in check.anonymized_summary
