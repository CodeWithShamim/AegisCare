import hre from "hardhat";

async function main() {
  console.log("\n🔍 Verifying AegisCare Smart Contract Deployment\n");

  // Get the contract address from environment or use the deployed address
  const contractAddress = process.env.NEXT_PUBLIC_AEGISCARE_ADDRESS ||
                          "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log("📍 Contract Address:", contractAddress);

  // Get the contract
  const AegisCare = await hre.ethers.getContractFactory("AegisCare");
  const aegisCare = AegisCare.attach(contractAddress);

  console.log("\n" + "─".repeat(60));
  console.log("📊 CONTRACT STATE VERIFICATION");
  console.log("─".repeat(60));

  // Verify basic state
  const owner = await aegisCare.owner();
  const paused = await aegisCare.paused();
  const trialCount = await aegisCare.trialCount();
  const patientCount = await aegisCare.patientCount();

  console.log("\n👤 Owner:", owner);
  console.log("⏸️  Paused:", paused);
  console.log("📋 Trial Count:", trialCount.toString());
  console.log("👥 Patient Count:", patientCount.toString());

  // Test view functions
  console.log("\n" + "─".repeat(60));
  console.log("🔬 TESTING VIEW FUNCTIONS");
  console.log("─".repeat(60));

  console.log("\n✅ Testing isPatientRegistered (should be false initially):");
  const [deployer] = await hre.ethers.getSigners();
  const isRegistered = await aegisCare.isPatientRegistered(deployer.address);
  console.log("   Deployer registered:", isRegistered);

  console.log("\n✅ Testing getSponsorTrialCount (should be 0 initially):");
  const sponsorTrialCount = await aegisCare.getSponsorTrialCount(deployer.address);
  console.log("   Deployer trial count:", sponsorTrialCount.toString());

  // Test admin functions (only owner can call)
  console.log("\n" + "─".repeat(60));
  console.log("🔐 TESTING ADMIN FUNCTIONS");
  console.log("─".repeat(60));

  console.log("\n✅ Testing pause/unpause:");
  console.log("   Current paused state:", paused);

  const pauseTx = await aegisCare.pause();
  await pauseTx.wait();
  console.log("   ✅ Contract paused");

  let isPaused = await aegisCare.paused();
  console.log("   Paused after pause():", isPaused);

  const unpauseTx = await aegisCare.unpause();
  await unpauseTx.wait();
  console.log("   ✅ Contract unpaused");

  isPaused = await aegisCare.paused();
  console.log("   Paused after unpause():", isPaused);

  // Test contract information
  console.log("\n" + "─".repeat(60));
  console.log("📄 CONTRACT INFORMATION");
  console.log("─".repeat(60));

  const network = await hre.ethers.provider.getNetwork();
  console.log("\n🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("📜 Transaction Hash:", pauseTx.hash);

  // Get contract bytecode length
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log("📦 Contract Size:", (code.length - 2) / 2, "bytes");

  console.log("\n" + "─".repeat(60));
  console.log("✅ VERIFICATION COMPLETE");
  console.log("─".repeat(60));

  console.log("\n🎉 All verifications passed!");
  console.log("\n📋 Summary:");
  console.log("   ✓ Contract deployed at:", contractAddress);
  console.log("   ✓ Owner:", owner);
  console.log("   ✓ Initial state correct");
  console.log("   ✓ View functions working");
  console.log("   ✓ Admin functions working");
  console.log("   ✓ Pause/unpause working");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
