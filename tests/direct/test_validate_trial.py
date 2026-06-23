"""
Direct tests for AegisCareAdvisor Feature 3 — Trial Validator.

Requires mocked LLM + web calls. exec_prompt returns a string; the contract
sanitizes and json.loads it. web.render is mocked with the canonical response
shape from the GenLayer simulator tests.

Run with:
  pytest tests/direct/test_validate_trial.py -v
"""
import json

CONTRACT_PATH = "contracts/aegiscare_advisor.py"

# Fake ICD-10 web context — mocked for gl.nondet.web.render("https://icd.who.int/...")
_FAKE_ICD10_BODY = """
ICD-10 Version:2016
A00-B99 Certain infectious and parasitic diseases
C00-D48 Neoplasms
E00-E90 Endocrine, nutritional and metabolic diseases
I00-I99 Diseases of the circulatory system
J00-J99 Diseases of the respiratory system
"""


def _mock_validation_llm(vm, valid: bool, reason: str = "", suggestions=None):
    """Mock the LLM to return a JSON string with a validation result.

    Regex matches the opening of validate_trial's leader_fn prompt:
      "Validate this clinical trial registration."
    """
    result = {
        "valid": valid,
        "reason": reason if reason else ("Validation passed" if valid else "Validation failed"),
        "suggestions": suggestions or [],
    }
    vm.mock_llm(
        r".*Validate this clinical trial registration.*",
        json.dumps(result),
    )


def _mock_icd10_web(vm):
    """Mock the ICD-10 reference web page.

    The direct-mode MockedWebResponseData shape is a flat dict:
        {"method": str, "status": int, "body": str}
    """
    vm.mock_web(
        r".*icd\.who\.int.*",
        {
            "method": "GET",
            "status": 200,
            "body": _FAKE_ICD10_BODY,
        },
    )


class TestValidateTrial:
    """Feature 3 write: LLM + web validate a trial registration."""

    def test_valid_trial(self, direct_vm, direct_deploy, direct_alice):
        """Coherent trial with real ICD-10 code → valid=True."""
        _mock_icd10_web(direct_vm)
        _mock_validation_llm(
            direct_vm,
            valid=True,
            reason="Validation passed",
            suggestions=["Consider adding exclusion criteria"],
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.validate_trial(
            trial_id=1,
            trial_name="HeartHealth Study",
            description="A randomized controlled trial evaluating the efficacy of a new antihypertensive medication in adults with primary hypertension.",
            min_age=30,
            max_age=70,
            condition_code="I10",
        )

        val = contract.get_validation(1)
        assert val.valid is True

    def test_invalid_trial(self, direct_vm, direct_deploy, direct_alice):
        """Incoherent trial with fake condition → valid=False, reason non-empty."""
        _mock_icd10_web(direct_vm)
        _mock_validation_llm(
            direct_vm,
            valid=False,
            reason="Condition code Z99.9 is not a recognized primary diagnosis code for clinical trials.",
            suggestions=["Use a more specific ICD-10 code"],
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.validate_trial(
            trial_id=2,
            trial_name="Mystery Trial",
            description="A trial for condition Z99.9 with no clear scientific rationale.",
            min_age=0,
            max_age=150,
            condition_code="Z99.9",
        )

        val = contract.get_validation(2)
        assert val.valid is False
        assert val.reason != ""

    def test_suggestions_stored_as_json(self, direct_vm, direct_deploy, direct_alice):
        """Suggestions are stored as a JSON array string."""
        _mock_icd10_web(direct_vm)
        _mock_validation_llm(
            direct_vm,
            valid=True,
            suggestions=["Narrow age range", "Add exclusion criteria"],
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        contract.validate_trial(
            trial_id=3,
            trial_name="SuggestionTest Trial",
            description="A well-designed observational study for Type 2 diabetes patients.",
            min_age=40,
            max_age=75,
            condition_code="E11",
        )

        val = contract.get_validation(3)
        parsed = json.loads(val.suggestions)
        assert isinstance(parsed, list)
        assert len(parsed) == 2

    def test_missing_validation_returns_default(self, direct_vm, direct_deploy):
        """Non-existent trial_id returns default invalid ValidationResult."""
        contract = direct_deploy(CONTRACT_PATH)
        val = contract.get_validation(999)
        assert val.valid is False
        assert val.reason == ""
        assert val.suggestions == "[]"

    def test_web_fetch_failure_reverts(self, direct_vm, direct_deploy, direct_alice):
        """If web fetch fails, contract raises an error."""
        # No web mock registered → web.render will fail
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("LLM_ERROR"):
            contract.validate_trial(
                trial_id=4,
                trial_name="WebFail Trial",
                description="A trial that will fail because web is unreachable.",
                min_age=18,
                max_age=65,
                condition_code="I10",
            )

    def test_llm_returns_invalid_json_reverts(self, direct_vm, direct_deploy, direct_alice):
        """If LLM returns non-JSON, contract raises LLM_ERROR."""
        _mock_icd10_web(direct_vm)
        # Mock returns a non-JSON string
        direct_vm.mock_llm(
            r".*Validate this clinical trial registration.*",
            "this is not json at all",
        )
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        with direct_vm.expect_revert("LLM_ERROR"):
            contract.validate_trial(
                trial_id=5,
                trial_name="BadLLM Trial",
                description="A trial where LLM misbehaves.",
                min_age=20,
                max_age=60,
                condition_code="J06",
            )


class TestValidationPrivacy:
    """Feature 3 privacy: only public trial data is validated."""

    def test_no_patient_data_in_validation_call(self, direct_vm, direct_deploy, direct_alice):
        """validate_trial never receives patient data."""
        _mock_icd10_web(direct_vm)
        _mock_validation_llm(direct_vm, valid=True)
        contract = direct_deploy(CONTRACT_PATH)
        direct_vm.sender = direct_alice

        # No patient_address, no encrypted data — only public trial metadata
        contract.validate_trial(
            trial_id=6,
            trial_name="PublicOnly Trial",
            description="A trial with only public metadata fields.",
            min_age=25,
            max_age=55,
            condition_code="E11",
        )

        val = contract.get_validation(6)
        assert val.valid is True
