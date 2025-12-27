/**
 * AegisCare Integration Test
 * Step-by-step feature testing
 */

import { expect } from "chai";
import hre from "hardhat";
import { AegisCare, AegisCare__factory } from "../typechain-types";

type SignerWithAddress = Awaited<ReturnType<typeof hre.ethers.getSigners>>[0];

describe("🚀 AegisCare - Step-by-Step Integration Tests", function () {
  let contract: AegisCare;
  let owner: SignerWithAddress;
  let trialSponsor: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;

  // Test data
  let trialId: number;
  let patient1Id: number;
  let patient2Id: number;

  beforeEach(async function () {
    [owner, trialSponsor, patient1, patient2] = await hre.ethers.getSigners();

    const AegisCareFactory = (await hre.ethers.getContractFactory(
      "AegisCare"
    )) as AegisCare__factory;
    contract = await AegisCareFactory.deploy();
    await contract.waitForDeployment();

    console.log("   ✓ Contract deployed to:", await contract.getAddress());
  });

  describe("1️⃣  PATIENT REGISTRATION FEATURE", function () {
    it("Should register a patient with encrypted medical data", async function () {
      console.log("\n   📝 Testing Patient Registration...");

      // Generate test patient data
      const age = 45;
      const gender = 1; // Male
      const bmiScore = 285; // 28.5 * 10
      const hasMedicalCondition = true;
      const conditionCode = 11; // E11 = Type 2 Diabetes

      console.log("   Patient Data:");
      console.log("   - Age:", age);
      console.log("   - Gender:", gender, "(Male)");
      console.log("   - BMI:", bmiScore / 10);
      console.log("   - Has Condition:", hasMedicalCondition);
      console.log("   - Condition Code:", conditionCode, "(E11 - Type 2 Diabetes)");

      // Note: In a real scenario, you would use fheClient to encrypt
      // For testing, we're using mock encrypted values
      const mockAgeHandle = ethers_zero_bytes32(0);
      const mockAgeProof = ethers_zero_bytes32(1);
      const mockGenderHandle = ethers_zero_bytes32(2);
      const mockGenderProof = ethers_zero_bytes32(3);
      const mockBMIHandle = ethers_zero_bytes32(4);
      const mockBMIProof = ethers_zero_bytes32(5);
      const mockConditionHandle = ethers_zero_bytes32(6);
      const mockConditionProof = ethers_zero_bytes32(7);
      const mockCodeHandle = ethers_zero_bytes32(8);
      const mockCodeProof = ethers_zero_bytes32(9);
      const mockPublicKeyHash = ethers_zero_bytes32(10);

      // Register patient
      const tx = await contract.connect(patient1).registerPatient(
        mockAgeHandle, mockAgeProof,
        mockGenderHandle, mockGenderProof,
        mockBMIHandle, mockBMIProof,
        mockConditionHandle, mockConditionProof,
        mockCodeHandle, mockCodeProof,
        mockPublicKeyHash
      );

      const receipt = await tx.wait();
      console.log("   ✓ Patient registered successfully");
      console.log("   - Gas used:", receipt?.gasUsed.toString());

      // Verify patient registration
      const patientInfo = await contract.getPatientInfo(patient1.address);
      patient1Id = Number(patientInfo.patientId);

      expect(patient1Id).to.be.greaterThan(0);
      console.log("   ✓ Patient ID:", patient1Id);
      console.log("   ✓ Public key hash:", patientInfo.publicKeyHash);
    });

    it("Should not allow duplicate patient registration", async function () {
      console.log("\n   📝 Testing Duplicate Registration Prevention...");

      const mockPublicKeyHash = ethers_zero_bytes32(10);

      await expect(
        contract.connect(patient1).registerPatient(
          ethers_zero_bytes32(0), ethers_zero_bytes32(1),
          ethers_zero_bytes32(2), ethers_zero_bytes32(3),
          ethers_zero_bytes32(4), ethers_zero_bytes32(5),
          ethers_zero_bytes32(6), ethers_zero_bytes32(7),
          ethers_zero_bytes32(8), ethers_zero_bytes32(9),
          mockPublicKeyHash
        )
      ).to.be.reverted;

      console.log("   ✓ Duplicate registration correctly blocked");
    });

    it("Should register multiple different patients", async function () {
      console.log("\n   📝 Testing Multiple Patient Registrations...");

      const mockPublicKeyHash = ethers_zero_bytes32(20);

      const tx = await contract.connect(patient2).registerPatient(
        ethers_zero_bytes32(0), ethers_zero_bytes32(1),
        ethers_zero_bytes32(2), ethers_zero_bytes32(3),
        ethers_zero_bytes32(4), ethers_zero_bytes32(5),
        ethers_zero_bytes32(6), ethers_zero_bytes32(7),
        ethers_zero_bytes32(8), ethers_zero_bytes32(9),
        mockPublicKeyHash
      );

      const receipt = await tx.wait();
      console.log("   ✓ Second patient registered");
      console.log("   - Gas used:", receipt?.gasUsed.toString());

      const patientInfo = await contract.getPatientInfo(patient2.address);
      patient2Id = Number(patientInfo.patientId);

      expect(patient2Id).to.equal(patient1Id + 1);
      console.log("   ✓ Patient IDs increment correctly:", patient1Id, "→", patient2Id);
    });
  });

  describe("2️⃣  CLINICAL TRIAL CREATION FEATURE", function () {
    it("Should create a clinical trial with encrypted criteria", async function () {
      console.log("\n   📝 Testing Clinical Trial Creation...");

      const trialName = "Diabetes Treatment Study 2025";
      const description = "Testing new Type 2 diabetes treatment";

      console.log("   Trial Details:");
      console.log("   - Name:", trialName);
      console.log("   - Description:", description);
      console.log("   - Sponsor:", trialSponsor.address);

      // Create trial with encrypted criteria
      const tx = await contract.connect(trialSponsor).registerTrial(
        trialName,
        description,
        ethers_zero_bytes32(0), ethers_zero_bytes32(1), // minAge
        ethers_zero_bytes32(2), ethers_zero_bytes32(3), // maxAge
        ethers_zero_bytes32(4), ethers_zero_bytes32(5), // requiredGender
        ethers_zero_bytes32(6), ethers_zero_bytes32(7), // minBMI
        ethers_zero_bytes32(8), ethers_zero_bytes32(9), // maxBMI
        ethers_zero_bytes32(10), ethers_zero_bytes32(11), // hasCondition
        ethers_zero_bytes32(12), ethers_zero_bytes32(13), // conditionCode
      );

      const receipt = await tx.wait();
      console.log("   ✓ Trial created successfully");
      console.log("   - Gas used:", receipt?.gasUsed.toString());

      // Get trial ID from event
      const event = receipt?.logs.find(
        (log: any) => log.eventName === "TrialRegistered"
      );
      if (event) {
        trialId = Number(event.args?.trialId);
        console.log("   ✓ Trial ID:", trialId);
      } else {
        // Fallback: get current trial count
        trialId = Number(await contract.trialCount());
        console.log("   ✓ Trial ID:", trialId);
      }

      // Verify trial info
      const trialInfo = await contract.getTrialInfo(trialId);
      expect(trialInfo.trialName).to.equal(trialName);
      expect(trialInfo.sponsor).to.equal(trialSponsor.address);
      expect(trialInfo.isActive).to.be.true;

      console.log("   ✓ Trial details verified");
      console.log("   - Active:", trialInfo.isActive);
      console.log("   - Participant count:", trialInfo.participantCount.toString());
    });

    it("Should retrieve trial public information correctly", async function () {
      console.log("\n   📝 Testing Trial Info Retrieval...");

      const publicInfo = await contract.getTrialPublicInfo(trialId);

      expect(publicInfo.trialName).to.equal("Diabetes Treatment Study 2025");
      expect(publicInfo.sponsor).to.equal(trialSponsor.address);
      expect(publicInfo.isActive).to.be.true;

      console.log("   ✓ Public info retrieved correctly");
      console.log("   - Trial Name:", publicInfo.trialName);
      console.log("   - Description:", publicInfo.description);
      console.log("   - Sponsor:", publicInfo.sponsor);
      console.log("   - Active:", publicInfo.isActive);
    });

    it("Should track sponsor trial count correctly", async function () {
      console.log("\n   📝 Testing Sponsor Trial Count...");

      const count = await contract.getSponsorTrialCount(trialSponsor.address);
      expect(Number(count)).to.equal(1);

      console.log("   ✓ Sponsor has", count.toString(), "trial(s)");
    });
  });

  describe("3️⃣  ELIGIBILITY COMPUTATION FEATURE", function () {
    it("Should compute eligibility for patient-trial pair", async function () {
      console.log("\n   📝 Testing Eligibility Computation...");
      console.log("   - Trial ID:", trialId);
      console.log("   - Patient:", patient1.address);
      console.log("   - Patient ID:", patient1Id);

      const tx = await contract.computeEligibility(trialId, patient1.address);
      const receipt = await tx.wait();

      console.log("   ✓ Eligibility computed successfully");
      console.log("   - Gas used:", receipt?.gasUsed.toString());

      // Verify participant count increased
      const trialInfo = await contract.getTrialInfo(trialId);
      expect(Number(trialInfo.participantCount)).to.equal(1);
      console.log("   ✓ Trial participant count:", trialInfo.participantCount.toString());
    });

    it("Should allow patient to check their own eligibility", async function () {
      console.log("\n   📝 Testing Patient Self-Check...");

      const tx = await contract.connect(patient1).checkEligibility(trialId);
      const receipt = await tx.wait();

      console.log("   ✓ Patient eligibility check completed");
      console.log("   - Gas used:", receipt?.gasUsed.toString());

      // Verify eligibility check was recorded
      const checks = await contract.patientEligibilityChecks(patient1.address);
      expect(checks.length).to.be.greaterThan(0);
      console.log("   ✓ Patient has", checks.length.toString(), "eligibility check(s)");
    });

    it("Should prevent eligibility computation for non-existent patient", async function () {
      console.log("\n   📝 Testing Non-Existent Patient Protection...");

      const nonExistentPatient = owner.address; // Owner didn't register as patient

      await expect(
        contract.computeEligibility(trialId, nonExistentPatient)
      ).to.be.revertedWithCustomError(contract, "PatientNotFound");

      console.log("   ✓ Non-existent patient correctly rejected");
    });

    it("Should prevent eligibility check for non-existent trial", async function () {
      console.log("\n   📝 Testing Non-Existent Trial Protection...");

      const nonExistentTrialId = 99999;

      await expect(
        contract.connect(patient1).checkEligibility(nonExistentTrialId)
      ).to.be.revertedWithCustomError(contract, "TrialNotFound");

      console.log("   ✓ Non-existent trial correctly rejected");
    });
  });

  describe("4️⃣  RESULT DECRYPTION FEATURE", function () {
    it("Should allow patient to retrieve their own eligibility result", async function () {
      console.log("\n   📝 Testing Result Retrieval...");

      // Get eligibility result
      const result = await contract.connect(patient1).getEligibilityResult(trialId, patient1.address);

      console.log("   ✓ Eligibility result retrieved");
      console.log("   - Result type: encrypted boolean (ebool)");
    });

    it("Should prevent others from accessing patient results", async function () {
      console.log("\n   📝 Testing Access Control...");

      // Try to access another patient's result
      await expect(
        contract.connect(patient2).getEligibilityResult(trialId, patient1.address)
      ).to.be.revertedWithCustomError(contract, "NotAuthorized");

      console.log("   ✓ Unauthorized access correctly blocked");
    });
  });

  describe("5️⃣  VIEW FUNCTIONS FEATURE", function () {
    it("Should retrieve patient registration status", async function () {
      console.log("\n   📝 Testing Patient Status Checks...");

      const isRegistered1 = await contract.isPatientRegistered(patient1.address);
      const isRegistered2 = await contract.isPatientRegistered(patient2.address);
      const isRegisteredOwner = await contract.isPatientRegistered(owner.address);

      expect(isRegistered1).to.be.true;
      expect(isRegistered2).to.be.true;
      expect(isRegisteredOwner).to.be.false;

      console.log("   ✓ Patient 1 registered:", isRegistered1);
      console.log("   ✓ Patient 2 registered:", isRegistered2);
      console.log("   ✓ Owner registered:", isRegisteredOwner);
    });

    it("Should retrieve all trial information", async function () {
      console.log("\n   📝 Testing Complete Trial Info...");

      const info = await contract.getTrialInfo(trialId);

      console.log("   Trial Information:");
      console.log("   - ID:", info.trialId.toString());
      console.log("   - Name:", info.trialName);
      console.log("   - Description:", info.description);
      console.log("   - Sponsor:", info.sponsor);
      console.log("   - Active:", info.isActive);
      console.log("   - Created At:", new Date(Number(info.createdAt) * 1000).toISOString());
      console.log("   - Participants:", info.participantCount.toString());

      expect(info.trialId).to.equal(trialId);
      expect(info.isActive).to.be.true;
      expect(Number(info.participantCount)).to.be.greaterThan(0);
    });

    it("Should retrieve all patient information", async function () {
      console.log("\n   📝 Testing Complete Patient Info...");

      const info = await contract.getPatientInfo(patient1.address);

      console.log("   Patient Information:");
      console.log("   - ID:", info.patientId.toString());
      console.log("   - Public Key Hash:", info.publicKeyHash);
      console.log("   - Registered At:", new Date(Number(info.registeredAt) * 1000).toISOString());

      expect(Number(info.patientId)).to.equal(patient1Id);
      expect(info.publicKeyHash).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("6️⃣  ADMIN FUNCTIONS FEATURE", function () {
    it("Should allow owner to pause the contract", async function () {
      console.log("\n   📝 Testing Contract Pause...");

      await contract.pause();
      expect(await contract.paused()).to.be.true;

      console.log("   ✓ Contract paused successfully");

      // Verify operations are blocked when paused
      await expect(
        contract.connect(patient1).checkEligibility(trialId)
      ).to.be.revertedWithCustomError(contract, "ContractPaused");

      console.log("   ✓ Operations blocked when paused");
    });

    it("Should allow owner to unpause the contract", async function () {
      console.log("\n   📝 Testing Contract Unpause...");

      await contract.unpause();
      expect(await contract.paused()).to.be.false;

      console.log("   ✓ Contract unpaused successfully");
    });

    it("Should allow trial sponsor to deactivate their trial", async function () {
      console.log("\n   📝 Testing Trial Deactivation...");

      await contract.connect(trialSponsor).deactivateTrial(trialId);

      const trialInfo = await contract.getTrialInfo(trialId);
      expect(trialInfo.isActive).to.be.false;

      console.log("   ✓ Trial deactivated successfully");
      console.log("   - Active status:", trialInfo.isActive);
    });

    it("Should prevent non-sponsor from deactivating trial", async function () {
      console.log("\n   📝 Testing Sponsor Authorization...");

      // Reactivate trial first
      // Note: In production, we'd need a reactivate function

      // Try to deactivate as non-sponsor
      await expect(
        contract.connect(patient1).deactivateTrial(trialId)
      ).to.be.revertedWithCustomError(contract, "NotAuthorized");

      console.log("   ✓ Unauthorized deactivation correctly blocked");
    });

    it("Should allow owner to transfer ownership", async function () {
      console.log("\n   📝 Testing Ownership Transfer...");

      const newOwner = patient1.address;
      await contract.transferOwnership(newOwner);

      expect(await contract.owner()).to.equal(newOwner);

      console.log("   ✓ Ownership transferred to:", newOwner);

      // Verify old owner can no longer use owner functions
      await expect(
        contract.connect(owner).pause()
      ).to.be.revertedWithCustomError(contract, "UnauthorizedAccess");

      console.log("   ✓ Old owner access correctly revoked");

      // Transfer back for cleanup
      await contract.connect(patient1).transferOwnership(owner.address);
      console.log("   ✓ Ownership restored");
    });
  });

  describe("7️⃣  END-TO-END INTEGRATION", function () {
    it("Should handle complete patient-trial matching workflow", async function () {
      console.log("\n   🎯 Testing Complete Workflow...");

      console.log("\n   Step 1: Register new patient");
      const newPatient = owner;
      const mockPKH = ethers_zero_bytes32(100);

      await contract.connect(newPatient).registerPatient(
        ethers_zero_bytes32(0), ethers_zero_bytes32(1),
        ethers_zero_bytes32(2), ethers_zero_bytes32(3),
        ethers_zero_bytes32(4), ethers_zero_bytes32(5),
        ethers_zero_bytes32(6), ethers_zero_bytes32(7),
        ethers_zero_bytes32(8), ethers_zero_bytes32(9),
        mockPKH
      );
      console.log("   ✓ Patient registered");

      console.log("\n   Step 2: Create new trial");
      const tx = await contract.connect(trialSponsor).registerTrial(
        "Cardiovascular Study",
        "Heart health research",
        ethers_zero_bytes32(0), ethers_zero_bytes32(1),
        ethers_zero_bytes32(2), ethers_zero_bytes32(3),
        ethers_zero_bytes32(4), ethers_zero_bytes32(5),
        ethers_zero_bytes32(6), ethers_zero_bytes32(7),
        ethers_zero_bytes32(8), ethers_zero_bytes32(9),
        ethers_zero_bytes32(10), ethers_zero_bytes32(11),
        ethers_zero_bytes32(12), ethers_zero_bytes32(13),
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => log.eventName === "TrialRegistered");
      const newTrialId = Number(event?.args?.trialId);
      console.log("   ✓ Trial created with ID:", newTrialId);

      console.log("\n   Step 3: Compute eligibility");
      await contract.computeEligibility(newTrialId, newPatient.address);
      console.log("   ✓ Eligibility computed");

      console.log("\n   Step 4: Retrieve result");
      await contract.connect(newPatient).getEligibilityResult(newTrialId, newPatient.address);
      console.log("   ✓ Result retrieved by patient");

      console.log("\n   Step 5: Verify all data");
      const trialInfo = await contract.getTrialInfo(newTrialId);
      const patientInfo = await contract.getPatientInfo(newPatient.address);
      const sponsorCount = await contract.getSponsorTrialCount(trialSponsor.address);

      expect(trialInfo.isActive).to.be.true;
      expect(Number(patientInfo.patientId)).to.be.greaterThan(0);
      expect(Number(sponsorCount)).to.equal(2); // Original trial + new trial

      console.log("   ✓ All data verified");
      console.log("\n   🎉 Complete workflow successful!");
    });
  });
});

// Helper function to generate unique bytes32 values
function ethers_zero_bytes32(seed: number): string {
  const value = hre.ethers.zeroPadValue(hre.ethers.toBytes(seed), 32);
  return hre.ethers.hexlify(value);
}
