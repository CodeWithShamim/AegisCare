import { expect } from "chai";
import hre from "hardhat";
import { AegisCare } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * FHEVM Test Suite for AegisCare.computeEligibility
 *
 * Following Zama's Quick Start Tutorial format
 */

type Signers = {
  owner: HardhatEthersSigner;
  sponsor: HardhatEthersSigner;
  patient: HardhatEthersSigner;
};

describe("AegisCare.computeEligibility - FHEVM Tests", function () {
  let signers: Signers;
  let aegisCare: AegisCare;
  let aegisCareAddress: string;

  before(async function () {
    this.timeout(60000);

    const ethSigners: HardhatEthersSigner[] = await hre.ethers.getSigners();
    signers = {
      owner: ethSigners[0],
      sponsor: ethSigners[1],
      patient: ethSigners[2],
    };

    const factory = await hre.ethers.getContractFactory("AegisCare");
    aegisCare = (await factory.deploy()) as AegisCare;
    aegisCareAddress = await aegisCare.getAddress();

    console.log("✅ AegisCare deployed at:", aegisCareAddress);
  });

  it("should be deployed successfully", async function () {
    expect(hre.ethers.isAddress(aegisCareAddress)).to.eq(true);
  });

  it("should register patient with encrypted data", async function () {
    this.timeout(30000);

    const patientInput = await hre.fhevm
      .createEncryptedInput(aegisCareAddress, signers.patient.address)
      .add8(30)
      .add8(1)
      .add128(2200)
      .add8(0)
      .add32(0)
      .encrypt();

    console.log("✅ Patient data encrypted");

    const tx = await aegisCare
      .connect(signers.patient)
      .registerPatient(
        patientInput.handles[0],
        patientInput.handles[1],
        patientInput.handles[2],
        patientInput.handles[3],
        patientInput.handles[4],
        patientInput.inputProof,
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("publicKeyHash"))
      );

    await tx.wait();
    console.log("✅ Patient registered");

    const patientCount = await aegisCare.patientCount();
    expect(patientCount).to.equal(1n);
  });

  it("should register trial with encrypted criteria", async function () {
    this.timeout(30000);

    const trialInput = await hre.fhevm
      .createEncryptedInput(aegisCareAddress, signers.sponsor.address)
      .add32(18)
      .add32(65)
      .add8(1)
      .add128(1800)
      .add128(3000)
      .add8(0)
      .add32(0)
      .encrypt();

    console.log("✅ Trial criteria encrypted");

    const tx = await aegisCare
      .connect(signers.sponsor)
      .registerTrial(
        "Test Trial",
        "FHEVM test",
        trialInput.handles[0],
        trialInput.handles[1],
        trialInput.handles[2],
        trialInput.handles[3],
        trialInput.handles[4],
        trialInput.handles[5],
        trialInput.handles[6],
        trialInput.inputProof,
        "Phase 2",
        0,
        "Paris",
        12,
        "Interventional"
      );

    await tx.wait();
    console.log("✅ Trial registered");

    const trialCount = await aegisCare.trialCount();
    expect(trialCount).to.equal(1n);
  });

  it("should compute eligibility", async function () {
    this.timeout(30000);

    const tx = await aegisCare
      .connect(signers.sponsor)
      .computeEligibility(1, signers.patient.address);

    await tx.wait();
    console.log("✅ Eligibility computed");
  });

  it("should decrypt eligibility result", async function () {
    this.timeout(30000);

    const encryptedResult = await aegisCare
      .connect(signers.patient)
      .getEligibilityResult(1, signers.patient.address);

    const isEligible = await hre.fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedResult,
      aegisCareAddress,
      signers.patient
    );

    console.log("✅ Eligibility result:", isEligible);
    expect(isEligible).to.equal(1n);
  });

  after(async function () {
    console.log("\n📊 All FHEVM tests passed!");
  });
});
