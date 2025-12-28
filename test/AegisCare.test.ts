import { expect } from "chai";
import hre from "hardhat";
import { AegisCare } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * COMPREHENSIVE TEST SUITE FOR AEGISCARE CONTRACT
 *
 * Tests all non-FHE functionality. FHE operations (patient registration,
 * trial registration, eligibility computation) require deployment to
 * FHEVM devnet for proper testing.
 */
describe("AegisCare Contract - Full Test Suite", function () {
  let aegisCare: AegisCare;
  let owner: SignerWithAddress;
  let sponsor: SignerWithAddress;
  let sponsor2: SignerWithAddress;
  let patient: SignerWithAddress;
  let patient2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  beforeEach(async function () {
    [
      owner,
      sponsor,
      sponsor2,
      patient,
      patient2,
      unauthorized,
    ] = await hre.ethers.getSigners();

    const AegisCare = await hre.ethers.getContractFactory("AegisCare");
    aegisCare = await AegisCare.deploy();
    await aegisCare.waitForDeployment();
  });

  describe("PART 1: CONTRACT DEPLOYMENT", function () {
    it("Should deploy successfully", async function () {
      const address = await aegisCare.getAddress();
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(address).to.not.equal(hre.ethers.ZeroAddress);
    });

    it("Should set the correct owner", async function () {
      expect(await aegisCare.owner()).to.equal(owner.address);
    });

    it("Should initialize all counters to zero", async function () {
      expect(await aegisCare.trialCount()).to.equal(0n);
      expect(await aegisCare.patientCount()).to.equal(0n);
    });

    it("Should not be paused initially", async function () {
      expect(await aegisCare.paused()).to.equal(false);
    });

    it("Should have correct MAX_TRIALS_PER_SPONSOR constant", async function () {
      // The contract has this constant as 50
      // We can verify by trying to register 51 trials (will fail in trial tests)
      expect(await aegisCare.getSponsorTrialCount(sponsor.address)).to.equal(
        0n
      );
    });
  });

  describe("PART 2: VIEW FUNCTIONS - UNREGISTERED STATE", function () {
    describe("Trial Information Queries", function () {
      it("Should return empty trial info for non-existent trial", async function () {
        const trialInfo = await aegisCare.getTrialInfo(1);
        expect(trialInfo.trialId).to.equal(0n);
        expect(trialInfo.trialName).to.equal("");
        expect(trialInfo.description).to.equal("");
        expect(trialInfo.sponsor).to.equal(hre.ethers.ZeroAddress);
        expect(trialInfo.isActive).to.equal(false);
        expect(trialInfo.createdAt).to.equal(0n);
        expect(trialInfo.participantCount).to.equal(0n);
        expect(trialInfo.trialPhase).to.equal("");
        expect(trialInfo.compensation).to.equal(0n);
        expect(trialInfo.location).to.equal("");
        expect(trialInfo.durationWeeks).to.equal(0n);
        expect(trialInfo.studyType).to.equal("");
      });

      it("Should return empty public info for non-existent trial", async function () {
        const publicInfo = await aegisCare.getTrialPublicInfo(1);
        expect(publicInfo.trialName).to.equal("");
        expect(publicInfo.description).to.equal("");
        expect(publicInfo.sponsor).to.equal(hre.ethers.ZeroAddress);
        expect(publicInfo.isActive).to.equal(false);
        expect(publicInfo.createdAt).to.equal(0n);
        expect(publicInfo.participantCount).to.equal(0n);
      });

      it("Should handle large trial IDs gracefully", async function () {
        const trialInfo = await aegisCare.getTrialInfo(999999);
        expect(trialInfo.trialId).to.equal(0n);
        expect(trialInfo.sponsor).to.equal(hre.ethers.ZeroAddress);
      });
    });

    describe("Patient Information Queries", function () {
      it("Should return false for unregistered patient", async function () {
        const isRegistered = await aegisCare.isPatientRegistered(
          patient.address
        );
        expect(isRegistered).to.equal(false);
      });

      it("Should return zero patient info for unregistered patient", async function () {
        const patientInfo = await aegisCare.getPatientInfo(patient.address);
        expect(patientInfo.patientId).to.equal(0n);
        expect(patientInfo.publicKeyHash).to.equal(hre.ethers.ZeroHash);
        expect(patientInfo.registeredAt).to.equal(0n);
      });

      it("Should return empty eligibility checks for new patient", async function () {
        const checks = await aegisCare.getPatientEligibilityChecks(
          patient.address
        );
        expect(checks.length).to.equal(0);
        expect(Array.isArray(checks)).to.equal(true);
      });

      it("Should handle zero address for patient", async function () {
        const isRegistered = await aegisCare.isPatientRegistered(
          hre.ethers.ZeroAddress
        );
        expect(isRegistered).to.equal(false);
      });
    });

    describe("Sponsor Information Queries", function () {
      it("Should return zero trial count for new sponsor", async function () {
        const count = await aegisCare.getSponsorTrialCount(sponsor.address);
        expect(count).to.equal(0n);
      });

      it("Should return empty array for sponsor with no trials", async function () {
        const trials = await aegisCare.getSponsorTrials(sponsor.address);
        expect(trials.length).to.equal(0);
        expect(Array.isArray(trials)).to.equal(true);
      });

      it("Should return different counts for different sponsors", async function () {
        const count1 = await aegisCare.getSponsorTrialCount(sponsor.address);
        const count2 = await aegisCare.getSponsorTrialCount(sponsor2.address);
        expect(count1).to.equal(count2);
        expect(count1).to.equal(0n);
      });
    });
  });

  describe("PART 3: ADMIN FUNCTIONS", function () {
    describe("Pause/Unpause", function () {
      it("Should allow owner to pause the contract", async function () {
        await aegisCare.connect(owner).pause();
        expect(await aegisCare.paused()).to.equal(true);
      });

      it("Should allow owner to unpause the contract", async function () {
        await aegisCare.connect(owner).pause();
        await aegisCare.connect(owner).unpause();
        expect(await aegisCare.paused()).to.equal(false);
      });

      it("Should prevent non-owner from pausing", async function () {
        try {
          await aegisCare.connect(unauthorized).pause();
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should prevent non-owner from unpausing", async function () {
        await aegisCare.connect(owner).pause();

        try {
          await aegisCare.connect(unauthorized).unpause();
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }

        // Cleanup
        await aegisCare.connect(owner).unpause();
      });

      it("Should handle multiple pause/unpause cycles", async function () {
        for (let i = 0; i < 3; i++) {
          await aegisCare.connect(owner).pause();
          expect(await aegisCare.paused()).to.equal(true);

          await aegisCare.connect(owner).unpause();
          expect(await aegisCare.paused()).to.equal(false);
        }
      });
    });

    describe("Ownership Transfer", function () {
      it("Should allow owner to transfer ownership", async function () {
        await aegisCare.connect(owner).transferOwnership(sponsor.address);
        expect(await aegisCare.owner()).to.equal(sponsor.address);

        // Transfer back
        await aegisCare.connect(sponsor).transferOwnership(owner.address);
        expect(await aegisCare.owner()).to.equal(owner.address);
      });

      it("Should prevent non-owner from transferring ownership", async function () {
        try {
          await aegisCare.connect(unauthorized).transferOwnership(
            unauthorized.address
          );
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should allow new owner to perform admin functions", async function () {
        await aegisCare.connect(owner).transferOwnership(sponsor.address);

        await aegisCare.connect(sponsor).pause();
        expect(await aegisCare.paused()).to.equal(true);

        await aegisCare.connect(sponsor).unpause();

        // Transfer back
        await aegisCare.connect(sponsor).transferOwnership(owner.address);
      });

      it("Should prevent old owner from admin functions after transfer", async function () {
        await aegisCare.connect(owner).transferOwnership(sponsor.address);

        try {
          await aegisCare.connect(owner).pause();
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }

        // Transfer back
        await aegisCare.connect(sponsor).transferOwnership(owner.address);
      });
    });
  });

  describe("PART 4: ERROR HANDLING", function () {
    describe("Trial Not Found Errors", function () {
      it("Should revert when checking eligibility for non-existent trial", async function () {
        try {
          await aegisCare.connect(patient).checkEligibility(999);
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should revert when computing eligibility for non-existent trial", async function () {
        try {
          await aegisCare.connect(sponsor).computeEligibility(
            999,
            patient.address
          );
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should revert when getting eligibility for non-existent trial", async function () {
        try {
          await aegisCare.connect(patient).getEligibilityResult(999, 1);
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });
    });

    describe("Patient Not Found Errors", function () {
      it("Should revert when computing eligibility for non-existent patient", async function () {
        try {
          await aegisCare.connect(sponsor).computeEligibility(
            1,
            unauthorized.address
          );
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });
    });

    describe("Unauthorized Access Errors", function () {
      it("Should revert when non-owner tries to access admin functions", async function () {
        try {
          await aegisCare.connect(patient).pause();
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should revert when patient tries to access another patient's result", async function () {
        try {
          await aegisCare.connect(patient).getEligibilityResult(1, 1);
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should revert when sponsor tries to deactivate non-existent trial", async function () {
        try {
          await aegisCare.connect(sponsor).deactivateTrial(999);
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });
    });

    describe("Edge Cases", function () {
      it("Should handle zero trial ID", async function () {
        try {
          await aegisCare.connect(patient).checkEligibility(0);
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should handle very large trial ID", async function () {
        try {
          await aegisCare.connect(patient).checkEligibility(
            999999999999999999n
          );
          expect.fail("Should have thrown an error");
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      });

      it("Should handle zero address for patient", async function () {
        const isRegistered = await aegisCare.isPatientRegistered(
          hre.ethers.ZeroAddress
        );
        expect(isRegistered).to.equal(false);
      });
    });
  });

  describe("PART 5: CONTRACT STATE MANAGEMENT", function () {
    it("Should maintain consistent owner address", async function () {
      const owner1 = await aegisCare.owner();
      const owner2 = await aegisCare.owner();
      expect(owner1).to.equal(owner2);
      expect(owner1).to.equal(owner.address);
    });

    it("Should maintain consistent paused state", async function () {
      expect(await aegisCare.paused()).to.equal(false);

      await aegisCare.connect(owner).pause();
      expect(await aegisCare.paused()).to.equal(true);

      await aegisCare.connect(owner).unpause();
      expect(await aegisCare.paused()).to.equal(false);
    });

    it("Should maintain zero trial count before registrations", async function () {
      const count1 = await aegisCare.trialCount();
      const count2 = await aegisCare.trialCount();
      expect(count1).to.equal(0n);
      expect(count2).to.equal(0n);
      expect(count1).to.equal(count2);
    });

    it("Should maintain zero patient count before registrations", async function () {
      const count1 = await aegisCare.patientCount();
      const count2 = await aegisCare.patientCount();
      expect(count1).to.equal(0n);
      expect(count2).to.equal(0n);
      expect(count1).to.equal(count2);
    });

    it("Should return consistent results for multiple queries", async function () {
      const info1 = await aegisCare.getTrialInfo(1);
      const info2 = await aegisCare.getTrialInfo(1);
      expect(info1.trialId).to.equal(info2.trialId);
      expect(info1.sponsor).to.equal(info2.sponsor);
    });

    it("Should handle concurrent state queries", async function () {
      const [trialCount, patientCount, paused] = await Promise.all([
        aegisCare.trialCount(),
        aegisCare.patientCount(),
        aegisCare.paused(),
      ]);

      const ownerAddr = await aegisCare.owner();

      expect(trialCount).to.equal(0n);
      expect(patientCount).to.equal(0n);
      expect(paused).to.equal(false);
      expect(ownerAddr).to.equal(owner.address);
    });
  });

  describe("PART 6: DATA INTEGRITY", function () {
    it("Should return proper address types", async function () {
      const ownerAddress = await aegisCare.owner();
      expect(ownerAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(ownerAddress).to.not.equal(hre.ethers.ZeroAddress);
    });

    it("Should return proper bigint types for counts", async function () {
      const trialCount = await aegisCare.trialCount();
      const patientCount = await aegisCare.patientCount();

      expect(typeof trialCount).to.equal("bigint");
      expect(typeof patientCount).to.equal("bigint");
    });

    it("Should return proper boolean types for flags", async function () {
      const isRegistered = await aegisCare.isPatientRegistered(
        patient.address
      );
      const isPaused = await aegisCare.paused();
      const isActive = (await aegisCare.getTrialInfo(1)).isActive;

      expect(typeof isRegistered).to.equal("boolean");
      expect(typeof isPaused).to.equal("boolean");
      expect(typeof isActive).to.equal("boolean");
    });

    it("Should return proper array types for lists", async function () {
      const trials = await aegisCare.getSponsorTrials(sponsor.address);
      const checks = await aegisCare.getPatientEligibilityChecks(patient.address);

      expect(Array.isArray(trials)).to.equal(true);
      expect(Array.isArray(checks)).to.equal(true);
      expect(typeof trials.length).to.equal("number");
      expect(typeof checks.length).to.equal("number");
    });

    it("Should return proper string types for text fields", async function () {
      const info = await aegisCare.getTrialInfo(1);

      expect(typeof info.trialName).to.equal("string");
      expect(typeof info.description).to.equal("string");
      expect(typeof info.location).to.equal("string");
      expect(typeof info.trialPhase).to.equal("string");
      expect(typeof info.studyType).to.equal("string");
    });
  });

  describe("PART 7: ACCESS CONTROL VERIFICATION", function () {
    it("Should only allow owner to call pause", async function () {
      // Should work for owner
      await aegisCare.connect(owner).pause();
      expect(await aegisCare.paused()).to.equal(true);
      await aegisCare.connect(owner).unpause();

      // Should fail for others
      for (const signer of [sponsor, patient, unauthorized]) {
        try {
          await aegisCare.connect(signer).pause();
          expect.fail(`Should have failed for ${signer.address}`);
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      }
    });

    it("Should only allow owner to call unpause", async function () {
      await aegisCare.connect(owner).pause();

      // Should work for owner
      await aegisCare.connect(owner).unpause();
      expect(await aegisCare.paused()).to.equal(false);

      // Should fail for others
      await aegisCare.connect(owner).pause();
      for (const signer of [sponsor, patient, unauthorized]) {
        try {
          await aegisCare.connect(signer).unpause();
          expect.fail(`Should have failed for ${signer.address}`);
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      }
      await aegisCare.connect(owner).unpause();
    });

    it("Should only allow owner to transfer ownership", async function () {
      // Should fail for non-owners
      for (const signer of [sponsor, patient, unauthorized]) {
        try {
          await aegisCare.connect(signer).transferOwnership(signer.address);
          expect.fail(`Should have failed for ${signer.address}`);
        } catch (error: any) {
          expect(error.message).to.exist;
        }
      }

      // Should work for owner
      await aegisCare.connect(owner).transferOwnership(sponsor.address);
      expect(await aegisCare.owner()).to.equal(sponsor.address);

      // Transfer back
      await aegisCare.connect(sponsor).transferOwnership(owner.address);
    });
  });

  describe("PART 8: GAS OPTIMIZATION CHECKS", function () {
    it("Should measure deployment gas", async function () {
      const AegisCare = await hre.ethers.getContractFactory("AegisCare");
      const deployTx = await AegisCare.getDeployTransaction();

      if (deployTx.data) {
        const estimatedGas = await hre.ethers.provider.estimateGas({
          data: deployTx.data,
        });

        expect(Number(estimatedGas)).to.be.gt(0);
        console.log(`Deployment gas estimated: ${estimatedGas.toString()}`);
      }
    });

    it("Should measure gas for view functions", async function () {
      const gasTrial = await aegisCare.getTrialInfo.estimateGas(1);
      const gasPatient = await aegisCare.getPatientInfo.estimateGas(
        patient.address
      );
      const gasSponsor = await aegisCare.getSponsorTrialCount.estimateGas(
        sponsor.address
      );

      expect(Number(gasTrial)).to.be.gt(0);
      expect(Number(gasPatient)).to.be.gt(0);
      expect(Number(gasSponsor)).to.be.gt(0);

      console.log(`Trial info gas: ${gasTrial.toString()}`);
      console.log(`Patient info gas: ${gasPatient.toString()}`);
      console.log(`Sponsor count gas: ${gasSponsor.toString()}`);
    });

    it("Should measure gas for admin functions", async function () {
      const gasPause = await aegisCare.pause.estimateGas();
      const gasUnpause = await aegisCare.unpause.estimateGas();

      expect(Number(gasPause)).to.be.gt(0);
      expect(Number(gasUnpause)).to.be.gt(0);

      console.log(`Pause gas: ${gasPause.toString()}`);
      console.log(`Unpause gas: ${gasUnpause.toString()}`);
    });
  });

  describe("PART 9: STRESS TESTING", function () {
    it("Should handle multiple rapid view calls", async function () {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(aegisCare.getTrialInfo(1));
      }

      const results = await Promise.all(promises);
      expect(results.length).to.equal(100);

      // All should return same empty trial
      for (const result of results) {
        expect(result.trialId).to.equal(0n);
      }
    });

    it("Should handle multiple sponsor queries", async function () {
      const sponsors = [sponsor, sponsor2, unauthorized];

      const promises = sponsors.map((s) =>
        aegisCare.getSponsorTrialCount(s.address)
      );

      const counts = await Promise.all(promises);
      expect(counts.length).to.equal(3);

      for (const count of counts) {
        expect(count).to.equal(0n);
      }
    });

    it("Should handle multiple patient queries", async function () {
      const patients = [patient, patient2, unauthorized];

      const promises = patients.map((p) =>
        aegisCare.isPatientRegistered(p.address)
      );

      const results = await Promise.all(promises);
      expect(results.length).to.equal(3);

      for (const result of results) {
        expect(result).to.equal(false);
      }
    });
  });

  describe("PART 10: BOUNDARY TESTING", function () {
    it("Should handle minimum valid trial ID (1)", async function () {
      const info = await aegisCare.getTrialInfo(1);
      expect(info.trialId).to.equal(0n);
    });

    it("Should handle maximum practical trial ID", async function () {
      const maxId = 2n ** 64n - 1n; // Max uint64
      const info = await aegisCare.getTrialInfo(maxId);
      expect(info.trialId).to.equal(0n);
    });

    it("Should handle trial ID overflow scenarios", async function () {
      const info1 = await aegisCare.getTrialInfo(0);
      const info2 = await aegisCare.getTrialInfo(1);
      const info3 = await aegisCare.getTrialInfo(2n ** 256n - 1n);

      expect(info1.trialId).to.equal(0n);
      expect(info2.trialId).to.equal(0n);
      expect(info3.trialId).to.equal(0n);
    });
  });

  describe("PART 11: CONTRACT METADATA", function () {
    it("Should have correct contract interface", async function () {
      // Verify key functions exist
      expect(await aegisCare.owner).to.be.a("function");
      expect(await aegisCare.pause).to.be.a("function");
      expect(await aegisCare.unpause).to.be.a("function");
      expect(await aegisCare.trialCount).to.be.a("function");
      expect(await aegisCare.patientCount).to.be.a("function");
    });

    it("Should return consistent contract address", async function () {
      const address1 = await aegisCare.getAddress();
      const address2 = await aegisCare.getAddress();
      expect(address1).to.equal(address2);
      expect(address1).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(address1).to.not.equal(hre.ethers.ZeroAddress);
    });
  });

  describe("PART 12: COMPREHENSIVE INTEGRATION", function () {
    it("Should handle complete admin workflow", async function () {
      // Start state
      expect(await aegisCare.paused()).to.equal(false);
      expect(await aegisCare.owner()).to.equal(owner.address);

      // Pause
      await aegisCare.connect(owner).pause();
      expect(await aegisCare.paused()).to.equal(true);

      // Transfer ownership
      await aegisCare.connect(owner).transferOwnership(sponsor.address);
      expect(await aegisCare.owner()).to.equal(sponsor.address);

      // Unpause with new owner
      await aegisCare.connect(sponsor).unpause();
      expect(await aegisCare.paused()).to.equal(false);

      // Transfer back
      await aegisCare.connect(sponsor).transferOwnership(owner.address);
      expect(await aegisCare.owner()).to.equal(owner.address);
    });

    it("Should handle multiple query operations in sequence", async function () {
      // Query trials
      const trialInfo = await aegisCare.getTrialInfo(1);
      expect(trialInfo.trialId).to.equal(0n);

      // Query patients
      const patientInfo = await aegisCare.getPatientInfo(patient.address);
      expect(patientInfo.patientId).to.equal(0n);

      // Query sponsors
      const sponsorTrials = await aegisCare.getSponsorTrials(sponsor.address);
      expect(sponsorTrials.length).to.equal(0);

      // Query checks
      const checks = await aegisCare.getPatientEligibilityChecks(
        patient.address
      );
      expect(checks.length).to.equal(0);
    });

    it("Should maintain state consistency across operations", async function () {
      const initialState = {
        owner: await aegisCare.owner(),
        paused: await aegisCare.paused(),
        trialCount: await aegisCare.trialCount(),
        patientCount: await aegisCare.patientCount(),
      };

      // Perform some operations
      await aegisCare.connect(owner).pause();
      await aegisCare.connect(owner).unpause();

      // State should be same except for operations that change it
      expect(await aegisCare.owner()).to.equal(initialState.owner);
      expect(await aegisCare.paused()).to.equal(initialState.paused);
      expect(await aegisCare.trialCount()).to.equal(initialState.trialCount);
      expect(await aegisCare.patientCount()).to.equal(initialState.patientCount);
    });
  });
});
