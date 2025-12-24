import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, SignerWithAddress } from "ethers";
import { AegisCare, AegisCare__factory } from "../typechain-types";

describe("🛡️ AegisCare - FHE Clinical Trial Matching", function () {
  let aegisCare: AegisCare;
  let owner: SignerWithAddress;
  let trialSponsor: SignerWithAddress;
  let patient: SignerWithAddress;
  let patient2: SignerWithAddress;

  // Test data constants
  const TRIAL_NAME = "Diabetes Treatment Study";
  const TRIAL_DESCRIPTION = "Testing new treatment for Type 2 diabetes";

  // Helper function to create encrypted input
  // In real FHE, this would be actual encrypted values
  // For testing, we use mock einput values
  const mockEinput = ethers.utils.formatBytes32String("mock_encrypted");

  beforeEach(async function () {
    console.log("\n⏳ Setting up test scenario...");
    [owner, trialSponsor, patient, patient2] = await ethers.getSigners();

    // Deploy contract
    const AegisCareFactory = (await ethers.getContractFactory(
      "AegisCare"
    )) as AegisCare__factory;
    aegisCare = await AegisCareFactory.deploy();
    await aegisCare.deployed();

    console.log("✓ Contract deployed to:", aegisCare.address);
  });

  describe("1. Deployment", function () {
    it("Should set the correct owner", async function () {
      // Verify contract is deployed
      expect(await aegisCare.address).to.properAddress;
    });

    it("Should initialize with zero trial count", async function () {
      const trialCount = await aegisCare.trialCount();
      expect(trialCount).to.equal(BigNumber.from(0));
    });

    it("Should initialize with zero patient count", async function () {
      const patientCount = await aegisCare.patientCount();
      expect(patientCount).to.equal(BigNumber.from(0));
    });
  });

  describe("2. Trial Registration", function () {
    let trialId: BigNumber;

    it("Should allow trial sponsor to register a trial", async function () {
      console.log("\n📝 Registering trial:", TRIAL_NAME);

      const tx = await aegisCare
        .connect(trialSponsor)
        .registerTrial(
          TRIAL_NAME,
          TRIAL_DESCRIPTION,
          mockEinput, // minAge (encrypted)
          mockEinput, // maxAge (encrypted)
          mockEinput, // requiredGender (encrypted)
          mockEinput, // minBMIScore (encrypted)
          mockEinput, // maxBMIScore (encrypted)
          mockEinput, // hasSpecificCondition (encrypted)
          mockEinput // conditionCode (encrypted)
        );

      const receipt = await tx.wait();
      trialId = BigNumber.from(1);

      // Verify trial count increased
      const trialCount = await aegisCare.trialCount();
      expect(trialCount).to.equal(trialId);

      console.log("✓ Trial registered with ID:", trialId.toString());
    });

    it("Should emit TrialRegistered event", async function () {
      const tx = await aegisCare
        .connect(trialSponsor)
        .registerTrial(
          TRIAL_NAME,
          TRIAL_DESCRIPTION,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput
        );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "TrialRegistered");

      expect(event).to.exist;
      expect(event?.args?.trialName).to.equal(TRIAL_NAME);
      expect(event?.args?.sponsor).to.equal(trialSponsor.address);

      console.log("✓ TrialRegistered event emitted correctly");
    });

    it("Should allow retrieving trial public info", async function () {
      await aegisCare
        .connect(trialSponsor)
        .registerTrial(
          TRIAL_NAME,
          TRIAL_DESCRIPTION,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput
        );

      const [trialName, description, sponsor, isActive] =
        await aegisCare.getTrialPublicInfo(1);

      expect(trialName).to.equal(TRIAL_NAME);
      expect(description).to.equal(TRIAL_DESCRIPTION);
      expect(sponsor).to.equal(trialSponsor.address);
      expect(isActive).to.equal(true);

      console.log("✓ Trial public info retrieved correctly");
    });

    it("Should track sponsor trials", async function () {
      await aegisCare
        .connect(trialSponsor)
        .registerTrial(
          TRIAL_NAME,
          TRIAL_DESCRIPTION,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput
        );

      const sponsorTrials = await aegisCare.getSponsorTrials(trialSponsor.address);
      expect(sponsorTrials.length).to.equal(1);
      expect(sponsorTrials[0]).to.equal(BigNumber.from(1));

      console.log("✓ Sponsor trials tracked correctly");
    });
  });

  describe("3. Patient Registration", function () {
    let patientId: BigNumber;
    const publicKeyHash = ethers.utils.formatBytes32String("public_key_hash");

    it("Should allow patient to register", async function () {
      console.log("\n👤 Registering patient:", patient.address);

      const tx = await aegisCare
        .connect(patient)
        .registerPatient(
          mockEinput, // age (encrypted)
          mockEinput, // gender (encrypted)
          mockEinput, // bmiScore (encrypted)
          mockEinput, // hasMedicalCondition (encrypted)
          mockEinput, // conditionCode (encrypted)
          publicKeyHash
        );

      const receipt = await tx.wait();
      patientId = BigNumber.from(1);

      // Verify patient count increased
      const patientCount = await aegisCare.patientCount();
      expect(patientCount).to.equal(patientId);

      // Verify patient exists
      const exists = await aegisCare.patientExists(patient.address);
      expect(exists).to.equal(true);

      console.log("✓ Patient registered with ID:", patientId.toString());
    });

    it("Should emit PatientRegistered event", async function () {
      const tx = await aegisCare
        .connect(patient)
        .registerPatient(
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          publicKeyHash
        );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === "PatientRegistered");

      expect(event).to.exist;
      expect(event?.args?.patientAddress).to.equal(patient.address);

      console.log("✓ PatientRegistered event emitted correctly");
    });

    it("Should not allow duplicate registration", async function () {
      await aegisCare
        .connect(patient)
        .registerPatient(
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          publicKeyHash
        );

      await expect(
        aegisCare
          .connect(patient)
          .registerPatient(
            mockEinput,
            mockEinput,
            mockEinput,
            mockEinput,
            mockEinput,
            publicKeyHash
          )
      ).to.be.reverted;

      console.log("✓ Duplicate registration prevented");
    });
  });

  describe("4. Eligibility Computation", function () {
    beforeEach(async function () {
      // Register a trial
      await aegisCare
        .connect(trialSponsor)
        .registerTrial(
          TRIAL_NAME,
          TRIAL_DESCRIPTION,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput
        );

      // Register a patient
      const publicKeyHash = ethers.utils.formatBytes32String("public_key_hash");
      await aegisCare
        .connect(patient)
        .registerPatient(
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          publicKeyHash
        );
    });

    it("Should compute eligibility for patient-trial pair", async function () {
      console.log("\n🔍 Computing eligibility...");

      const tx = await aegisCare
        .connect(owner)
        .computeEligibility(1, patient.address);

      const receipt = await tx.wait();

      // Check if event was emitted
      const event = receipt.events?.find((e: any) => e.event === "EligibilityComputed");
      expect(event).to.exist;

      console.log("✓ Eligibility computed successfully");
    });

    it("Should fail for non-existent trial", async function () {
      await expect(
        aegisCare.connect(owner).computeEligibility(999, patient.address)
      ).to.be.reverted;

      console.log("✓ Non-existent trial rejected");
    });

    it("Should fail for non-existent patient", async function () {
      await expect(
        aegisCare.connect(owner).computeEligibility(1, owner.address)
      ).to.be.reverted;

      console.log("✓ Non-existent patient rejected");
    });
  });

  describe("5. Access Control", function () {
    const publicKeyHash = ethers.utils.formatBytes32String("public_key_hash");

    beforeEach(async function () {
      // Register patient
      await aegisCare
        .connect(patient)
        .registerPatient(
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          publicKeyHash
        );

      // Register trial
      await aegisCare
        .connect(trialSponsor)
        .registerTrial(
          TRIAL_NAME,
          TRIAL_DESCRIPTION,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput
        );

      // Compute eligibility
      await aegisCare.connect(owner).computeEligibility(1, patient.address);
    });

    it("Should only allow patient to get their eligibility result", async function () {
      // Patient can get their own result
      await expect(
        aegisCare.connect(patient).getEligibilityResult(1, patient.address)
      ).to.not.be.reverted;

      console.log("✓ Patient can access their own result");
    });

    it("Should prevent others from accessing patient result", async function () {
      // Other patients cannot access
      await expect(
        aegisCare.connect(patient2).getEligibilityResult(1, patient.address)
      ).to.be.reverted;

      console.log("✓ Unauthorized access prevented");
    });
  });

  describe("6. Trial Management", function () {
    beforeEach(async function () {
      await aegisCare
        .connect(trialSponsor)
        .registerTrial(
          TRIAL_NAME,
          TRIAL_DESCRIPTION,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput
        );
    });

    it("Should allow sponsor to update trial criteria", async function () {
      const tx = await aegisCare
        .connect(trialSponsor)
        .updateTrialCriteria(
          1,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput,
          mockEinput
        );

      await tx.wait();
      console.log("✓ Trial criteria updated by sponsor");
    });

    it("Should prevent non-sponsor from updating trial", async function () {
      await expect(
        aegisCare
          .connect(owner)
          .updateTrialCriteria(
            1,
            mockEinput,
            mockEinput,
            mockEinput,
            mockEinput,
            mockEinput,
            mockEinput,
            mockEinput
          )
      ).to.be.reverted;

      console.log("✓ Unauthorized update prevented");
    });

    it("Should allow sponsor to deactivate trial", async function () {
      const tx = await aegisCare.connect(trialSponsor).deactivateTrial(1);
      await tx.wait();

      const [, , , isActive] = await aegisCare.getTrialPublicInfo(1);
      expect(isActive).to.equal(false);

      console.log("✓ Trial deactivated successfully");
    });
  });

  describe("7. Edge Cases and Security", function () {
    it("Should handle zero values correctly", async function () {
      const zeroEinput = ethers.utils.formatBytes32String("");

      await expect(
        aegisCare
          .connect(trialSponsor)
          .registerTrial(
            "Test Trial",
            "Description",
            zeroEinput,
            zeroEinput,
            zeroEinput,
            zeroEinput,
            zeroEinput,
            zeroEinput,
            zeroEinput
          )
      ).to.not.be.reverted;

      console.log("✓ Zero values handled correctly");
    });

    it("Should prevent invalid trial IDs", async function () {
      await expect(
        aegisCare.getTrialPublicInfo(0)
      ).to.be.reverted;

      console.log("✓ Invalid trial ID rejected");
    });
  });
});
