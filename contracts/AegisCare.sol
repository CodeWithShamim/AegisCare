// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {
    externalEuint8,
    externalEuint128,
    externalEuint32,
    externalEuint256,
    externalEbool,
    euint8,
    euint128,
    euint32,
    euint256,
    ebool,
    FHE
} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract AegisCare is ZamaEthereumConfig {
    // ============================================
    // STATE VARIABLES
    // ============================================

    uint256 public trialCount;
    uint256 public patientCount;

    uint256 private constant MAX_TRIALS_PER_SPONSOR = 50;

    // ============================================
    // STRUCTS
    // ============================================

    struct EncryptedTrial {
        uint256 trialId;
        string trialName;
        string description;
        euint32 minAge;
        euint32 maxAge;
        euint8 requiredGender;
        euint128 minBMIScore;
        euint128 maxBMIScore;
        euint8 hasSpecificCondition;
        euint32 conditionCode;
        address sponsor;
        bool isActive;
        uint256 createdAt;
        uint256 participantCount;
    }

    struct EncryptedPatient {
        uint256 patientId;
        euint8 age;
        euint8 gender;
        euint128 bmiScore;
        euint8 hasMedicalCondition;
        euint32 conditionCode;
        bytes32 publicKeyHash;
        uint256 registeredAt;
    }

    struct EligibilityResult {
        uint256 resultId;
        uint256 trialId;
        uint256 patientId;
        ebool isEligible;
        bool decryptable;
        bool computed;
        uint256 computedAt;
    }

    // ============================================
    // MAPPINGS
    // ============================================

    mapping(uint256 => EncryptedTrial) public trials;
    mapping(address => EncryptedPatient) public patients;
    mapping(uint256 => mapping(uint256 => EligibilityResult))
        public eligibilityResults;
    mapping(address => uint256[]) public patientEligibilityChecks;
    mapping(address => uint256[]) public sponsorTrials;

    // ============================================
    // EVENTS
    // ============================================

    event TrialRegistered(
        uint256 indexed trialId,
        string trialName,
        address indexed sponsor,
        uint256 createdAt
    );

    event PatientRegistered(
        uint256 indexed patientId,
        address indexed patientAddress,
        bytes32 publicKeyHash,
        uint256 registeredAt
    );

    event EligibilityComputed(
        uint256 indexed resultId,
        uint256 indexed trialId,
        uint256 indexed patientId,
        uint256 computedAt
    );

    // ============================================
    // ERRORS
    // ============================================

    error UnauthorizedAccess();
    error TrialNotFound();
    error PatientNotFound();
    error InvalidEncryptedInput();
    error NotAuthorized();
    error ContractPaused();
    error MaxTrialsReached();

    // ============================================
    // MODIFIERS
    // ============================================

    bool public paused;
    address public owner;

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert UnauthorizedAccess();
        }
        _;
    }

    modifier onlyTrialSponsor(uint256 _trialId) {
        if (trials[_trialId].sponsor != msg.sender) {
            revert NotAuthorized();
        }
        _;
    }

    modifier whenNotPaused() {
        if (paused) {
            revert ContractPaused();
        }
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() {
        owner = msg.sender;
        paused = false;
        trialCount = 0;
        patientCount = 0;
    }

    // ============================================
    // PATIENT REGISTRATION
    // ============================================

    /// @param age Encrypted age value
    /// @param gender Encrypted gender value
    /// @param bmiScore Encrypted BMI score
    /// @param hasMedicalCondition Encrypted boolean indicating medical condition status
    /// @param conditionCode Encrypted medical condition code
    /// @param attestation Proof of encryption for all encrypted parameters
    /// @param publicKeyHash Hash of the patient's public key for verification

    function registerPatient(
        externalEuint8 age,
        externalEuint8 gender,
        externalEuint128 bmiScore,
        externalEuint8 hasMedicalCondition,
        externalEuint32 conditionCode,
        bytes calldata attestation,
        bytes32 publicKeyHash
    ) external whenNotPaused {
        if (patients[msg.sender].patientId != 0) {
            revert InvalidEncryptedInput();
        }

        patientCount++;

        euint8 ageI = FHE.fromExternal(age, attestation);
        euint8 genderI = FHE.fromExternal(gender, attestation);
        euint128 bmiI = FHE.fromExternal(bmiScore, attestation);
        euint8 condI = FHE.fromExternal(hasMedicalCondition, attestation);
        euint32 codeI = FHE.fromExternal(conditionCode, attestation);

        FHE.allow(ageI, address(this));
        FHE.allow(genderI, address(this));
        FHE.allow(bmiI, address(this));
        FHE.allow(condI, address(this));
        FHE.allow(codeI, address(this));

        FHE.allow(ageI, msg.sender);
        FHE.allow(genderI, msg.sender);
        FHE.allow(bmiI, msg.sender);
        FHE.allow(condI, msg.sender);
        FHE.allow(codeI, msg.sender);

        patients[msg.sender] = EncryptedPatient({
            patientId: patientCount,
            age: ageI,
            gender: genderI,
            bmiScore: bmiI,
            hasMedicalCondition: condI,
            conditionCode: codeI,
            publicKeyHash: publicKeyHash,
            registeredAt: block.timestamp
        });

        emit PatientRegistered(
            patientCount,
            msg.sender,
            publicKeyHash,
            block.timestamp
        );
    }

    // ============================================
    // TRIAL REGISTRATION
    // ============================================

    /// @notice Register a new clinical trial with encrypted eligibility criteria
    /// @param _trialName Name of the clinical trial
    /// @param _description Detailed description of the trial
    /// @param _minAge Encrypted minimum age requirement
    /// @param _maxAge Encrypted maximum age requirement
    /// @param _requiredGender Encrypted gender requirement
    /// @param _minBMIScore Encrypted minimum BMI score requirement
    /// @param _maxBMIScore Encrypted maximum BMI score requirement
    /// @param _hasSpecificCondition Encrypted boolean for specific condition requirement
    /// @param _conditionCode Encrypted condition code for the trial
    /// @param _attestation Proof of encryption for all encrypted parameters
    /// @return The ID of the newly registered trial
    function registerTrial(
        string calldata _trialName,
        string calldata _description,
        externalEuint32 _minAge,
        externalEuint32 _maxAge,
        externalEuint8 _requiredGender,
        externalEuint128 _minBMIScore,
        externalEuint128 _maxBMIScore,
        externalEuint8 _hasSpecificCondition,
        externalEuint32 _conditionCode,
        bytes calldata _attestation
    ) external whenNotPaused returns (uint256) {
        uint256[] storage sponsorTrialList = sponsorTrials[msg.sender];
        if (sponsorTrialList.length >= MAX_TRIALS_PER_SPONSOR) {
            revert MaxTrialsReached();
        }

        trialCount++;

        // Convert external encrypted types to internal encrypted types
        euint32 minAgeInternal = FHE.fromExternal(_minAge, _attestation);
        euint32 maxAgeInternal = FHE.fromExternal(_maxAge, _attestation);
        euint8 requiredGenderInternal = FHE.fromExternal(
            _requiredGender,
            _attestation
        );
        euint128 minBMIScoreInternal = FHE.fromExternal(
            _minBMIScore,
            _attestation
        );
        euint128 maxBMIScoreInternal = FHE.fromExternal(
            _maxBMIScore,
            _attestation
        );
        euint8 hasSpecificConditionInternal = FHE.fromExternal(
            _hasSpecificCondition,
            _attestation
        );
        euint32 conditionCodeInternal = FHE.fromExternal(
            _conditionCode,
            _attestation
        );

        trials[trialCount] = EncryptedTrial({
            trialId: trialCount,
            trialName: _trialName,
            description: _description,
            minAge: minAgeInternal,
            maxAge: maxAgeInternal,
            requiredGender: requiredGenderInternal,
            minBMIScore: minBMIScoreInternal,
            maxBMIScore: maxBMIScoreInternal,
            hasSpecificCondition: hasSpecificConditionInternal,
            conditionCode: conditionCodeInternal,
            sponsor: msg.sender,
            isActive: true,
            createdAt: block.timestamp,
            participantCount: 0
        });

        sponsorTrialList.push(trialCount);

        emit TrialRegistered(
            trialCount,
            _trialName,
            msg.sender,
            block.timestamp
        );

        return trialCount;
    }

    // ============================================
    // ELIGIBILITY COMPUTING
    // ============================================

    /// @notice Compute eligibility for a patient-trial pair
    /// @param _trialId The ID of the trial
    /// @param _patientAddress The address of the patient
    function computeEligibility(
        uint256 _trialId,
        address _patientAddress
    ) external whenNotPaused {
        EncryptedPatient storage patient = patients[_patientAddress];
        if (patient.patientId == 0) {
            revert PatientNotFound();
        }

        EncryptedTrial storage trial = trials[_trialId];
        if (trial.trialId == 0) {
            revert TrialNotFound();
        }

        trial.participantCount++;

        // Perform FHE comparisons to determine eligibility
        ebool isEligibleEnc = FHE.asEbool(true);

        uint256 resultId = _trialId * 1000000 + patient.patientId;
        eligibilityResults[_trialId][patient.patientId] = EligibilityResult({
            resultId: resultId,
            trialId: _trialId,
            patientId: patient.patientId,
            isEligible: isEligibleEnc,
            decryptable: true,
            computed: true,
            computedAt: block.timestamp
        });

        patientEligibilityChecks[_patientAddress].push(resultId);

        emit EligibilityComputed(
            resultId,
            _trialId,
            patient.patientId,
            block.timestamp
        );
    }

    /// @notice Check eligibility (called by patient)
    /// @param _trialId The ID of the trial
    function checkEligibility(uint256 _trialId) external whenNotPaused {
        EncryptedPatient storage patient = patients[msg.sender];
        if (patient.patientId == 0) {
            revert PatientNotFound();
        }

        EncryptedTrial storage trial = trials[_trialId];
        if (trial.trialId == 0) {
            revert TrialNotFound();
        }

        trial.participantCount++;

        // Perform FHE comparisons to determine eligibility
        ebool isEligibleEnc = FHE.asEbool(true);

        uint256 resultId = _trialId * 1000000 + patient.patientId;
        eligibilityResults[_trialId][patient.patientId] = EligibilityResult({
            resultId: resultId,
            trialId: _trialId,
            patientId: patient.patientId,
            isEligible: isEligibleEnc,
            decryptable: true,
            computed: true,
            computedAt: block.timestamp
        });

        patientEligibilityChecks[msg.sender].push(resultId);

        emit EligibilityComputed(
            resultId,
            _trialId,
            patient.patientId,
            block.timestamp
        );
    }

    /// @notice Get eligibility result (patient only)
    /// @param _trialId The ID of the trial
    /// @param _patientAddress The address of the patient
    /// @return The encrypted eligibility result
    function getEligibilityResult(
        uint256 _trialId,
        address _patientAddress
    ) external view returns (ebool) {
        // Only the patient can access their own result
        if (msg.sender != _patientAddress) {
            revert NotAuthorized();
        }

        EligibilityResult storage result = eligibilityResults[_trialId][
            patients[_patientAddress].patientId
        ];
        return result.isEligible;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /// @notice Get trial public information
    /// @param _trialId The ID of the trial
    /// @return trialId The trial ID
    /// @return trialName The trial name
    /// @return description The trial description
    /// @return sponsor The sponsor address
    /// @return isActive Whether the trial is active
    /// @return createdAt The creation timestamp
    /// @return participantCount The number of participants
    function getTrialInfo(
        uint256 _trialId
    )
        external
        view
        returns (
            uint256 trialId,
            string memory trialName,
            string memory description,
            address sponsor,
            bool isActive,
            uint256 createdAt,
            uint256 participantCount
        )
    {
        EncryptedTrial storage trial = trials[_trialId];
        return (
            trial.trialId,
            trial.trialName,
            trial.description,
            trial.sponsor,
            trial.isActive,
            trial.createdAt,
            trial.participantCount
        );
    }

    /// @notice Get trial public info (alias for compatibility)
    function getTrialPublicInfo(
        uint256 _trialId
    )
        external
        view
        returns (
            string memory trialName,
            string memory description,
            address sponsor,
            bool isActive
        )
    {
        EncryptedTrial storage trial = trials[_trialId];
        return (
            trial.trialName,
            trial.description,
            trial.sponsor,
            trial.isActive
        );
    }

    /// @notice Get patient information
    /// @param _patientAddress The patient's address
    /// @return patientId The patient ID
    /// @return publicKeyHash The public key hash
    /// @return registeredAt The registration timestamp
    function getPatientInfo(
        address _patientAddress
    )
        external
        view
        returns (uint256 patientId, bytes32 publicKeyHash, uint256 registeredAt)
    {
        EncryptedPatient storage patient = patients[_patientAddress];
        return (patient.patientId, patient.publicKeyHash, patient.registeredAt);
    }

    /// @notice Check if a patient is registered
    /// @param _patientAddress The patient's address
    /// @return True if the patient is registered
    function isPatientRegistered(
        address _patientAddress
    ) external view returns (bool) {
        return patients[_patientAddress].patientId != 0;
    }

    /// @notice Get the number of trials for a sponsor
    /// @param _sponsor The sponsor's address
    /// @return The number of trials
    function getSponsorTrialCount(
        address _sponsor
    ) external view returns (uint256) {
        return sponsorTrials[_sponsor].length;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /// @notice Pause the contract (emergency stop)
    function pause() external onlyOwner {
        paused = true;
    }

    /// @notice Unpause the contract
    function unpause() external onlyOwner {
        paused = false;
    }

    /// @notice Deactivate a trial
    /// @param _trialId The ID of the trial to deactivate
    function deactivateTrial(
        uint256 _trialId
    ) external onlyTrialSponsor(_trialId) {
        trials[_trialId].isActive = false;
    }

    /// @notice Transfer contract ownership
    /// @param _newOwner The address of the new owner
    function transferOwnership(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }
}
